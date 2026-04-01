import { useRef } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { localStorageService } from '../utils/localStorageService';

export default function ImportExportPage() {
  const { invoices, expenses, savedClients, loadAll, showToast } = useInvoiceStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = localStorageService.importBackup(ev.target?.result as string);
      if (result.success) {
        loadAll();
        showToast(result.message);
      } else {
        showToast(result.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const cards = [
    {
      icon: '📦',
      title: 'Export Full Backup (JSON)',
      desc: 'All invoices, clients, expenses, quotations, credit notes — everything',
      action: () => { localStorageService.exportBackup(); showToast('Backup downloaded'); },
      btnLabel: 'Download Backup',
      btnClass: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
    },
    {
      icon: '📊',
      title: 'Export Invoices (CSV)',
      desc: 'Spreadsheet-friendly format for Excel / Google Sheets',
      action: () => { localStorageService.exportCSV(); showToast('CSV downloaded'); },
      btnLabel: 'Download CSV',
      btnClass: 'bg-gradient-to-r from-green-500 to-teal-600 text-white',
    },
    {
      icon: '📥',
      title: 'Import Backup (JSON)',
      desc: 'Restore from a previously exported backup file',
      action: () => fileRef.current?.click(),
      btnLabel: 'Choose File',
      btnClass: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Import / Export</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Backup your data or migrate to another device</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Invoices', count: invoices.length, icon: '🧾' },
          { label: 'Clients', count: savedClients.length, icon: '👥' },
          { label: 'Expenses', count: expenses.length, icon: '💸' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{s.count}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(card => (
          <div key={card.title} className="glass rounded-2xl p-6 flex flex-col">
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-1 mb-5">{card.desc}</p>
            <button
              onClick={card.action}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 ${card.btnClass}`}
            >
              {card.btnLabel}
            </button>
          </div>
        ))}
      </div>

      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

      <div className="mt-8 glass rounded-2xl p-5">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">⚠️ Important Notes</h3>
        <ul className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400">
          <li>• Importing a backup will <strong className="text-gray-700 dark:text-gray-300">overwrite</strong> existing data</li>
          <li>• Export a backup before importing to avoid data loss</li>
          <li>• Data is stored locally in your browser — clearing browser data will delete it</li>
          <li>• CSV export is for reference only and cannot be re-imported</li>
        </ul>
      </div>
    </div>
  );
}
