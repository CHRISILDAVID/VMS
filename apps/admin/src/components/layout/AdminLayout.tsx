import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAdminAuth } from '../../features/auth/useAdminAuth';
import LoginScreen from '../../features/auth/LoginScreen';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';

export function AdminLayout() {
  const { session, isLoading: authLoading } = useAdminAuth();

  // Handle dark mode initial state
  useEffect(() => {
    // If we want default dark mode, add class to HTML
    document.documentElement.classList.add('dark');
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
