import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import dayjs from 'dayjs';

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400',
  Sent: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  Accepted: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  Rejected: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  Converted: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
};

export default function QuotationsPage() {
  const { quotations, deleteQuotation, convertQuotationToInvoice, saveQuotation, showToast } = useInvoiceStore();
  const navigate = useNavigate();

  function handleConvert(id: string) {
    const inv = convertQuotationToInvoice(id);
    if (inv) {
      showToast(`Invoice ${inv.invoiceNumber} created`);
      navigate(`/invoice/${inv.id}/edit`);
    }
  }

  function handleStatusChange(id: string, status: string) {
    const q = quotations.find(x => x.id === id);
    if (!q) return;
    saveQuotation({ ...q, status: status as any });
    showToast('Status updated');
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Quotations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quotations.length} quotations</p>
        </div>
        <button
          onClick={() => navigate('/quotation/new')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          + New Quotation
        </button>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-semibold">No quotations yet</p>
          <p className="text-sm mt-1">Create a quote before sending an invoice</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                {['Quote No', 'Client', 'Date', 'Valid Until', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">{q.quotationNumber}</td>
                  <td className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">{q.client.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{dayjs(q.createdAt).format('DD MMM YYYY')}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className={dayjs(q.validUntil).isBefore(dayjs()) && q.status !== 'Converted' ? 'text-red-500' : ''}>
                      {dayjs(q.validUntil).format('DD MMM YYYY')}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{q.summary.finalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={q.status}
                      onChange={e => handleStatusChange(q.id, e.target.value)}
                      disabled={q.status === 'Converted'}
                      className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${STATUS_COLORS[q.status]} focus:outline-none`}
                    >
                      {['Draft', 'Sent', 'Accepted', 'Rejected'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      {q.status === 'Converted' && <option value="Converted">Converted</option>}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {q.status === 'Accepted' && (
                        <button
                          onClick={() => handleConvert(q.id)}
                          className="px-3 py-1 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
                        >
                          → Invoice
                        </button>
                      )}
                      {q.status === 'Converted' && q.convertedInvoiceId && (
                        <button
                          onClick={() => navigate(`/invoice/${q.convertedInvoiceId}/preview`)}
                          className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 text-xs font-semibold"
                        >
                          View Invoice
                        </button>
                      )}
                      <button
                        onClick={() => { deleteQuotation(q.id); showToast('Deleted'); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
