import React from 'react';
import { Activity } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen p-6 md:p-10 max-w-7xl mx-auto flex flex-col items-center justify-center pb-24">
      <div className="glass p-12 rounded-[3rem] border border-border flex flex-col items-center text-center max-w-lg">
        <div className="w-20 h-20 bg-neon-purple/20 rounded-full flex items-center justify-center border border-neon-purple/50 mb-6 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <Activity className="w-10 h-10 text-neon-purple" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Analytics Engine</h1>
        <p className="text-zinc-400">Your data is being collected in the new SQLite database. Detailed charts and weekly insights will appear here once you build up a 7-day streak.</p>
      </div>
    </main>
  );
}
