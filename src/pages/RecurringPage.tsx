import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import type { RecurringInvoice } from '../types/invoice';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const FREQ_LABELS = { weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Yearly' };

export default function RecurringPage() {
  const { recurringInvoices, invoices, saveRecurringInvoice, deleteRecurringInvoice, duplicateInvoice, showToast } = useInvoiceStore();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [frequency, setFrequency] = useState<RecurringInvoice['frequency']>('monthly');
  const [nextDueDate, setNextDueDate] = useState(dayjs().add(1, 'month').format('YYYY-MM-DD'));

  function handleAdd() {
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) { showToast('Select an invoice', 'error'); return; }
    const r: RecurringInvoice = {
      id: uuidv4(),
      templateInvoiceId: selectedInvoiceId,
      frequency,
      nextDueDate,
      lastGeneratedDate: null,
      active: true,
      clientName: inv.client.name,
      amount: inv.summary.finalAmount,
      description: `${inv.invoiceNumber} - ${inv.client.name}`,
    };
    saveRecurringInvoice(r);
    showToast('Recurring invoice set up');
    setShowAdd(false);
  }

  function handleGenerate(r: RecurringInvoice) {
    const newInv = duplicateInvoice(r.templateInvoiceId);
    if (!newInv) { showToast('Template invoice not found', 'error'); return; }
    const freqMap = { weekly: [1, 'week'], monthly: [1, 'month'], quarterly: [3, 'month'], yearly: [1, 'year'] } as const;
    const [amt, unit] = freqMap[r.frequency];
    const updated: RecurringInvoice = {
      ...r,
      lastGeneratedDate: dayjs().toISOString(),
      nextDueDate: dayjs(r.nextDueDate).add(amt as number, unit as dayjs.ManipulateType).format('YYYY-MM-DD'),
    };
    saveRecurringInvoice(updated);
    showToast(`Invoice ${newInv.invoiceNumber} generated`);
    navigate(`/invoice/${newInv.id}/edit`);
  }

  function toggleActive(r: RecurringInvoice) {
    saveRecurringInvoice({ ...r, active: !r.active });
  }

  const isDue = (r: RecurringInvoice) => dayjs(r.nextDueDate).isBefore(dayjs().add(1, 'day'));

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Recurring Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Auto-generate invoices on schedule</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          + New Schedule
        </button>
      </div>

      {recurringInvoices.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔄</div>
          <p className="text-lg font-semibold">No recurring invoices</p>
          <p className="text-sm mt-1">Set up a schedule to auto-generate invoices</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurringInvoices.map(r => (
            <div key={r.id} className={`glass rounded-2xl p-5 flex items-center gap-4 ${!r.active ? 'opacity-50' : ''}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDue(r) && r.active ? 'bg-orange-100 dark:bg-orange-500/20' : 'bg-indigo-100 dark:bg-indigo-500/20'}`}>
                {isDue(r) && r.active ? '⚠️' : '🔄'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-white truncate">{r.clientName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {FREQ_LABELS[r.frequency]} · Next: {dayjs(r.nextDueDate).format('DD MMM YYYY')}
                  {r.lastGeneratedDate && ` · Last: ${dayjs(r.lastGeneratedDate).format('DD MMM YYYY')}`}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-white">₹{r.amount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-400">{FREQ_LABELS[r.frequency]}</div>
              </div>
              <div className="flex items-center gap-2">
                {isDue(r) && r.active && (
                  <button
                    onClick={() => handleGenerate(r)}
                    className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors"
                  >
                    Generate Now
                  </button>
                )}
                <button
                  onClick={() => toggleActive(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${r.active ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}
                >
                  {r.active ? 'Active' : 'Paused'}
                </button>
                <button onClick={() => { deleteRecurringInvoice(r.id); showToast('Deleted'); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 text-sm">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Set Up Recurring Invoice</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Template Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">Select invoice...</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as RecurringInvoice['frequency'])}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">First Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={e => setNextDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold">Create Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
