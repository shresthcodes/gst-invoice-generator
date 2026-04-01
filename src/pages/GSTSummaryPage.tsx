import { useState } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import { formatCurrency } from '../utils/invoiceHelpers';
import dayjs from 'dayjs';
import Button from '../components/Common/Button';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1 (Apr–Jun)', 'Q2 (Jul–Sep)', 'Q3 (Oct–Dec)', 'Q4 (Jan–Mar)'];

export default function GSTSummaryPage() {
  const { invoices } = useInvoiceStore();

  // Default to the financial year that contains the most recent invoice
  const getDefaultFY = () => {
    const now = dayjs();
    // If current month is Jan-Mar, FY started last year
    return now.month() <= 2 ? now.year() - 1 : now.year();
  };

  const [year, setYear] = useState(getDefaultFY);
  const [view, setView] = useState<'monthly' | 'quarterly'>('monthly');

  // Collect all FY start years from invoices
  const fyYears = Array.from(new Set(invoices.map(i => {
    const d = dayjs(i.createdAt);
    return d.month() <= 2 ? d.year() - 1 : d.year();
  }))).sort((a, b) => b - a);
  if (!fyYears.includes(year)) fyYears.unshift(year);

  // Financial year months: Apr(3) to Mar(2)
  const fyMonths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]; // month indices

  // For a given month index in this FY, what calendar year is it?
  const getCalYear = (monthIdx: number) => monthIdx <= 2 ? year + 1 : year;

  function getMonthData(monthIdx: number) {
    const calYear = getCalYear(monthIdx);
    const filtered = invoices.filter(inv => {
      const d = dayjs(inv.createdAt);
      return d.month() === monthIdx && d.year() === calYear;
    });
    return calcTotals(filtered);
  }

  function getQuarterData(qIdx: number) {
    // Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
    const qMonths = [[3, 4, 5], [6, 7, 8], [9, 10, 11], [0, 1, 2]];
    const months = qMonths[qIdx];
    const filtered = invoices.filter(inv => {
      const d = dayjs(inv.createdAt);
      const m = d.month();
      const y = d.year();
      const calYear = getCalYear(m);
      return months.includes(m) && y === calYear;
    });
    return calcTotals(filtered);
  }

  function calcTotals(filtered: typeof invoices) {
    return {
      count: filtered.length,
      taxable: filtered.reduce((s, i) => s + i.summary.taxableAmount, 0),
      cgst: filtered.reduce((s, i) => s + i.summary.cgst, 0),
      sgst: filtered.reduce((s, i) => s + i.summary.sgst, 0),
      igst: filtered.reduce((s, i) => s + i.summary.igst, 0),
      total: filtered.reduce((s, i) => s + i.summary.totalTax, 0),
      grand: filtered.reduce((s, i) => s + i.summary.finalAmount, 0),
    };
  }

  // Annual total = all invoices in this FY (Apr year to Mar year+1)
  const annualData = calcTotals(invoices.filter(i => {
    const d = dayjs(i.createdAt);
    const m = d.month();
    const y = d.year();
    if (m >= 3) return y === year;       // Apr-Dec of FY start year
    return y === year + 1;               // Jan-Mar of next year
  }));

  const exportGSTR = () => {
    const rows = [['Month', 'Invoices', 'Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total Tax', 'Grand Total']];
    fyMonths.forEach(m => {
      const yr = getCalYear(m);
      const d = getMonthData(m);
      rows.push([`${MONTHS[m]} ${yr}`, String(d.count), d.taxable.toFixed(2), d.cgst.toFixed(2), d.sgst.toFixed(2), d.igst.toFixed(2), d.total.toFixed(2), d.grand.toFixed(2)]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `GSTR1_Summary_FY${year}-${year + 1}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">GST Return Summary</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">GSTR-1 ready data for your CA</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800">
            {fyYears.map(y => <option key={y} value={y}>FY {y}–{y + 1}</option>)}
          </select>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['monthly', 'quarterly'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${view === v ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500'}`}>
                {v}
              </button>
            ))}
          </div>
          <Button size="sm" variant="secondary" onClick={exportGSTR}>Export CSV</Button>
        </div>
      </div>

      {/* Annual Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Invoices', value: annualData.count, isNum: true },
          { label: 'Taxable Amount', value: formatCurrency(annualData.taxable) },
          { label: 'Total GST Collected', value: formatCurrency(annualData.total) },
          { label: 'Total Revenue', value: formatCurrency(annualData.grand) },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
            <div className="font-bold text-xl mt-1">{c.isNum ? c.value : c.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-3 font-semibold">{view === 'monthly' ? 'Month' : 'Quarter'}</th>
              <th className="text-right p-3 font-semibold">Invoices</th>
              <th className="text-right p-3 font-semibold">Taxable Amt</th>
              <th className="text-right p-3 font-semibold">CGST</th>
              <th className="text-right p-3 font-semibold">SGST</th>
              <th className="text-right p-3 font-semibold">IGST</th>
              <th className="text-right p-3 font-semibold">Total Tax</th>
              <th className="text-right p-3 font-semibold">Grand Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {view === 'monthly' ? fyMonths.map(m => {
              const yr = getCalYear(m);
              const d = getMonthData(m);
              return (
                <tr key={m} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${d.count === 0 ? 'opacity-40' : ''}`}>
                  <td className="p-3 font-medium">{MONTHS[m]} {yr}</td>
                  <td className="p-3 text-right">{d.count}</td>
                  <td className="p-3 text-right">{formatCurrency(d.taxable)}</td>
                  <td className="p-3 text-right">{formatCurrency(d.cgst)}</td>
                  <td className="p-3 text-right">{formatCurrency(d.sgst)}</td>
                  <td className="p-3 text-right">{formatCurrency(d.igst)}</td>
                  <td className="p-3 text-right font-medium text-blue-600">{formatCurrency(d.total)}</td>
                  <td className="p-3 text-right font-bold">{formatCurrency(d.grand)}</td>
                </tr>
              );
            }) : QUARTERS.map((q, qi) => {
              const d = getQuarterData(qi);
              return (
                <tr key={qi} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${d.count === 0 ? 'opacity-40' : ''}`}>
                  <td className="p-3 font-medium">{q}</td>
                  <td className="p-3 text-right">{d.count}</td>
                  <td className="p-3 text-right">{formatCurrency(d.taxable)}</td>
                  <td className="p-3 text-right">{formatCurrency(d.cgst)}</td>
                  <td className="p-3 text-right">{formatCurrency(d.sgst)}</td>
                  <td className="p-3 text-right">{formatCurrency(d.igst)}</td>
                  <td className="p-3 text-right font-medium text-blue-600">{formatCurrency(d.total)}</td>
                  <td className="p-3 text-right font-bold">{formatCurrency(d.grand)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-blue-50 dark:bg-blue-900/20 font-bold">
            <tr>
              <td className="p-3">Annual Total</td>
              <td className="p-3 text-right">{annualData.count}</td>
              <td className="p-3 text-right">{formatCurrency(annualData.taxable)}</td>
              <td className="p-3 text-right">{formatCurrency(annualData.cgst)}</td>
              <td className="p-3 text-right">{formatCurrency(annualData.sgst)}</td>
              <td className="p-3 text-right">{formatCurrency(annualData.igst)}</td>
              <td className="p-3 text-right text-blue-600">{formatCurrency(annualData.total)}</td>
              <td className="p-3 text-right">{formatCurrency(annualData.grand)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
