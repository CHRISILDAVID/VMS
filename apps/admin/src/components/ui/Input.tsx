import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          disabled={disabled}
          className={`block w-full rounded-md border bg-white dark:bg-slate-800 text-slate-900 dark:text-white 
            ${disabled ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed' : ''} 
            ${error ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} 
            py-2 px-3 shadow-sm sm:text-sm focus:outline-none focus:ring-1 transition-colors ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
