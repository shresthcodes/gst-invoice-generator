import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/45 hover:-translate-y-0.5 active:translate-y-0 border border-indigo-400/20',
  secondary: 'glass border border-gray-200/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/8 hover:-translate-y-0.5 active:translate-y-0',
  danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/45 hover:-translate-y-0.5 active:translate-y-0',
  ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2',
};

export default function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      {children}
    </button>
  );
}
