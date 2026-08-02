import React from 'react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    error: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
      {children}
    </span>
  );
}
