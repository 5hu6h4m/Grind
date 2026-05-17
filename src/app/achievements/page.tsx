import React from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AchievementsPage() {
  return (
    <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center pb-24 relative">
      {/* Back Button */}
      <Link 
        href="/dashboard" 
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>
      <div className="glass p-12 rounded-[3rem] border border-border flex flex-col items-center text-center max-w-lg">
        <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center border border-warning/50 mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <Trophy className="w-10 h-10 text-warning" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Achievements Blocked</h1>
        <p className="text-zinc-400">Keep grinding! Achievements will unlock automatically as you gain XP and build your streaks in the Dashboard.</p>
      </div>
    </main>
  );
}
