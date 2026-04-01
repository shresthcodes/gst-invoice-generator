import { useState } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import type { Expense } from '../types/invoice';
import { formatCurrency, formatDate } from '../utils/invoiceHelpers';
import Input, { Select } from '../components/Common/Input';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const CATEGORIES = ['Office', 'Travel', 'Software', 'Marketing', 'Equipment', 'Utilities', 'Professional Fees', 'Other'];

const empty = (): Expense => ({
  id: uuidv4(), date: dayjs().format('YYYY-MM-DD'), category: 'Office',
  description: '', amount: 0, gstPercent: 18, gstAmount: 0, vendor: '',
});

export default function ExpensesPage() {
  const { expenses, saveExpense, deleteExpense, invoices, showToast } = useInvoiceStore();
  const [form, setForm] = useState<Expense>(empty());
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('');

  const set = (key: keyof Expense, val: string | number) => {
    setForm(p => {
      const next = { ...p, [key]: val };
      if (key === 'amount' || key === 'gstPercent') {
        next.gstAmount = parseFloat(((Number(next.amount) * Number(next.gstPercent)) / 100).toFixed(2));
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!form.description) { showToast('Description required', 'error'); return; }
    saveExpense({ ...form, date: dayjs(form.date).toISOString() });
    showToast('Expense saved!');
    setForm(empty());
    setShowForm(false);
  };

  const filtered = expenses.filter(e => !filterCat || e.category === filterCat);
  const totalExpenses = filtered.reduce((s, e) => s + e.amount + e.gstAmount, 0);
  const totalRevenue = invoices.reduce((s, i) => s + i.summary.finalAmount, 0);
  const netProfit = totalRevenue - expenses.reduce((s, e) => s + e.amount + e.gstAmount, 0);

  const exportCSV = () => {
    const rows = [['Date', 'Category', 'Vendor', 'Description', 'Amount', 'GST%', 'GST Amount', 'Total']];
    expenses.forEach(e => rows.push([
      formatDate(e.date), e.category, e.vendor, e.description,
      e.amount.toFixed(2), String(e.gstPercent), e.gstAmount.toFixed(2), (e.amount + e.gstAmount).toFixed(2)
    ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track business expenses & calculate net profit</p>
        </div>
        <div className="flex gap-2">
          {expenses.length > 0 && <Button variant="secondary" size="sm" onClick={exportCSV}>Export CSV</Button>}
          <Button onClick={() => setShowForm(true)}>+ Add Expense</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-xs text-gray-500">Total Revenue</div>
          <div className="font-bold text-xl text-green-600 mt-1">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="text-xs text-gray-500">Total Expenses</div>
          <div className="font-bold text-xl text-red-600 mt-1">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className={`rounded-xl border p-4 ${netProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
          <div className="text-xs text-gray-500">Net Profit</div>
          <div className={`font-bold text-xl mt-1 ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(netProfit)}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <Select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="w-48">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-2">💸</div>
          <div className="font-medium">No expenses yet</div>
          <Button className="mt-3" size="sm" onClick={() => setShowForm(true)}>Add First Expense</Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Description</th>
                <th className="text-left p-3">Vendor</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-right p-3">GST</th>
                <th className="text-right p-3">Total</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 text-gray-500">{formatDate(e.date)}</td>
                  <td className="p-3"><span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">{e.category}</span></td>
                  <td className="p-3">{e.description}</td>
                  <td className="p-3 text-gray-500">{e.vendor || '—'}</td>
                  <td className="p-3 text-right">{formatCurrency(e.amount)}</td>
                  <td className="p-3 text-right text-gray-500">{formatCurrency(e.gstAmount)} ({e.gstPercent}%)</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(e.amount + e.gstAmount)}</td>
                  <td className="p-3">
                    <button onClick={() => setDeleteId(e.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Expense Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Expense">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <Input label="Description *" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Office supplies" />
          <Input label="Vendor" value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="Amazon, Flipkart..." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Amount (₹)" type="number" value={form.amount} onChange={e => set('amount', parseFloat(e.target.value) || 0)} />
            <Select label="GST%" value={form.gstPercent} onChange={e => set('gstPercent', parseInt(e.target.value))}>
              {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
            </Select>
          </div>
          {form.gstAmount > 0 && (
            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded p-2">
              GST: {formatCurrency(form.gstAmount)} | Total: {formatCurrency(form.amount + form.gstAmount)}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1 justify-center">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 justify-center">Save Expense</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Expense">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Delete this expense? Cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { deleteExpense(deleteId!); showToast('Deleted'); setDeleteId(null); }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
