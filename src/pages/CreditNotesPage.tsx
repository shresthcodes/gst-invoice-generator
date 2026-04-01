import { useState } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import type { CreditNote } from '../types/invoice';
import { localStorageService } from '../utils/localStorageService';
import { calculateSummary } from '../utils/gstCalculator';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

export default function CreditNotesPage() {
  const { creditNotes, invoices, saveCreditNote, deleteCreditNote, showToast } = useInvoiceStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [reason, setReason] = useState('');

  function handleCreate() {
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) { showToast('Select an invoice', 'error'); return; }
    if (!reason.trim()) { showToast('Reason required', 'error'); return; }
    const cn: CreditNote = {
      id: uuidv4(),
      creditNoteNumber: localStorageService.getNextCreditNoteNumber('CN'),
      originalInvoiceId: inv.id,
      originalInvoiceNumber: inv.invoiceNumber,
      createdAt: dayjs().toISOString(),
      reason,
      items: inv.items,
      summary: calculateSummary(inv.items, inv.taxType, inv.summary.discountType, inv.summary.discountValue),
      business: inv.business,
      client: inv.client,
      taxType: inv.taxType,
      currency: inv.currency || 'INR',
      template: inv.template,
    };
    saveCreditNote(cn);
    showToast(`Credit Note ${cn.creditNoteNumber} created`);
    setShowCreate(false);
    setSelectedInvoiceId('');
    setReason('');
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Credit Notes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For invoice cancellations and returns</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          + New Credit Note
        </button>
      </div>

      {creditNotes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-lg font-semibold">No credit notes</p>
          <p className="text-sm mt-1">Issue credit notes for cancelled or returned invoices</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                {['Credit Note No', 'Against Invoice', 'Client', 'Date', 'Amount', 'Reason', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {creditNotes.map(cn => (
                <tr key={cn.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{cn.creditNoteNumber}</td>
                  <td className="px-5 py-4 text-sm text-indigo-600 dark:text-indigo-400">{cn.originalInvoiceNumber}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{cn.client.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{dayjs(cn.createdAt).format('DD MMM YYYY')}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-red-500">-₹{cn.summary.finalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{cn.reason}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => { deleteCreditNote(cn.id); showToast('Deleted'); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 text-sm">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Create Credit Note</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Against Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => setSelectedInvoiceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">Select invoice...</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.client.name} (₹{inv.summary.finalAmount.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">Reason *</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Goods returned, Service cancelled..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a2e] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
