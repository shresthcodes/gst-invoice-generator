import dayjs from 'dayjs';
import type { Invoice } from '../types/invoice';

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return amount.toFixed(2);
}

export function formatDate(date: string): string {
  return dayjs(date).format('DD MMM YYYY');
}

export function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  return result + ' Only';
}

export function exportToCSV(invoices: Invoice[]): void {
  const headers = ['Invoice No', 'Date', 'Client', 'Subtotal', 'GST', 'Total', 'Status'];
  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    formatDate(inv.createdAt),
    inv.client.name,
    inv.summary.subtotal.toFixed(2),
    inv.summary.totalTax.toFixed(2),
    inv.summary.finalAmount.toFixed(2),
    inv.status,
  ]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'invoices.csv';
  a.click();
  URL.revokeObjectURL(url);
}
