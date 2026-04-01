import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import type { SavedClient } from '../types/invoice';
import { v4 as uuidv4 } from 'uuid';

const EMPTY: SavedClient = { id: '', name: '', gstin: '', address: '', city: '', state: '', stateCode: '', phone: '', email: '' };

export default function ClientsPage() {
  const { savedClients, invoices, saveClient, deleteClient, showToast } = useInvoiceStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<SavedClient | null>(null);
  const [search, setSearch] = useState('');

  const filtered = savedClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.gstin.toLowerCase().includes(search.toLowerCase())
  );

  function getClientStats(clientName: string) {
    const clientInvoices = invoices.filter(inv => inv.client.name === clientName);
    const total = clientInvoices.reduce((s, inv) => s + inv.summary.finalAmount, 0);
    const outstanding = clientInvoices
      .filter(inv => inv.status !== 'Paid')
      .reduce((s, inv) => {
        const paid = inv.payments?.reduce((p, pay) => p + pay.amount, 0) || 0;
        return s + (inv.summary.finalAmount - paid);
      }, 0);
    return { count: clientInvoices.length, total, outstanding };
  }

  function handleSave() {
    if (!editing) return;
    if (!editing.name.trim()) { showToast('Client name required', 'error'); return; }
    saveClient({ ...editing, id: editing.id || uuidv4() });
    showToast('Client saved');
    setEditing(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Clients</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{savedClients.length} clients saved</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all"
        >
          + Add Client
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search clients..."
        className="w-full mb-6 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-lg font-semibold">No clients yet</p>
          <p className="text-sm mt-1">Add your first client to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(client => {
            const stats = getClientStats(client.name);
            return (
              <div key={client.id} className="glass rounded-2xl p-5 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {client.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditing(client)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 text-sm">✏️</button>
                    <button onClick={() => { deleteClient(client.id); showToast('Client deleted'); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 text-sm">🗑️</button>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{client.name}</h3>
                {client.gstin && <p className="text-xs text-gray-400 mt-0.5">GSTIN: {client.gstin}</p>}
                {client.email && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{client.email}</p>}
                {client.phone && <p className="text-xs text-gray-500 dark:text-gray-400">{client.phone}</p>}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{stats.count}</div>
                    <div className="text-[10px] text-gray-400">Invoices</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">₹{stats.total.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-gray-400">Total Billed</div>
                  </div>
                  <div>
                    <div className={`text-sm font-bold ${stats.outstanding > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      ₹{stats.outstanding.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-gray-400">Outstanding</div>
                  </div>
                </div>

                {stats.count > 0 && (
                  <button
                    onClick={() => navigate('/invoices')}
                    className="mt-3 w-full text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View invoices →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Add Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
              {editing.id ? 'Edit Client' : 'Add Client'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: 'Name *', full: true },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'gstin', label: 'GSTIN' },
                { key: 'address', label: 'Address', full: true },
                { key: 'city', label: 'City' },
                { key: 'state', label: 'State' },
                { key: 'stateCode', label: 'State Code' },
              ].map(({ key, label, full }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">{label}</label>
                  <input
                    value={(editing as any)[key]}
                    onChange={e => setEditing({ ...editing, [key]: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
