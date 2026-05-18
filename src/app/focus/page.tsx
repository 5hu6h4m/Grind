'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, RotateCcw, ArrowLeft, Volume2, VolumeX, ShieldAlert, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { 
  playTickSound, 
  playFocusEndSound, 
  playZenBell, 
  playCyberBell, 
  startFocusWhiteNoise, 
  stopFocusWhiteNoise 
} from '@/lib/sound';
import { addFocusSession, getFocusSessions } from '@/app/actions';

interface FocusPreset {
  name: string;
  minutes: number;
  xp: number;
  color: string;
  shadow: string;
}

const PRESETS: FocusPreset[] = [
  { name: 'Deep Work', minutes: 25, xp: 20, color: 'text-neon-cyan border-neon-cyan/20 bg-neon-cyan/5 hover:border-neon-cyan/50', shadow: 'rgba(34,211,238,0.3)' },
  { name: 'LeetCode Grind', minutes: 45, xp: 40, color: 'text-neon-purple border-neon-purple/20 bg-neon-purple/5 hover:border-neon-purple/50', shadow: 'rgba(168,85,247,0.3)' },
  { name: 'Ultimate Focus', minutes: 60, xp: 60, color: 'text-warning border-warning/20 bg-warning/5 hover:border-warning/50', shadow: 'rgba(245,158,11,0.3)' },
];

export default function FocusMode() {
  const [selectedPreset, setSelectedPreset] = useState<FocusPreset>(PRESETS[0]);
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isActive, setIsActive] = useState(false);
  const [chimeType, setChimeType] = useState<'standard' | 'zen' | 'cyber' | 'none'>('zen');
  const [whiteNoiseActive, setWhiteNoiseActive] = useState(false);
  const [dailyFocusSessions, setDailyFocusSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch past sessions to count today's focus stats
  const fetchSessions = async () => {
    try {
      const data = await getFocusSessions();
      setDailyFocusSessions(data);
    } catch (e) {
      console.error('Failed to load focus sessions:', e);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Update timer whenever duration or selected preset changes
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
    }
  }, [duration, isActive]);

  // Main timer tick mechanism
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Haptic feedback standard trigger
  const triggerHaptic = (type: 'light' | 'success' | 'double') => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      if (type === 'light') {
        navigator.vibrate(15);
      } else if (type === 'success') {
        navigator.vibrate([100, 50, 100, 50, 200]);
      } else if (type === 'double') {
        navigator.vibrate([20, 40, 20]);
      }
    }
  };

  // Sound generator based on selected chime style
  const playSelectedChime = () => {
    if (chimeType === 'zen') {
      playZenBell();
    } else if (chimeType === 'cyber') {
      playCyberBell();
    } else if (chimeType === 'standard') {
      playFocusEndSound();
    }
  };

  // Timer complete flow
  const handleTimerComplete = async () => {
    setIsActive(false);
    stopFocusWhiteNoise();
    setWhiteNoiseActive(false);
    triggerHaptic('success');
    playSelectedChime();
    setSaving(true);

    // Calculate XP based on duration
    const xpReward = Math.max(5, Math.round(duration * 0.8));

    try {
      await addFocusSession(duration, xpReward);
      await fetchSessions();
    } catch (e) {
      console.error('Failed to save completed focus session:', e);
    } finally {
      setSaving(false);
      setTimeLeft(duration * 60);
    }
  };

  const toggleTimer = () => {
    triggerHaptic('light');
    playTickSound();
    
    const nextState = !isActive;
    setIsActive(nextState);

    // If starting and white noise is toggled on, start synthesizer
    if (nextState && whiteNoiseActive) {
      startFocusWhiteNoise();
    } else {
      stopFocusWhiteNoise();
    }
  };

  const resetTimer = () => {
    triggerHaptic('double');
    setIsActive(false);
    stopFocusWhiteNoise();
    setTimeLeft(duration * 60);
  };

  const handlePresetSelect = (preset: FocusPreset) => {
    triggerHaptic('light');
    playTickSound();
    setSelectedPreset(preset);
    setDuration(preset.minutes);
    setTimeLeft(preset.minutes * 60);
    setIsActive(false);
    stopFocusWhiteNoise();
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = Number(e.target.value);
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
    stopFocusWhiteNoise();
  };

  const toggleWhiteNoise = () => {
    triggerHaptic('light');
    playTickSound();
    const nextVal = !whiteNoiseActive;
    setWhiteNoiseActive(nextVal);

    if (isActive && nextVal) {
      startFocusWhiteNoise();
    } else {
      stopFocusWhiteNoise();
    }
  };

  // Formats seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // SVG Circular progress metrics
  const totalSeconds = duration * 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeCircumference = 2 * Math.PI * 88; // radius 88
  const strokeDashoffset = strokeCircumference - progressRatio * strokeCircumference;

  // Filter sessions to find today's completed sprints
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysSessions = dailyFocusSessions.filter(
    (s) => new Date(s.createdAt) >= todayStart
  );
  const todaysFocusMins = todaysSessions.reduce((acc, s) => acc + s.duration, 0);
  const todaysFocusXp = todaysSessions.reduce((acc, s) => acc + s.xpEarned, 0);

  return (
    <main className="min-h-screen p-4 md:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center pb-24 relative select-none bg-[#060608] text-zinc-300">
      
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[60vw] h-[60vw] rounded-full bg-neon-cyan/5 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
        {isActive && (
          <div className="absolute inset-0 bg-red-500/[0.01] transition-opacity duration-1000 animate-pulse" />
        )}
      </div>

      {/* Header back button */}
      <Link 
        href="/dashboard" 
        onClick={() => { triggerHaptic('light'); stopFocusWhiteNoise(); }}
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-semibold z-10"
      >
        <ArrowLeft className="w-4.5 h-4.5" />
        <span>Exit Focus Arena</span>
      </Link>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 lg:mt-0">
        
        {/* Left Column: Preset Sprints & Custom Slider */}
        <div className="flex flex-col gap-6 lg:justify-center">
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-cyan" />
              Focus Presets
            </h3>
            <div className="flex flex-col gap-3">
              {PRESETS.map((preset) => {
                const isSelected = selectedPreset.name === preset.name && duration === preset.minutes;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                      isSelected 
                        ? `${preset.color} border-current` 
                        : 'border-white/5 bg-white/[0.005] hover:bg-white/5 text-zinc-400'
                    }`}
                    style={{
                      boxShadow: isSelected ? `0 0 20px ${preset.shadow}` : 'none'
                    }}
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{preset.name}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{preset.minutes} Minutes sprint</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      isSelected ? 'border-current/30 bg-current/10' : 'border-white/10 bg-white/5'
                    }`}>
                      +{preset.xp} XP
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Custom Sprint</h3>
              <span className="text-xs font-bold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2 py-0.5 rounded-md">
                {duration} Min
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="180" 
              value={duration}
              onChange={handleCustomDurationChange}
              className="w-full accent-neon-cyan bg-white/10 h-1.5 rounded-full cursor-pointer focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-medium">
              <span>1 min</span>
              <span>60 min</span>
              <span>120 min</span>
              <span>180 min</span>
            </div>
          </div>
        </div>

        {/* Center Column: Timer & Progress Circle */}
        <div className="flex flex-col items-center justify-center">
          <div className="glass p-10 rounded-[4rem] border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.02)] relative overflow-hidden w-full max-w-sm aspect-square">
            
            <div className="absolute top-0 right-0 w-48 h-48 bg-neon-cyan/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

            {/* Circular Progress Gauge */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle cx="128" cy="128" r="88" className="stroke-white/[0.03]" strokeWidth="6" fill="none" />
                {/* Dynamic Completion Ring */}
                <circle 
                  cx="128" 
                  cy="128" 
                  r="88" 
                  className={`transition-all duration-1000 ease-linear ${
                    isActive ? 'stroke-neon-cyan' : 'stroke-zinc-700'
                  }`} 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={strokeCircumference} 
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round"
                  style={{
                    filter: isActive ? 'drop-shadow(0 0 6px rgba(34,211,238,0.5))' : 'none'
                  }}
                />
              </svg>
              
              {/* Display Screen */}
              <div className="absolute flex flex-col items-center justify-center">
                {isActive && (
                  <span className="text-xs text-zinc-500 font-bold tracking-widest uppercase mb-1.5 animate-pulse">
                    Focus Active
                  </span>
                )}
                <span className="text-5xl font-black tracking-tight text-white leading-none tabular-nums">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium mt-3 border border-white/5 bg-white/[0.02] px-2 py-0.5 rounded">
                  Reward: +{Math.max(5, Math.round(duration * 0.8))} XP
                </span>
              </div>
            </div>

            {/* Actions Trigger panel */}
            <div className="flex gap-4 mt-8 relative z-10">
              <button 
                onClick={toggleTimer}
                disabled={saving}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 ${
                  isActive 
                    ? 'bg-white text-black hover:bg-zinc-200' 
                    : 'bg-neon-cyan text-black hover:bg-cyan-400 shadow-neon-cyan/10'
                }`}
              >
                {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {isActive ? 'Pause Focus' : 'Start Focus'}
              </button>
              
              <button 
                onClick={resetTimer}
                disabled={saving}
                className="flex items-center justify-center w-12 h-12 rounded-full glass border border-white/10 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
                title="Reset Timer"
              >
                <RotateCcw className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Audio Customization & Career Statistics */}
        <div className="flex flex-col gap-6 lg:justify-center">
          
          {/* Sound Synthesizer Controls */}
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-neon-cyan" />
              Sound Customizer
            </h3>
            
            {/* Chime Bell Synthesizer */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2.5">End Chime</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'zen', label: 'Zen Bell' },
                  { id: 'cyber', label: 'Cyber Pulse' },
                  { id: 'standard', label: 'Classic Chime' },
                  { id: 'none', label: 'Silent' },
                ].map((chime) => (
                  <button
                    key={chime.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setChimeType(chime.id as any);
                      // Play test sound
                      if (chime.id === 'zen') playZenBell();
                      if (chime.id === 'cyber') playCyberBell();
                      if (chime.id === 'standard') playFocusEndSound();
                    }}
                    className={`text-xs font-semibold py-2 px-3 rounded-xl border text-center transition-all ${
                      chimeType === chime.id 
                        ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                        : 'border-white/5 bg-white/[0.005] hover:bg-white/5 text-zinc-400'
                    }`}
                  >
                    {chime.label}
                  </button>
                ))}
              </div>
            </div>

            {/* White Noise Toggle */}
            <div className="border-t border-white/5 pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-neon-cyan" />
                  White Noise Engine
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5">Synthesize active pink filter to block ambient sound.</p>
              </div>
              <button
                onClick={toggleWhiteNoise}
                className={`w-10 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                  whiteNoiseActive ? 'bg-neon-cyan' : 'bg-zinc-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  whiteNoiseActive ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Today's Focus Session Stats */}
          <div className="glass p-6 rounded-3xl border border-white/5 bg-white/[0.01] relative overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-warning" />
              Focus Career
            </h3>
            
            {loadingSessions ? (
              <div className="py-6 text-center text-xs text-zinc-500 font-medium">Analyzing records...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 border-r border-white/5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sprints Today</span>
                  <span className="text-2xl font-black text-white">{todaysSessions.length}</span>
                  <span className="text-[9px] text-zinc-500 font-medium mt-1">
                    {todaysFocusMins} Mins deep work
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">XP Earned</span>
                  <span className="text-2xl font-black text-warning">+{todaysFocusXp} XP</span>
                  <span className="text-[9px] text-zinc-500 font-medium mt-1">
                    Level up progress active
                  </span>
                </div>
              </div>
            )}
            
            {/* Warning discipline advice */}
            <div className="mt-4 border-t border-white/5 pt-4 flex gap-2 text-[10px] text-zinc-500 font-medium leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-neon-cyan flex-shrink-0" />
              <span>Strict Mode: Minimizing or closing the browser during Focus sessions halts white noise. Keep focus active.</span>
            </div>
            
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-warning/5 rounded-full blur-2xl pointer-events-none" />
          </div>

        </div>

      </div>

    </main>
  );
}
