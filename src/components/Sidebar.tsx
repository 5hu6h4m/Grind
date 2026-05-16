'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, Activity, Zap, Trophy, User, Settings, LogOut } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Habits', href: '/habits', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Focus Mode', href: '/focus', icon: Zap },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card/50 glass hidden md:flex flex-col">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Zap className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Grind</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-colors", 
                  isActive ? "text-neon-purple" : "text-zinc-500 group-hover:text-neon-purple/70"
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <Link
          href="/settings"
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/5 hover:text-white"
        >
          <Settings className="h-5 w-5 text-zinc-500 group-hover:text-zinc-300" />
          Settings
        </Link>
        <button
          className="group mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-5 w-5 text-zinc-500 group-hover:text-danger/80" />
          Logout
        </button>
      </div>
    </aside>
  );
}
