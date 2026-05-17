import React from 'react';
import { User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
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
        <div className="w-20 h-20 bg-neon-cyan/20 rounded-full flex items-center justify-center border border-neon-cyan/50 mb-6 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
          <User className="w-10 h-10 text-neon-cyan" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Warrior Profile</h1>
        <p className="text-zinc-400">Your profile settings, themes, and account details will be accessible here.</p>
      </div>
    </main>
  );
}
