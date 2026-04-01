import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { Invoice } from '../types/invoice';
import dayjs from 'dayjs';
import { useState } from 'react';

interface Props { invoices: Invoice[] }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function RevenueChart({ invoices }: Props) {
  const [chartType, setChartType] = useState<'bar' | 'area'>('area');
  const year = new Date().getFullYear();

  const data = MONTHS.map((month, i) => {
    const monthInvoices = invoices.filter(inv => {
      const d = dayjs(inv.createdAt);
      return d.month() === i && d.year() === year;
    });
    return {
      month,
      revenue: parseFloat(monthInvoices.reduce((s, inv) => s + inv.summary.finalAmount, 0).toFixed(0)),
      paid: parseFloat(monthInvoices.filter(i => i.status === 'Paid').reduce((s, inv) => s + inv.summary.finalAmount, 0).toFixed(0)),
      invoices: monthInvoices.length,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-xl p-3 shadow-xl text-xs">
        <div className="font-bold text-gray-900 dark:text-white mb-1">{label} {year}</div>
        <div className="text-indigo-500">Revenue: ₹{payload[0]?.value?.toLocaleString('en-IN')}</div>
        {payload[1] && <div className="text-emerald-500">Paid: ₹{payload[1]?.value?.toLocaleString('en-IN')}</div>}
        <div className="text-gray-400">{payload[0]?.payload?.invoices} invoices</div>
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">{year} monthly breakdown</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
          {(['area', 'bar'] as const).map(t => (
            <button key={t} onClick={() => setChartType(t)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${chartType === t ? 'bg-white dark:bg-white/10 shadow text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {chartType === 'area' ? (
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `₹${(v/1000).toFixed(0)}k` : '0'} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
            <Area type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} fill="url(#colorPaid)" />
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `₹${(v/1000).toFixed(0)}k` : '0'} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
            <Bar dataKey="paid" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
          </BarChart>
        )}
      </ResponsiveContainer>

      <div className="flex gap-4 mt-3 justify-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />Total Revenue
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />Collected
        </div>
      </div>
    </div>
  );
}
