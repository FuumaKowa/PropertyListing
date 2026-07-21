import React from 'react';
import { Home, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface NavbarProps {
  currentTab: 'client' | 'admin';
  onChangeTab: (tab: 'client' | 'admin') => void;
  inquiryCount: number;
}

export default function Navbar({ currentTab, onChangeTab, inquiryCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onChangeTab('client')}>
          <Logo className="h-10 sm:h-12 w-auto transition-all group-hover:scale-[1.02]" showText={true} />
        </div>

        {/* Navigation Controls */}
        <nav className="flex items-center gap-2">
          {/* Client Tab */}
          <button
            onClick={() => onChangeTab('client')}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'client'
                ? 'text-blue-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {currentTab === 'client' && (
              <motion.span
                layoutId="active-tab"
                className="absolute inset-0 rounded-lg bg-blue-50 border border-blue-100/50 -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Browse Properties</span>
            <span className="sm:hidden">Browse</span>
          </button>

          {/* Admin Tab */}
          <button
            onClick={() => onChangeTab('admin')}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'admin'
                ? 'text-blue-700 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {currentTab === 'admin' && (
              <motion.span
                layoutId="active-tab"
                className="absolute inset-0 rounded-lg bg-blue-50 border border-blue-100/50 -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Admin Dashboard</span>
            <span className="sm:hidden font-medium">Admin</span>
            {inquiryCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse ml-0.5">
                {inquiryCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
