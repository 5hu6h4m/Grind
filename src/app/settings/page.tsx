import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Shield, Sparkles, Sliders, Bell, Trash2, User, Key, Palette, AppWindow, ArrowLeft, Volume2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/');
  }

  const user = session.user;

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-6 pb-24 text-zinc-300">
      {/* Back Button */}
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors self-start text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-zinc-500">Manage your account preferences, focus options, and visual workspace.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Navigation Sidebar inside settings */}
        <div className="flex flex-col gap-1 md:sticky md:top-6">
          {[
            { icon: User, label: 'Profile Account', active: true },
            { icon: Palette, label: 'Appearance', active: false },
            { icon: Bell, label: 'Notifications', active: false },
            { icon: Shield, label: 'Security & Privacy', active: false },
          ].map((item, idx) => (
            <button
              key={idx}
              disabled={!item.active}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                item.active 
                  ? 'bg-white/5 text-white border border-white/10 shadow-sm' 
                  : 'text-zinc-500 cursor-not-allowed opacity-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Panels */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white font-semibold">
              <User className="w-5 h-5 text-neon-cyan" />
              <h2>Profile Details</h2>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              {user?.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'User avatar'} 
                  className="w-14 h-14 rounded-full border border-white/10"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <h3 className="text-white font-medium text-lg">{user?.name || 'Warrior'}</h3>
                <p className="text-zinc-500 text-sm">{user?.email || 'No email associated'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Display Name</span>
                <input 
                  type="text" 
                  defaultValue={user?.name || ''} 
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-zinc-400 cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Linked Account</span>
                <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-zinc-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Google Authenticated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col gap-6">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Palette className="w-5 h-5 text-neon-cyan" />
              <h2>Appearance & Workspace</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-white font-medium">Default Heatmap Theme</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Choose your primary color aesthetic across all activity trackers.</p>
                </div>
                <div className="flex gap-2">
                  {['green', 'cyan', 'orange'].map((c) => (
                    <span 
                      key={c} 
                      className={`w-6 h-6 rounded-full border border-white/20 cursor-pointer transition-transform hover:scale-115 ${
                        c === 'green' ? 'bg-emerald-500' :
                        c === 'cyan' ? 'bg-cyan-500' : 'bg-amber-500'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-white font-medium">Soft UI Glow</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Enable smooth glow bubbles in dashboard backgrounds.</p>
                </div>
                <div className="w-10 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center p-0.5 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-md transform translate-x-4 transition-transform" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-white font-medium">Daily Focus Session Reminder</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Receive gentle desktop push notifications to do daily focus mode.</p>
                </div>
                <div className="w-10 h-6 bg-white/10 border border-white/15 rounded-full flex items-center p-0.5 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-zinc-500 shadow-md transform translate-x-0 transition-transform" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-white font-medium">Sound Effects</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Play a sweet reward audio effect when a habit is completed.</p>
                </div>
                <div className="w-10 h-6 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center p-0.5 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-md transform translate-x-4 transition-transform" />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <h3 className="text-white font-medium">Vacation Mode</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">Pause active habit tracking and freeze your streak counts indefinitely.</p>
                </div>
                <div className="w-10 h-6 bg-white/10 border border-white/15 rounded-full flex items-center p-0.5 cursor-pointer">
                  <div className="w-5 h-5 rounded-full bg-zinc-500 shadow-md transform translate-x-0 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.01] flex flex-col gap-6">
            <div className="flex items-center gap-2 text-red-400 font-semibold">
              <Trash2 className="w-5 h-5" />
              <h2>Danger Zone</h2>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-medium">Reset All Activity & Habits</h3>
                <p className="text-zinc-500 text-xs mt-0.5">Permanently delete all your current streak counts, completions, and habits.</p>
              </div>
              <button className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-sm font-semibold transition-all">
                Reset Workspace
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
