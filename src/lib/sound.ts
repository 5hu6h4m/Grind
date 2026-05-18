/**
 * Synthetic premium sound effects using the Web Audio API.
 * This avoids any network requests, eliminating 404 errors, and works instantly.
 */

// Helper to get or create an AudioContext safely
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
}

/**
 * Plays a sleek, tactile futuristic cyber-click sound when completing a habit.
 */
export function playTickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Crisp high-frequency cyber-click/tick
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    // Rapid exponential decay for a clean, short tick feel
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    // Graceful fallback for browser audio block policy
    console.debug('Failed to play synthetic tick sound:', e);
  }
}

/**
 * Plays a calm, zen-like futuristic chime sound when Focus Mode timer finishes.
 */
export function playFocusEndSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // We will play a chord (C5, E5, G5) to make a premium, rich notification bell
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      // Slight delay for each note to make a beautiful arpeggio chord chime
      const noteStart = now + index * 0.08;
      
      osc.frequency.setValueAtTime(freq, noteStart);
      
      // Gentle exponential volume decay
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(noteStart);
      osc.stop(noteStart + 1.25);
    });
  } catch (e) {
    console.debug('Failed to play synthetic chime sound:', e);
  }
}

export function playZenBell() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const frequencies = [261.63, 329.63, 392.00, 523.25];
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.04, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 2.1);
    });
  } catch (e) {
    console.debug('Failed to play zen bell:', e);
  }
}

export function playCyberBell() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.debug('Failed to play cyber bell:', e);
  }
}

let noiseSource: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;

export function startFocusWhiteNoise() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Stop any existing first
    stopFocusWhiteNoise();

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);

    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start();
  } catch (e) {
    console.debug('Failed to start focus white noise:', e);
  }
}

export function stopFocusWhiteNoise() {
  try {
    if (noiseSource) {
      noiseSource.stop();
      noiseSource.disconnect();
      noiseSource = null;
    }
    if (noiseGain) {
      noiseGain.disconnect();
      noiseGain = null;
    }
  } catch (e) {
    console.debug('Failed to stop white noise:', e);
  }
}

