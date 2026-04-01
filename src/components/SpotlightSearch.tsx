import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import { formatCurrency, formatDate } from '../utils/invoiceHelpers';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, X } from 'lucide-react';
import type { Invoice } from '../types/invoice';

export default function SpotlightSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { invoices } = useInvoiceStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = query.trim()
    ? invoices.filter((inv: Invoice) =>
        inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        inv.client.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : invoices.slice(0, 5);

  const go = (id: string) => {
    navigate(`/invoice/${id}/preview`);
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleKeyNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(s => (s + 1) % results.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(s => (s - 1 + results.length) % results.length);
      }
      if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        go(results[selectedIndex].id);
      }
    };
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [open, results, selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white dark:bg-[#12121a] rounded-2xl shadow-2xl border border-gray-200/50 dark:border-white/10 overflow-hidden flex flex-col max-h-[70vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Search input header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <Search className="w-5 h-5 text-indigo-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search invoices, clients..."
                className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none text-lg font-medium"
              />
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results body */}
            <div className="overflow-y-auto flex-1 p-2 scroll-smooth">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                  <div className="text-gray-500 dark:text-gray-400 font-medium">No results found for "{query}"</div>
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {query ? 'Search Results' : 'Recent Invoices'}
                  </div>
                  <div className="space-y-1">
                    {results.map((inv: Invoice, idx: number) => (
                      <button
                        key={inv.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => go(inv.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-left ${
                          selectedIndex === idx 
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' 
                            : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                        } border`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm bg-white dark:bg-[#0a0a0f] 
                            ${inv.status === 'Paid' ? 'border-emerald-200 text-emerald-500 dark:border-emerald-500/30' : 
                              inv.status === 'Partial' ? 'border-orange-200 text-orange-500 dark:border-orange-500/30' : 
                              'border-red-200 text-red-500 dark:border-red-500/30'}`}
                          >
                            {inv.client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-bold text-sm transition-colors ${selectedIndex === idx ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
                              {inv.invoiceNumber}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                              {inv.client.name} <span className="mx-1 opacity-50">•</span> {formatDate(inv.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className={`font-black text-sm tracking-tight ${selectedIndex === idx ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                            {formatCurrency(inv.summary.finalAmount)}
                          </div>
                          <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 rounded-md font-bold uppercase tracking-wider ${
                            inv.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                            inv.status === 'Partial' ? 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400' :
                            'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex items-center justify-between text-xs font-medium text-gray-500">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 shadow-sm px-1.5 py-0.5 rounded leading-none">↵</kbd> Select</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 shadow-sm px-1.5 py-0.5 rounded leading-none">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 shadow-sm px-1.5 py-0.5 rounded leading-none">ESC</kbd> Close</span>
              </div>
              <span className="text-indigo-500 font-bold hidden sm:block">GST Invoice Generator</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
