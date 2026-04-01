import React from 'react';

const baseInput = 'w-full rounded-xl border border-gray-200/60 dark:border-white/10 px-3 py-2 text-sm bg-white/70 dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all backdrop-blur-sm';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>}
      <input {...props} className={`${baseInput} ${error ? 'border-red-400 dark:border-red-500' : ''} ${className}`} />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>}
      <select {...props} className={`${baseInput} ${error ? 'border-red-400' : ''} ${className}`}>
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>}
      <textarea {...props} className={`${baseInput} resize-none ${className}`} />
    </div>
  );
}
