import type { LineItem } from '../../types/invoice';
import { GST_SLABS, calculateLineItem } from '../../utils/gstCalculator';
import { formatCurrency } from '../../utils/invoiceHelpers';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus } from 'lucide-react';

interface Props {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

function emptyItem(): LineItem {
  return { id: uuidv4(), description: '', hsnSac: '', quantity: 1, rate: 0, taxPercent: 18, amount: 0, taxAmount: 0, total: 0 };
}

export default function LineItems({ items, onChange }: Props) {
  const update = (id: string, key: keyof LineItem, val: string | number) => {
    const updated = items.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, [key]: val };
      return calculateLineItem(next);
    });
    onChange(updated);
  };

  const addRow = () => onChange([...items, emptyItem()]);
  const removeRow = (id: string) => onChange(items.filter(i => i.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm tracking-wide">Line Items</h3>
        <button
          onClick={addRow}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all border border-indigo-200/50 dark:border-indigo-500/20"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-hidden rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100/50 dark:bg-black/20 text-gray-500 dark:text-gray-400 font-medium text-xs border-b border-gray-100 dark:border-white/5">
              <th className="text-left p-3 w-8 font-semibold">#</th>
              <th className="text-left p-3 font-semibold">Description</th>
              <th className="text-left p-3 w-24 font-semibold">HSN/SAC</th>
              <th className="text-right p-3 w-20 font-semibold">Qty</th>
              <th className="text-right p-3 w-28 font-semibold">Rate</th>
              <th className="text-right p-3 w-20 font-semibold">GST%</th>
              <th className="text-right p-3 w-32 font-semibold">Amount</th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            <AnimatePresence mode="popLayout">
              {items.length === 0 && (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                    No items added. Start by adding a new line item.
                  </td>
                </motion.tr>
              )}
              {items.map((item, idx) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  transition={{ duration: 0.2 }}
                  key={item.id}
                  className="bg-white dark:bg-transparent group hover:bg-gray-50 dark:hover:bg-white-[0.02] transition-colors"
                >
                  <td className="p-3 text-xs text-gray-400 font-medium">{idx + 1}</td>
                  <td className="p-2">
                    <input
                      className="w-full bg-transparent p-2 text-sm text-gray-900 dark:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg outline-none transition-colors"
                      value={item.description}
                      onChange={e => update(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      className="w-full bg-transparent p-2 text-sm text-gray-900 dark:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg outline-none transition-colors"
                      value={item.hsnSac}
                      onChange={e => update(item.id, 'hsnSac', e.target.value)}
                      placeholder="9983"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number" min="0"
                      className="w-full bg-transparent p-2 text-sm text-right text-gray-900 dark:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={item.quantity || ''}
                      onChange={e => update(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number" min="0" step="0.01"
                      className="w-full bg-transparent p-2 text-sm text-right text-gray-900 dark:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={item.rate || ''}
                      onChange={e => update(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="w-full bg-transparent p-2 text-sm text-right text-gray-900 dark:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 rounded-lg outline-none transition-colors appearance-none cursor-pointer"
                      value={item.taxPercent}
                      onChange={e => update(item.id, 'taxPercent', parseInt(e.target.value))}
                    >
                      {GST_SLABS.map(s => <option key={s} value={s}>{s}%</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-right font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeRow(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
