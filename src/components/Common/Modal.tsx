import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl shadow-2xl p-6 max-w-md w-full fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
