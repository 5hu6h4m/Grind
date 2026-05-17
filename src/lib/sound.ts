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
