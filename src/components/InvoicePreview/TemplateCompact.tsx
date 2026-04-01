import type { Invoice } from '../../types/invoice';
import { formatCurrency, formatDate, numberToWords } from '../../utils/invoiceHelpers';

interface Props { invoice: Invoice }

export default function TemplateCompact({ invoice }: Props) {
  const { business, client, items, summary, taxType } = invoice;
  return (
    <div className="bg-white text-gray-900 font-sans" style={{ width: '210mm', minHeight: '297mm', padding: '12mm', fontSize: '10px' }}>
      {/* Compact Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-3 mb-3">
        <div className="flex items-center gap-3">
          {business.logo && <img src={business.logo} alt="logo" className="h-10 object-contain" style={{ maxWidth: '80px' }} />}
          <div>
            <div className="font-bold text-base">{business.name}</div>
            <div className="text-gray-500" style={{ fontSize: '9px' }}>{business.address}, {business.city}, {business.state}</div>
            {business.gstin && <div className="text-gray-500" style={{ fontSize: '9px' }}>GSTIN: {business.gstin}</div>}
            {business.phone && <div className="text-gray-500" style={{ fontSize: '9px' }}>{business.phone} | {business.email}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">TAX INVOICE</div>
          <div className="text-gray-600" style={{ fontSize: '9px' }}>No: <strong>{invoice.invoiceNumber}</strong></div>
          <div className="text-gray-600" style={{ fontSize: '9px' }}>Date: {formatDate(invoice.createdAt)}</div>
          <div className="text-gray-600" style={{ fontSize: '9px' }}>Due: {formatDate(invoice.dueDate)}</div>
          <div className={`inline-block px-1.5 py-0.5 rounded text-white mt-1 ${invoice.status === 'Paid' ? 'bg-green-600' : invoice.status === 'Partial' ? 'bg-yellow-500' : 'bg-red-600'}`} style={{ fontSize: '8px' }}>
            {invoice.status}
          </div>
        </div>
      </div>

      {/* Bill To — compact */}
      <div className="flex gap-4 mb-3">
        <div className="flex-1 border border-gray-200 rounded p-2">
          <div className="font-semibold text-gray-400 uppercase mb-0.5" style={{ fontSize: '8px' }}>Bill To</div>
          <div className="font-bold">{client.name}</div>
          <div className="text-gray-500" style={{ fontSize: '9px' }}>{client.address}, {client.city}, {client.state}</div>
          {client.gstin && <div style={{ fontSize: '9px' }}>GSTIN: {client.gstin}</div>}
        </div>
      </div>

      {/* Items — compact */}
      <table className="w-full mb-3" style={{ fontSize: '9px' }}>
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="text-left p-1.5">#</th>
            <th className="text-left p-1.5">Description</th>
            <th className="text-left p-1.5">HSN</th>
            <th className="text-right p-1.5">Qty</th>
            <th className="text-right p-1.5">Rate</th>
            <th className="text-right p-1.5">Tax%</th>
            <th className="text-right p-1.5">Taxable</th>
            <th className="text-right p-1.5">Tax</th>
            <th className="text-right p-1.5">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="p-1.5 text-gray-400">{i + 1}</td>
              <td className="p-1.5">{item.description}</td>
              <td className="p-1.5 text-gray-500">{item.hsnSac}</td>
              <td className="p-1.5 text-right">{item.quantity}</td>
              <td className="p-1.5 text-right">{formatCurrency(item.rate)}</td>
              <td className="p-1.5 text-right">{item.taxPercent}%</td>
              <td className="p-1.5 text-right">{formatCurrency(item.amount)}</td>
              <td className="p-1.5 text-right">{formatCurrency(item.taxAmount)}</td>
              <td className="p-1.5 text-right font-medium">{formatCurrency(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* GST + Totals side by side */}
      <div className="flex gap-4 mb-3">
        <div className="flex-1">
          <div className="font-semibold text-gray-500 uppercase mb-1" style={{ fontSize: '8px' }}>GST Summary</div>
          <table className="w-full border border-gray-200" style={{ fontSize: '9px' }}>
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-1">Taxable</th>
                {taxType === 'CGST_SGST' ? <><th className="text-right p-1">CGST</th><th className="text-right p-1">SGST</th></> : <th className="text-right p-1">IGST</th>}
                <th className="text-right p-1">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1">{formatCurrency(summary.taxableAmount)}</td>
                {taxType === 'CGST_SGST' ? <><td className="text-right p-1">{formatCurrency(summary.cgst)}</td><td className="text-right p-1">{formatCurrency(summary.sgst)}</td></> : <td className="text-right p-1">{formatCurrency(summary.igst)}</td>}
                <td className="text-right p-1 font-medium">{formatCurrency(summary.totalTax)}</td>
              </tr>
            </tbody>
          </table>
          <div className="text-gray-400 mt-1" style={{ fontSize: '8px' }}>Reverse Charge: {invoice.reverseCharge ? 'Yes' : 'No'}</div>
        </div>
        <div className="w-44" style={{ fontSize: '9px' }}>
          <div className="space-y-0.5">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(summary.subtotal)}</span></div>
            {summary.discountAmount > 0 && <div className="flex justify-between"><span className="text-gray-500">Discount</span><span>-{formatCurrency(summary.discountAmount)}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>{formatCurrency(summary.totalTax)}</span></div>
            {summary.roundOff !== 0 && <div className="flex justify-between"><span className="text-gray-500">Round Off</span><span>{formatCurrency(summary.roundOff)}</span></div>}
            <div className="flex justify-between font-bold text-sm border-t border-gray-800 pt-1 mt-1">
              <span>TOTAL</span><span>{formatCurrency(summary.finalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-gray-500 italic mb-2" style={{ fontSize: '8px' }}>Amount in words: {numberToWords(summary.finalAmount)}</div>

      {invoice.notes && <div className="mb-1"><span className="font-semibold text-gray-500 uppercase" style={{ fontSize: '8px' }}>Notes: </span><span className="text-gray-600" style={{ fontSize: '9px' }}>{invoice.notes}</span></div>}
      {invoice.terms && <div className="mb-3"><span className="font-semibold text-gray-500 uppercase" style={{ fontSize: '8px' }}>Terms: </span><span className="text-gray-600" style={{ fontSize: '9px' }}>{invoice.terms}</span></div>}

      <div className="flex justify-end mt-4">
        <div className="text-center">
          {business.signature && <img src={business.signature} alt="sig" className="h-10 mb-1 object-contain" />}
          <div className="border-t border-gray-400 pt-1 text-gray-500" style={{ fontSize: '8px' }}>Authorised Signatory — {business.name}</div>
        </div>
      </div>
    </div>
  );
}
