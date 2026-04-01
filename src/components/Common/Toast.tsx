import { useInvoiceStore } from '../../store/invoiceStore';

const config = {
  success: { gradient: 'from-emerald-500 to-teal-600', icon: '✓' },
  error: { gradient: 'from-red-500 to-rose-600', icon: '✕' },
  info: { gradient: 'from-indigo-500 to-purple-600', icon: 'ℹ' },
};

export default function Toast() {
  const { toast, clearToast } = useInvoiceStore();
  if (!toast) return null;

  const c = config[toast.type];

  return (
    <div
      className="fixed bottom-6 right-6 z-50 toast-slide"
      onClick={clearToast}
    >
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl bg-gradient-to-r ${c.gradient} cursor-pointer hover:scale-105 transition-transform`}>
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
          {c.icon}
        </div>
        <span className="text-sm font-medium">{toast.message}</span>
        <button className="text-white/60 hover:text-white ml-1 text-lg leading-none">×</button>
      </div>
    </div>
  );
}
