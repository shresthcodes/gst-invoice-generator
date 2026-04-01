import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import dayjs from 'dayjs';

export default function RemindersPage() {
  const { invoices, showToast } = useInvoiceStore();
  const navigate = useNavigate();
  const [copied, setCopied] = useState('');

  const overdue = invoices.filter(inv =>
    inv.status !== 'Paid' && dayjs(inv.dueDate).isBefore(dayjs())
  ).sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)));

  const dueSoon = invoices.filter(inv =>
    inv.status !== 'Paid' &&
    dayjs(inv.dueDate).isAfter(dayjs()) &&
    dayjs(inv.dueDate).isBefore(dayjs().add(7, 'day'))
  );

  function getOutstanding(inv: typeof invoices[0]) {
    const paid = inv.payments?.reduce((s, p) => s + p.amount, 0) || 0;
    return inv.summary.finalAmount - paid;
  }

  function getWhatsAppMsg(inv: typeof invoices[0]) {
    const outstanding = getOutstanding(inv);
    const daysOverdue = dayjs().diff(dayjs(inv.dueDate), 'day');
    return `Dear ${inv.client.name},\n\nThis is a gentle reminder that Invoice *${inv.invoiceNumber}* for *₹${outstanding.toLocaleString('en-IN')}* was due on ${dayjs(inv.dueDate).format('DD MMM YYYY')} (${daysOverdue} days ago).\n\nKindly arrange the payment at your earliest convenience.\n\nThank you,\n${inv.business.name}`;
  }

  function getEmailMsg(inv: typeof invoices[0]) {
    const outstanding = getOutstanding(inv);
    return `Subject: Payment Reminder - Invoice ${inv.invoiceNumber}\n\nDear ${inv.client.name},\n\nI hope this email finds you well. I wanted to follow up on Invoice ${inv.invoiceNumber} for ₹${outstanding.toLocaleString('en-IN')} which was due on ${dayjs(inv.dueDate).format('DD MMMM YYYY')}.\n\nCould you please let me know when we can expect the payment? If you have any questions about the invoice, please don't hesitate to reach out.\n\nBest regards,\n${inv.business.name}\n${inv.business.phone}\n${inv.business.email}`;
  }

  function copyMsg(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    showToast('Message copied to clipboard');
    setTimeout(() => setCopied(''), 3000);
  }

  const daysOverdueColor = (days: number) => {
    if (days > 30) return 'text-red-600 dark:text-red-400';
    if (days > 14) return 'text-orange-500 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Payment Reminders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track overdue invoices and send reminders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <div className="text-3xl font-black text-red-500">{overdue.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overdue</div>
          <div className="text-xs text-red-400 mt-0.5">₹{overdue.reduce((s, inv) => s + getOutstanding(inv), 0).toLocaleString('en-IN')} pending</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-3xl font-black text-orange-500">{dueSoon.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Due in 7 days</div>
          <div className="text-xs text-orange-400 mt-0.5">₹{dueSoon.reduce((s, inv) => s + getOutstanding(inv), 0).toLocaleString('en-IN')} upcoming</div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-3xl font-black text-gray-900 dark:text-white">
            {invoices.filter(i => i.status !== 'Paid').length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total Unpaid</div>
          <div className="text-xs text-gray-400 mt-0.5">
            ₹{invoices.filter(i => i.status !== 'Paid').reduce((s, inv) => s + getOutstanding(inv), 0).toLocaleString('en-IN')} total
          </div>
        </div>
      </div>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-red-500 mb-3 flex items-center gap-2">
            <span>🔴</span> Overdue Invoices
          </h2>
          <div className="space-y-3">
            {overdue.map(inv => {
              const outstanding = getOutstanding(inv);
              const daysOverdue = dayjs().diff(dayjs(inv.dueDate), 'day');
              return (
                <div key={inv.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
                        <span className={`text-xs font-bold ${daysOverdueColor(daysOverdue)}`}>{daysOverdue} days overdue</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{inv.client.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Due: {dayjs(inv.dueDate).format('DD MMM YYYY')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-red-500">₹{outstanding.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-400">outstanding</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => copyMsg(getWhatsAppMsg(inv), `wa-${inv.id}`)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${copied === `wa-${inv.id}` ? 'bg-green-500 text-white' : 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30'}`}
                    >
                      📱 {copied === `wa-${inv.id}` ? 'Copied!' : 'WhatsApp Message'}
                    </button>
                    <button
                      onClick={() => copyMsg(getEmailMsg(inv), `em-${inv.id}`)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${copied === `em-${inv.id}` ? 'bg-green-500 text-white' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30'}`}
                    >
                      📧 {copied === `em-${inv.id}` ? 'Copied!' : 'Email Template'}
                    </button>
                    <button
                      onClick={() => navigate(`/invoice/${inv.id}/preview`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-orange-500 mb-3 flex items-center gap-2">
            <span>🟡</span> Due in Next 7 Days
          </h2>
          <div className="space-y-3">
            {dueSoon.map(inv => {
              const outstanding = getOutstanding(inv);
              const daysLeft = dayjs(inv.dueDate).diff(dayjs(), 'day');
              return (
                <div key={inv.id} className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-white">{inv.invoiceNumber}</span>
                      <span className="text-xs font-bold text-orange-500">Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{inv.client.name} · {dayjs(inv.dueDate).format('DD MMM YYYY')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">₹{outstanding.toLocaleString('en-IN')}</div>
                  </div>
                  <button
                    onClick={() => copyMsg(getWhatsAppMsg(inv), `wa-soon-${inv.id}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200 transition-colors"
                  >
                    {copied === `wa-soon-${inv.id}` ? '✓ Copied' : '📱 Remind'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {overdue.length === 0 && dueSoon.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-semibold">All caught up!</p>
          <p className="text-sm mt-1">No overdue or upcoming payments</p>
        </div>
      )}
    </div>
  );
}
