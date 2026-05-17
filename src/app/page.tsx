import React from 'react';
import { Zap } from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-[#060608] text-zinc-300 flex items-center justify-center font-sans selection:bg-emerald-500/20 relative overflow-hidden">
      {/* Premium Minimal Glow Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-emerald-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-neon-purple/10 blur-[130px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-white/10">
            <Zap className="h-9 w-9 text-white animate-pulse" fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Grind</h1>
            <p className="text-zinc-500 text-sm max-w-xs font-light">Your minimal, high-performance discipline sanctuary.</p>
          </div>
        </div>

        {/* Auth Glass Card */}
        <div className="w-full glass rounded-[2.5rem] p-8 md:p-10 border border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden text-center flex flex-col gap-8">
          {/* Top border ambient line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div>
            <h2 className="text-xl font-semibold text-white mb-1.5">Enter the Arena</h2>
            <p className="text-xs text-zinc-500">Log in to track habits, streaks, and focus times.</p>
          </div>

          <div className="flex flex-col gap-4">
            <LoginButton />
          </div>

          <div className="text-[11px] text-zinc-600 leading-relaxed max-w-[250px] mx-auto">
            By continuing, you agree to our <br/>
            <span className="text-zinc-400">Terms of Service</span> and <span className="text-zinc-400">Privacy Policy</span>.
          </div>
        </div>

        {/* Minimal Footer Badges */}
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-600 tracking-wider uppercase">
          <span>Consistency</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>XP System</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>Heatmaps</span>
        </div>
      </div>
    </main>
  );
}
