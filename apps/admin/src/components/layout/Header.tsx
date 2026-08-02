import React from 'react';
import { LogOut, Shield, Menu, Moon, Sun } from 'lucide-react';
import { useAdminAuth } from '../../features/auth/useAdminAuth';

export function Header() {
  const { user, signOut } = useAdminAuth();
  
  // Theme toggle will be implemented later, just a placeholder for now
  const [isDark, setIsDark] = React.useState(true);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            setIsDark(!isDark);
            document.documentElement.classList.toggle('dark');
          }}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <Shield size={14} className="text-emerald-500 dark:text-emerald-400" />
          <span>Admin ({user?.phone || 'Logged In'})</span>
        </div>

        <button
          onClick={signOut}
          title="Sign Out"
          className="p-2 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-600/20 hover:text-red-600 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
