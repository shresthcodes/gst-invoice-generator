import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useInvoiceStore();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 ${
      isActive
        ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-white/5'
    }`;

  return (
    <nav className="no-print sticky top-0 z-40 bg-white/95 dark:bg-[#080812]/95 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/8 px-6 py-4">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo — bigger */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <img
            src="/logo.png"
            alt="GST Invoice"
            className="w-12 h-12 rounded-2xl shadow-xl shadow-purple-500/20 group-hover:shadow-purple-500/40 group-hover:scale-105 transition-all object-cover"
          />
          <div>
            <div className="font-black text-base text-gray-900 dark:text-white leading-tight">GST Invoice</div>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>

          {/* New Invoice — special CTA style */}
          <NavLink to="/invoice/new" className={({ isActive }) =>
            `text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-200/50 dark:border-indigo-500/20'
            }`
          }>
            <span className="text-base leading-none">+</span>
            New Invoice
          </NavLink>

          <NavLink to="/invoices" className={linkClass}>Invoices</NavLink>

          {/* More dropdown */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="text-sm font-semibold px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all flex items-center gap-1.5"
            >
              More
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {moreOpen && (
              <div
                className="absolute right-0 top-full mt-2 bg-white dark:bg-[#13131f] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/15 dark:shadow-black/60 py-2 w-60 z-50 scale-in"
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
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8'
                      }`
                    }
                  >
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="w-11 h-11 rounded-xl glass flex items-center justify-center text-xl transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
}
