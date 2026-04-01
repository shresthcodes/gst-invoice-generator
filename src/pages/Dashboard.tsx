import { useInvoiceStore } from '../store/invoiceStore';
import { formatCurrency, formatDate, exportToCSV } from '../utils/invoiceHelpers';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import RevenueChart from '../components/RevenueChart';
import { motion } from 'framer-motion';
import { Plus, Download, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { invoices } = useInvoiceStore();
  const navigate = useNavigate();

  const paid = invoices.filter(i => i.status === 'Paid');
  const unpaid = invoices.filter(i => i.status === 'Unpaid');
  const overdue = invoices.filter(i => i.status !== 'Paid' && dayjs().isAfter(dayjs(i.dueDate)));
  const revenue = invoices.reduce((s, i) => s + i.summary.finalAmount, 0);
  const paidRevenue = paid.reduce((s, i) => s + i.summary.finalAmount, 0);
  const unpaidRevenue = unpaid.reduce((s, i) => s + i.summary.finalAmount, 0);
  const recent = [...invoices].slice(0, 5);

  const stats = [
    {
      label: 'Total Revenue', value: formatCurrency(revenue), sub: `${invoices.length} invoices generated`,
      gradient: 'from-indigo-500 to-purple-600', icon: <FileText className="w-5 h-5 text-white" />, glow: 'shadow-indigo-500/20',
    },
    {
      label: 'Collected Status', value: formatCurrency(paidRevenue), sub: `${paid.length} invoices paid`,
      gradient: 'from-emerald-500 to-teal-600', icon: <CheckCircle2 className="w-5 h-5 text-white" />, glow: 'shadow-emerald-500/20',
    },
    {
      label: 'Outstanding Sum', value: formatCurrency(unpaidRevenue), sub: `${unpaid.length} invoices pending`,
      gradient: 'from-orange-500 to-amber-500', icon: <Clock className="w-5 h-5 text-white" />, glow: 'shadow-orange-500/20',
    },
    {
      label: 'Overdue Total', value: formatCurrency(overdue.reduce((s, i) => s + i.summary.finalAmount, 0)), sub: `${overdue.length} invoices overdue`,
      gradient: 'from-red-500 to-rose-600', icon: <AlertCircle className="w-5 h-5 text-white" />, glow: 'shadow-red-500/20',
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-x-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[100px] top-[-100px] right-[-100px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[100px] bottom-[100px] left-[-80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
              {dayjs().format('dddd, MMMM D, YYYY')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {invoices.length > 0 && (
              <button
                onClick={() => exportToCSV(invoices)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Export CSV
              </button>
            )}
            <button
              onClick={() => navigate('/invoice/new')}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all font-medium"
            >
              <Plus className="w-4 h-4" /> New Invoice
            </button>
          </div>
        </motion.div>

        {/* Overdue alert */}
        {overdue.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" onClick={() => navigate('/invoices')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-red-700 dark:text-red-400 text-base">{overdue.length} invoice{overdue.length > 1 ? 's' : ''} overdue</div>
                <div className="text-sm text-red-600/80 dark:text-red-400/80">Require immediate attention. Total: {formatCurrency(overdue.reduce((s, i) => s + i.summary.finalAmount, 0))}</div>
              </div>
            </div>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 hover:underline">
              Resolve now &rarr;
            </span>
          </motion.div>
        )}

        {/* Stats grid */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s) => (
            <motion.div
              variants={itemVariants}
              key={s.label}
              className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg dark:hover:shadow-black/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.gradient} opacity-5 dark:opacity-[0.15] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
              
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.glow} mb-4`}>
                  {s.icon}
                </div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">{s.label}</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{s.value}</div>
                <div className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-2">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard Body */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Revenue Chart */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 bg-white dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Analytics</h2>
            <div className="h-[300px] w-full">
              <RevenueChart invoices={invoices} />
            </div>
          </motion.div>

          {/* Recent Invoices Feed */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 flex flex-col bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
              <button onClick={() => navigate('/invoices')} className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                View all
              </button>
            </div>

            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center text-gray-400 mb-4">
                  <FileText className="w-8 h-8 opacity-50" />
                </div>
                <div className="font-bold text-gray-600 dark:text-gray-300">No invoices yet</div>
                <div className="text-sm font-medium text-gray-400 mt-2 mb-6 max-w-[200px]">Generate your first invoice to start tracking revenue.</div>
                <button
                  onClick={() => navigate('/invoice/new')}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-100 dark:border-indigo-500/20"
                >
                  Create Invoice
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto w-full p-2">
                <div className="space-y-1">
                  {recent.map((inv, idx) => {
                    const isOverdueItem = inv.status !== 'Paid' && dayjs().isAfter(dayjs(inv.dueDate));
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.05) }}
                        key={inv.id}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                        onClick={() => navigate(`/invoice/${inv.id}/preview`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm bg-white dark:bg-[#0a0a0f] 
                            ${inv.status === 'Paid' ? 'border-emerald-200 text-emerald-500 dark:border-emerald-500/30' : 
                              isOverdueItem ? 'border-red-200 text-red-500 dark:border-red-500/30' : 
                              'border-orange-200 text-orange-500 dark:border-orange-500/30'}`}
                          >
                            {inv.client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                              {inv.client.name}
                              {isOverdueItem && <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Overdue</span>}
                            </div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                              {inv.invoiceNumber} <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"/> {formatDate(inv.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{formatCurrency(inv.summary.finalAmount)}</div>
                          <span className={`inline-block text-[10px] px-2 py-0.5 mt-1 rounded-md font-bold uppercase tracking-wider ${
                            inv.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                            inv.status === 'Partial' ? 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400' :
                            'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
