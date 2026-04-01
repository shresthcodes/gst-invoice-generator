import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { localStorageService } from '../utils/localStorageService';
import InvoicePreview from '../components/InvoicePreview/InvoicePreview';
import Button from '../components/Common/Button';
import { generatePDF, printAsPDF } from '../utils/pdfGenerator';
import { useInvoiceStore } from '../store/invoiceStore';
import { formatCurrency } from '../utils/invoiceHelpers';
import type { Invoice } from '../types/invoice';
import StatusTimeline from '../components/StatusTimeline';

export default function PreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, updateStatus, duplicateInvoice } = useInvoiceStore();
  const [loading, setLoading] = useState(false);

  const invoice = id ? localStorageService.getInvoiceById(id) : null;

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">😕</div>
        <div className="font-medium">Invoice not found</div>
        <Button className="mt-4" onClick={() => navigate('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  const handleDownload = async () => {
    setLoading(true);
    const fname = `${invoice.invoiceNumber}_${(invoice.client.name || 'invoice').replace(/\s+/g, '_')}.pdf`;
    try {
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));
      await generatePDF('invoice-preview', fname);
      showToast('PDF downloaded!');
    } catch (err) {
      console.warn('html2canvas failed, falling back to print:', err);
      // Fallback: open print dialog — user saves as PDF from browser
      printAsPDF('invoice-preview');
      showToast('Print dialog opened — choose "Save as PDF"', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi ${invoice.client.name},\n\nPlease find your invoice details:\n` +
      `Invoice: ${invoice.invoiceNumber}\n` +
      `Amount: ${formatCurrency(invoice.summary.finalAmount)}\n` +
      `Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}\n\n` +
      `Thank you for your business!`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleDuplicate = () => {
    const copy = duplicateInvoice(invoice.id);
    if (copy) {
      showToast(`Duplicated as ${copy.invoiceNumber}`);
      navigate(`/invoice/${copy.id}/edit`);
    }
  };

  const handleStatusChange = (status: Invoice['status']) => {
    updateStatus(invoice.id, status);
    showToast(`Marked as ${status}`);
    // Reload page to reflect change
    window.location.reload();
  };

  const handleEmailDraft = () => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber} from ${invoice.business.name}`);
    const body = encodeURIComponent(
      `Dear ${invoice.client.name},\n\nPlease find attached invoice ${invoice.invoiceNumber} for ₹${invoice.summary.finalAmount.toLocaleString('en-IN')}.\n\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}\n\n${invoice.terms || ''}\n\nRegards,\n${invoice.business.name}\n${invoice.business.phone || ''}`
    );
    window.open(`mailto:${invoice.client.email || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  const activityLog = invoice.activityLog || [];

  const statusColors = {
    Paid: 'bg-green-100 text-green-700',
    Unpaid: 'bg-red-100 text-red-700',
    Partial: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>← Back</Button>

          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[invoice.status]}`}>{invoice.status}</span>

          <div className="flex-1" />

          {/* Quick status buttons */}
          <div className="flex gap-1">
            {(['Paid', 'Unpaid', 'Partial'] as Invoice['status'][]).filter(s => s !== invoice.status).map(s => (
              <button key={s} onClick={() => handleStatusChange(s)}
                className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Mark {s}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={handleDuplicate}>⧉ Duplicate</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/invoice/${id}/edit`)}>Edit</Button>
          <Button variant="secondary" size="sm" onClick={() => printAsPDF('invoice-preview')}>🖨️ Print</Button>
          <Button variant="secondary" size="sm" onClick={handleWhatsApp}>💬 WhatsApp</Button>
          <Button variant="secondary" size="sm" onClick={handleEmailDraft}>✉️ Email</Button>
          <Button size="sm" onClick={handleDownload} loading={loading}>⬇️ PDF</Button>
        </div>
      </div>

      <div className="flex gap-6 justify-center py-8 bg-gray-100 dark:bg-gray-950 min-h-screen px-4">
        <InvoicePreview invoice={invoice} />

        {/* Activity Log + Status Timeline sidebar */}
        {(activityLog.length > 0 || true) && (
          <div className="no-print w-56 flex-shrink-0 space-y-4">
            <StatusTimeline invoice={invoice} />
            {activityLog.length > 0 && (
              <div className="glass rounded-2xl p-4 sticky top-20">
                <div className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">Activity Log</div>
                <div className="space-y-2">
                  {[...activityLog].reverse().map(entry => (
                    <div key={entry.id} className="text-xs">
                      <div className="text-gray-700 dark:text-gray-300">{entry.action}</div>
                      <div className="text-gray-400">{new Date(entry.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
