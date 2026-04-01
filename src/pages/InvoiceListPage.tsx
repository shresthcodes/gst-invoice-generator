import { useState } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import InvoiceCard from '../components/InvoiceList/InvoiceCard';
import Filters from '../components/InvoiceList/Filters';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import { useNavigate } from 'react-router-dom';
import { exportToCSV } from '../utils/invoiceHelpers';
import type { Invoice } from '../types/invoice';

export default function InvoiceListPage() {
  const { invoices, deleteInvoice, updateStatus, showToast } = useInvoiceStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<Invoice['status']>('Paid');

  const filtered = invoices
    .filter(inv => {
      const q = search.toLowerCase();
      return (!q || inv.client.name.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q))
        && (!status || inv.status === status);
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'amount-desc') return b.summary.finalAmount - a.summary.finalAmount;
      return a.summary.finalAmount - b.summary.finalAmount;
    });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(filtered.map(i => i.id)));
  const clearSelect = () => setSelected(new Set());

  const handleBulkStatus = () => {
    selected.forEach(id => updateStatus(id, bulkStatus));
    showToast(`${selected.size} invoices marked as ${bulkStatus}`);
    clearSelect();
  };

  const handleDelete = () => {
    if (deleteId) { deleteInvoice(deleteId); showToast('Invoice deleted'); setDeleteId(null); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          {invoices.length > 0 && <Button variant="secondary" onClick={() => exportToCSV(invoices)}>Export CSV</Button>}
          <Button onClick={() => navigate('/invoice/new')}>+ New Invoice</Button>
        </div>
      </div>

      <Filters search={search} status={status} sortBy={sortBy} onSearch={setSearch} onStatus={setStatus} onSort={setSortBy} />

      {/* Bulk actions bar */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-3 mb-4 text-sm">
          <button onClick={selected.size === filtered.length ? clearSelect : selectAll} className="text-blue-600 hover:underline text-xs">
            {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
          </button>
          {selected.size > 0 && (
            <>
              <span className="text-gray-400">{selected.size} selected</span>
              <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value as Invoice['status'])}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800">
                <option value="Paid">Mark Paid</option>
                <option value="Unpaid">Mark Unpaid</option>
                <option value="Partial">Mark Partial</option>
              </select>
              <Button size="sm" onClick={handleBulkStatus}>Apply</Button>
              <button onClick={clearSelect} className="text-gray-400 hover:text-gray-600 text-xs">Clear</button>
            </>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <div className="font-medium">{invoices.length === 0 ? 'No invoices yet' : 'No results found'}</div>
          {invoices.length === 0 && <Button className="mt-4" onClick={() => navigate('/invoice/new')}>Create Invoice</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(inv => (
            <div key={inv.id} className="flex items-start gap-2">
              {/* Checkbox outside the card */}
              <input
                type="checkbox"
                checked={selected.has(inv.id)}
                onChange={() => toggleSelect(inv.id)}
                className="mt-4 w-4 h-4 rounded cursor-pointer accent-blue-600 flex-shrink-0"
              />
              <div className={`flex-1 ${selected.has(inv.id) ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}>
                <InvoiceCard invoice={inv} onDelete={setDeleteId} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Invoice">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Are you sure? This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
