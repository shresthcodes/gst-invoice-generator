import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useInvoiceStore();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="no-print sticky top-0 z-40 border-b" style={{ background: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Row 1: Logo + Dark mode */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 sm:hidden">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="GST Invoice" className="w-8 h-8 rounded-xl shadow-md object-cover" />
          <span className="font-black text-sm text-gray-900 dark:text-white">GST Invoice</span>
        </div>
        <button onClick={toggleDarkMode} className="w-8 h-8 rounded-xl flex items-center justify-center text-lg" aria-label="Toggle dark mode">
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Row 2 (mobile) / Single row (desktop) */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 pb-2 sm:py-4">

        {/* Logo — desktop only */}
        <div className="hidden sm:flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="GST Invoice" className="w-10 h-10 rounded-2xl shadow-xl object-cover" />
          <span className="font-black text-base text-gray-900 dark:text-white">GST Invoice</span>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
          <NavLink to="/" end className={({ isActive }) =>
            `text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              isActive ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}>Dashboard</NavLink>

          <NavLink to="/invoice/new" className={({ isActive }) =>
            `text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all flex items-center gap-1 whitespace-nowrap ${
              isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20'
            }`}>
            <span>+</span>Invoice
          </NavLink>

          <NavLink to="/invoices" className={({ isActive }) =>
            `text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all whitespace-nowrap ${
              isActive ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
            }`}>Invoices</NavLink>

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all flex items-center gap-1 whitespace-nowrap"
            >
              More
              <svg className={`w-3 h-3 transition-transform ${moreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {moreOpen && (
              <div
                className="absolute right-0 top-full mt-2 bg-white dark:bg-[#13131f] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl py-2 w-60 z-50 scale-in"
                onMouseLeave={() => setMoreOpen(false)}
              >
                {[
                  { to: '/clients', label: 'Clients', icon: '👥', desc: 'Manage client list' },
                  { to: '/recurring', label: 'Recurring', icon: '🔄', desc: 'Auto-generate invoices' },
                  { to: '/quotations', label: 'Quotations', icon: '📋', desc: 'Quotes & estimates' },
                  { to: '/credit-notes', label: 'Credit Notes', icon: '📝', desc: 'Cancellations & returns' },
                  { to: '/reminders', label: 'Reminders', icon: '🔔', desc: 'Overdue payments' },
                  { to: '/hsn-lookup', label: 'HSN/SAC Lookup', icon: '🔍', desc: 'Find GST codes' },
                  { to: '/expenses', label: 'Expenses', icon: '💸', desc: 'Track business costs' },
                  { to: '/gst-summary', label: 'GST Summary', icon: '📊', desc: 'GSTR-1 ready data' },
                  { to: '/import-export', label: 'Import / Export', icon: '💾', desc: 'Backup & restore' },
                  { to: '/settings', label: 'Settings', icon: '⚙️', desc: 'Business profile' },
                ].map(item => (
                  <NavLink key={item.to} to={item.to} onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl transition-colors ${
                        isActive ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8'
                      }`}>
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dark mode — desktop only */}
        <div className="hidden sm:flex items-center">
          <button onClick={toggleDarkMode} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl hover:scale-105 transition-all" aria-label="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
