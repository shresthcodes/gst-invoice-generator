import type { Invoice } from '../../types/invoice';
import { formatCurrency, formatDate, numberToWords } from '../../utils/invoiceHelpers';

interface Props { invoice: Invoice }

export default function TemplateMinimal({ invoice }: Props) {
  const { business, client, items, summary, taxType } = invoice;
  return (
    <div className="bg-white text-gray-900 p-10 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {business.logo && <img src={business.logo} alt="logo" className="h-14 mb-2 object-contain" />}
          <div className="font-bold text-xl">{business.name}</div>
          <div className="text-gray-500 text-xs mt-1">{business.address}, {business.city}</div>
          <div className="text-gray-500 text-xs">{business.state}</div>
          {business.gstin && <div className="text-xs mt-1">GSTIN: <span className="font-mono">{business.gstin}</span></div>}
          {business.phone && <div className="text-xs">{business.phone} | {business.email}</div>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">INVOICE</div>
          <div className="text-xs text-gray-500 mt-2">Invoice No: <span className="font-semibold text-gray-800">{invoice.invoiceNumber}</span></div>
          <div className="text-xs text-gray-500">Date: {formatDate(invoice.createdAt)}</div>
          <div className="text-xs text-gray-500">Due: {formatDate(invoice.dueDate)}</div>
          <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : invoice.status === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
            {invoice.status}
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="border border-gray-200 rounded p-4 mb-6">
        <div className="text-xs text-gray-400 uppercase mb-1">Bill To</div>
        <div className="font-semibold">{client.name}</div>
        <div className="text-xs text-gray-500">{client.address}, {client.city}, {client.state}</div>
        {client.gstin && <div className="text-xs">GSTIN: <span className="font-mono">{client.gstin}</span></div>}
        {client.phone && <div className="text-xs">{client.phone} | {client.email}</div>}
      </div>

      {/* Items */}
      <table className="w-full text-xs mb-4">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="text-left py-2">#</th>
            <th className="text-left py-2">Description</th>
            <th className="text-left py-2">HSN/SAC</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Rate</th>
            <th className="text-right py-2">Tax%</th>
            <th className="text-right py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2 text-gray-400">{i + 1}</td>
              <td className="py-2">{item.description}</td>
              <td className="py-2 text-gray-500">{item.hsnSac}</td>
              <td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(item.rate)}</td>
              <td className="py-2 text-right">{item.taxPercent}%</td>
              <td className="py-2 text-right font-medium">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* GST Summary + Totals */}
      <div className="flex justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-1">GST Summary</div>
          <table className="w-full text-xs border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-1.5">Taxable Amt</th>
                {taxType === 'CGST_SGST' ? <><th className="text-right p-1.5">CGST</th><th className="text-right p-1.5">SGST</th></> : <th className="text-right p-1.5">IGST</th>}
                <th className="text-right p-1.5">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1.5">{formatCurrency(summary.taxableAmount)}</td>
                {taxType === 'CGST_SGST' ? <><td className="text-right p-1.5">{formatCurrency(summary.cgst)}</td><td className="text-right p-1.5">{formatCurrency(summary.sgst)}</td></> : <td className="text-right p-1.5">{formatCurrency(summary.igst)}</td>}
                <td className="text-right p-1.5 font-medium">{formatCurrency(summary.totalTax)}</td>
              </tr>
            </tbody>
          </table>
          <div className="text-xs text-gray-400 mt-2">Reverse Charge: {invoice.reverseCharge ? 'Yes' : 'No'}</div>
        </div>
        <div className="w-52 text-xs space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
          {summary.discountAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>- {formatCurrency(summary.discountAmount)}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(summary.totalTax)}</span></div>
          {summary.roundOff !== 0 && <div className="flex justify-between"><span className="text-gray-500">Round Off</span><span>{formatCurrency(summary.roundOff)}</span></div>}
          <div className="flex justify-between font-bold text-sm border-t border-gray-800 pt-1 mt-1">
            <span>Total</span><span>{formatCurrency(summary.finalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 italic mb-6">Amount in words: {numberToWords(summary.finalAmount)}</div>

      {/* Notes & Terms */}
      {invoice.notes && <div className="mb-3"><div className="text-xs font-semibold text-gray-500 uppercase">Notes</div><div className="text-xs text-gray-600 mt-1">{invoice.notes}</div></div>}
      {invoice.terms && <div className="mb-6"><div className="text-xs font-semibold text-gray-500 uppercase">Terms & Conditions</div><div className="text-xs text-gray-600 mt-1">{invoice.terms}</div></div>}

      {/* UPI QR + Signature row */}
      <div className="flex justify-between items-end mt-8">
        <div>
          {invoice.business.gstin && (
            <div className="text-xs text-gray-400">
              <div>GSTIN: {invoice.business.gstin}</div>
              {(invoice as any).upiId && <div className="mt-1">UPI: {(invoice as any).upiId}</div>}
            </div>
          )}
        </div>
        <div className="text-center">
          {business.signature && <img src={business.signature} alt="signature" className="h-12 mb-1 object-contain" />}
          <div className="border-t border-gray-400 pt-1 text-xs text-gray-500">Authorised Signatory<br />{business.name}</div>
        </div>
      </div>
    </div>
  );
}
