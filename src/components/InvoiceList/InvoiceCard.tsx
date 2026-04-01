import type { Invoice } from '../../types/invoice';
import { formatCurrency, formatDate } from '../../utils/invoiceHelpers';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../../store/invoiceStore';
import dayjs from 'dayjs';

interface Props {
  invoice: Invoice;
  onDelete: (id: string) => void;
}

const statusConfig = {
  Paid: { cls: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Unpaid: { cls: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  Partial: { cls: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
};

export default function InvoiceCard({ invoice, onDelete }: Props) {
  const navigate = useNavigate();
  const { duplicateInvoice, updateStatus, showToast } = useInvoiceStore();

  const isOverdue = invoice.status !== 'Paid' && dayjs().isAfter(dayjs(invoice.dueDate));
  const paidAmount = (invoice.payments || []).reduce((s, p) => s + p.amount, 0);
  const balanceDue = invoice.summary.finalAmount - paidAmount;
  const sc = statusConfig[invoice.status];

  const handleDuplicate = () => {
    const copy = duplicateInvoice(invoice.id);
    if (copy) { showToast(`Duplicated as ${copy.invoiceNumber}`); navigate(`/invoice/${copy.id}/edit`); }
  };

  return (
    <div className={`relative glass rounded-2xl p-4 card-hover overflow-hidden ${isOverdue ? 'ring-1 ring-red-400/40' : ''}`}>
      {/* Top gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
        invoice.status === 'Paid' ? 'from-emerald-400 to-teal-500' :
        isOverdue ? 'from-red-400 to-rose-500' :
        'from-indigo-400 to-purple-500'
      }`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-sm text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[130px]">
            {invoice.client.name || 'No client'}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isOverdue && (
            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">OVERDUE</span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${sc.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs text-gray-400">{formatDate(invoice.createdAt)}</div>
        <div className="font-black text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {formatCurrency(invoice.summary.finalAmount)}
        </div>
      </div>

      {invoice.status === 'Partial' && paidAmount > 0 && (
        <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
          Balance: {formatCurrency(balanceDue)}
        </div>
      )}

      {/* Quick status */}
      <select
        value={invoice.status}
        onChange={e => { updateStatus(invoice.id, e.target.value as Invoice['status']); showToast('Status updated'); }}
        className="w-full text-xs rounded-xl border border-gray-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-2 py-1.5 mb-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
        onClick={e => e.stopPropagation()}
      >
        <option value="Unpaid">Mark Unpaid</option>
        <option value="Paid">Mark Paid</option>
        <option value="Partial">Mark Partial</option>
      </select>

      {/* Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={() => navigate(`/invoice/${invoice.id}/preview`)}
          className="flex-1 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl py-1.5 font-semibold hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          View
        </button>
        <button
          onClick={() => navigate(`/invoice/${invoice.id}/edit`)}
          className="flex-1 text-xs glass rounded-xl py-1.5 font-semibold text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
        >
          Edit
        </button>
        <button
          onClick={handleDuplicate}
          title="Duplicate"
          className="text-xs glass rounded-xl px-2 py-1.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          ⧉
        </button>
        <button
          onClick={() => onDelete(invoice.id)}
          title="Delete"
          className="text-xs glass rounded-xl px-2 py-1.5 text-gray-400 hover:text-red-500 transition-colors"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
