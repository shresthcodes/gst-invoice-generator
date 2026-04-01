import type { Invoice } from '../../types/invoice';
import { formatCurrency, formatDate, numberToWords } from '../../utils/invoiceHelpers';

interface Props { invoice: Invoice }

export default function TemplateProfessional({ invoice }: Props) {
  const { business, client, items, summary, taxType } = invoice;
  return (
    <div className="bg-white text-gray-900 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Navy Header */}
      <div className="bg-[#1e3a5f] text-white px-10 py-8">
        <div className="flex justify-between items-start">
          <div>
            {business.logo && <img src={business.logo} alt="logo" className="h-14 mb-3 object-contain" style={{ maxWidth: '160px' }} />}
            <div className="text-2xl font-bold">{business.name}</div>
            <div className="text-blue-200 text-xs mt-1">{business.address}, {business.city}, {business.state}</div>
            {business.gstin && <div className="text-blue-200 text-xs">GSTIN: {business.gstin}</div>}
            {business.phone && <div className="text-blue-200 text-xs">{business.phone} | {business.email}</div>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold tracking-widest text-blue-200">INVOICE</div>
            <div className="mt-3 space-y-1 text-xs text-blue-100">
              <div>Invoice No: <span className="font-bold text-white">{invoice.invoiceNumber}</span></div>
              <div>Date: {formatDate(invoice.createdAt)}</div>
              <div>Due Date: {formatDate(invoice.dueDate)}</div>
            </div>
            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${invoice.status === 'Paid' ? 'bg-green-400 text-green-900' : invoice.status === 'Partial' ? 'bg-yellow-400 text-yellow-900' : 'bg-red-400 text-red-900'}`}>
              {invoice.status}
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 py-6">
        {/* Bill To */}
        <div className="bg-gray-50 border-l-4 border-[#1e3a5f] p-4 mb-6 rounded-r">
          <div className="text-xs font-bold text-[#1e3a5f] uppercase mb-1">Bill To</div>
          <div className="font-bold text-base">{client.name}</div>
          <div className="text-xs text-gray-500">{client.address}, {client.city}, {client.state}</div>
          {client.gstin && <div className="text-xs">GSTIN: <span className="font-mono">{client.gstin}</span></div>}
          {client.phone && <div className="text-xs">{client.phone} | {client.email}</div>}
        </div>

        {/* Items */}
        <table className="w-full text-xs mb-6">
          <thead>
            <tr className="bg-[#1e3a5f] text-white">
              <th className="text-left p-2.5 rounded-tl">#</th>
              <th className="text-left p-2.5">Description</th>
              <th className="text-left p-2.5">HSN/SAC</th>
              <th className="text-right p-2.5">Qty</th>
              <th className="text-right p-2.5">Rate</th>
              <th className="text-right p-2.5">Tax%</th>
              <th className="text-right p-2.5 rounded-tr">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-2.5 text-gray-400">{i + 1}</td>
                <td className="p-2.5">{item.description}</td>
                <td className="p-2.5 text-gray-500">{item.hsnSac}</td>
                <td className="p-2.5 text-right">{item.quantity}</td>
                <td className="p-2.5 text-right">{formatCurrency(item.rate)}</td>
                <td className="p-2.5 text-right">{item.taxPercent}%</td>
                <td className="p-2.5 text-right font-semibold">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST Summary + Totals */}
        <div className="flex justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="text-xs font-bold text-[#1e3a5f] uppercase mb-1">GST Breakup</div>
            <table className="w-full text-xs border border-gray-200">
              <thead className="bg-[#1e3a5f] text-white">
                <tr>
                  <th className="text-left p-2">Taxable Amt</th>
                  {taxType === 'CGST_SGST' ? <><th className="text-right p-2">CGST</th><th className="text-right p-2">SGST</th></> : <th className="text-right p-2">IGST</th>}
                  <th className="text-right p-2">Total Tax</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50">
                  <td className="p-2">{formatCurrency(summary.taxableAmount)}</td>
                  {taxType === 'CGST_SGST' ? <><td className="text-right p-2">{formatCurrency(summary.cgst)}</td><td className="text-right p-2">{formatCurrency(summary.sgst)}</td></> : <td className="text-right p-2">{formatCurrency(summary.igst)}</td>}
                  <td className="text-right p-2 font-semibold">{formatCurrency(summary.totalTax)}</td>
                </tr>
              </tbody>
            </table>
            <div className="text-xs text-gray-400 mt-1">Reverse Charge: {invoice.reverseCharge ? 'Yes' : 'No'}</div>
          </div>
          <div className="w-56 text-xs space-y-1.5">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
            {summary.discountAmount > 0 && <div className="flex justify-between text-gray-500"><span>Discount</span><span>- {formatCurrency(summary.discountAmount)}</span></div>}
            <div className="flex justify-between text-gray-500"><span>Total Tax</span><span>{formatCurrency(summary.totalTax)}</span></div>
            {summary.roundOff !== 0 && <div className="flex justify-between text-gray-500"><span>Round Off</span><span>{formatCurrency(summary.roundOff)}</span></div>}
            <div className="flex justify-between font-bold text-base bg-[#1e3a5f] text-white px-3 py-2 rounded">
              <span>TOTAL</span><span>{formatCurrency(summary.finalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 italic mb-4">Amount in words: {numberToWords(summary.finalAmount)}</div>

        {invoice.notes && <div className="mb-3"><div className="text-xs font-bold text-[#1e3a5f] uppercase">Notes</div><div className="text-xs text-gray-600 mt-1">{invoice.notes}</div></div>}
        {invoice.terms && <div className="mb-6"><div className="text-xs font-bold text-[#1e3a5f] uppercase">Terms & Conditions</div><div className="text-xs text-gray-600 mt-1">{invoice.terms}</div></div>}

        <div className="flex justify-end mt-8">
          <div className="text-center">
            {business.signature && <img src={business.signature} alt="signature" className="h-12 mb-1 object-contain" />}
            <div className="border-t-2 border-[#1e3a5f] pt-1 text-xs text-gray-600">Authorised Signatory<br /><span className="font-semibold">{business.name}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
