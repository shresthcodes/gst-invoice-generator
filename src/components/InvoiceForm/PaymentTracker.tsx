import { useState } from 'react';
import type { Payment } from '../../types/invoice';
import { formatCurrency, formatDate } from '../../utils/invoiceHelpers';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import Input, { Select } from '../Common/Input';
import Button from '../Common/Button';

interface Props {
  payments: Payment[];
  totalAmount: number;
  onChange: (payments: Payment[]) => void;
}

export default function PaymentTracker({ payments, totalAmount, onChange }: Props) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = totalAmount - totalPaid;

  const addPayment = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const p: Payment = { id: uuidv4(), date: dayjs(date).toISOString(), amount: amt, method, note };
    onChange([...payments, p]);
    setAmount('');
    setNote('');
  };

  const removePayment = (id: string) => onChange(payments.filter(p => p.id !== id));

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Payment Tracker</h3>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
          <div className="text-gray-500">Total</div>
          <div className="font-bold text-blue-600">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
          <div className="text-gray-500">Received</div>
          <div className="font-bold text-green-600">{formatCurrency(totalPaid)}</div>
        </div>
        <div className={`rounded-lg p-2 ${balance > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
          <div className="text-gray-500">Balance</div>
          <div className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(balance)}</div>
        </div>
      </div>

      {/* Add payment */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000" />
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select label="Method" value={method} onChange={e => setMethod(e.target.value)}>
            <option>UPI</option>
            <option>Bank Transfer</option>
            <option>Cash</option>
            <option>Cheque</option>
            <option>Card</option>
          </Select>
          <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="UTR / ref no." />
        </div>
        <Button size="sm" onClick={addPayment} className="w-full justify-center" type="button">+ Add Payment</Button>
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="space-y-1">
          {payments.map(p => (
            <div key={p.id} className="flex items-center justify-between text-xs bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg px-3 py-2">
              <div>
                <span className="font-medium">{formatCurrency(p.amount)}</span>
                <span className="text-gray-400 ml-2">{p.method}</span>
                {p.note && <span className="text-gray-400 ml-2">· {p.note}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{formatDate(p.date)}</span>
                <button onClick={() => removePayment(p.id)} className="text-red-400 hover:text-red-600">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
