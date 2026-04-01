import type { Invoice } from '../../types/invoice';
import { formatCurrency, formatDate, numberToWords } from '../../utils/invoiceHelpers';

interface Props { invoice: Invoice }

export default function TemplateModern({ invoice }: Props) {
  const { business, client, items, summary, taxType } = invoice;

  const statusStyle = {
    Paid: { bg: '#dcfce7', color: '#15803d' },
    Unpaid: { bg: '#fee2e2', color: '#dc2626' },
    Partial: { bg: '#fef9c3', color: '#ca8a04' },
  }[invoice.status];

  return (
    <div className="bg-white text-gray-900 font-sans text-sm" style={{ width: '210mm', minHeight: '297mm' }}>

      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)', padding: '36px 40px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

          {/* Left: Business */}
          <div>
            {business.logo && (
              <img src={business.logo} alt="logo"
                style={{ height: '52px', marginBottom: '12px', objectFit: 'contain', maxWidth: '160px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px' }} />
            )}
            <div style={{ color: '#fff', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>{business.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', marginTop: '4px', lineHeight: '1.6' }}>
              {business.address && <div>{business.address}, {business.city}</div>}
              {business.state && <div>{business.state}</div>}
              {business.gstin && <div>GSTIN: {business.gstin}</div>}
              {business.phone && <div>{business.phone}{business.email ? ` · ${business.email}` : ''}</div>}
            </div>
          </div>

          {/* Right: Invoice meta */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>Invoice</div>
            <div style={{ color: '#fff', fontSize: '26px', fontWeight: '900', letterSpacing: '-1px' }}>{invoice.invoiceNumber}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '10px', lineHeight: '1.8' }}>
              <div>Issued: {formatDate(invoice.createdAt)}</div>
              <div>Due: {formatDate(invoice.dueDate)}</div>
            </div>
            <div style={{ marginTop: '10px', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: statusStyle.bg, color: statusStyle.color }}>
              {invoice.status}
            </div>
          </div>
        </div>

        {/* Decorative wave bottom */}
        <div style={{ marginTop: '20px', height: '1px', background: 'rgba(255,255,255,0.2)' }} />
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: '32px 40px' }}>

        {/* Bill To */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
          <div style={{ flex: 1, background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '12px', padding: '16px 20px', borderLeft: '4px solid #8b5cf6' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Bill To</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e1b4b' }}>{client.name || '—'}</div>
            {(client.address || client.city) && (
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', lineHeight: '1.6' }}>
                {client.address && <div>{client.address}</div>}
                {client.city && <div>{client.city}{client.state ? `, ${client.state}` : ''}</div>}
              </div>
            )}
            {client.gstin && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>GSTIN: <span style={{ fontFamily: 'monospace' }}>{client.gstin}</span></div>}
            {client.phone && <div style={{ fontSize: '11px', color: '#6b7280' }}>{client.phone}{client.email ? ` · ${client.email}` : ''}</div>}
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderRadius: '8px 0 0 0', fontWeight: '600', fontSize: '11px' }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>Description</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', fontSize: '11px' }}>HSN/SAC</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '11px' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '11px' }}>Rate</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600', fontSize: '11px' }}>Tax%</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', borderRadius: '0 8px 0 0', fontWeight: '600', fontSize: '11px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '11px' }}>No items</td></tr>
            )}
            {items.map((item, i) => (
              <tr key={item.id} style={{ background: i % 2 === 0 ? '#fff' : '#faf5ff', borderBottom: '1px solid #ede9fe' }}>
                <td style={{ padding: '10px 12px', color: '#a78bfa', fontWeight: '700' }}>{String(i + 1).padStart(2, '0')}</td>
                <td style={{ padding: '10px 12px', fontWeight: '500' }}>{item.description}</td>
                <td style={{ padding: '10px 12px', color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px' }}>{item.hsnSac || '—'}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>{formatCurrency(item.rate)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                  <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '600' }}>{item.taxPercent}%</span>
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', color: '#6d28d9' }}>{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST Summary + Totals */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>

          {/* GST Breakup */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>GST Breakup</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600' }}>Taxable Amt</th>
                  {taxType === 'CGST_SGST' ? (
                    <><th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600' }}>CGST</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600' }}>SGST</th></>
                  ) : (
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600' }}>IGST</th>
                  )}
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600' }}>Total Tax</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#faf5ff' }}>
                  <td style={{ padding: '8px 10px' }}>{formatCurrency(summary.taxableAmount)}</td>
                  {taxType === 'CGST_SGST' ? (
                    <><td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(summary.cgst)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(summary.sgst)}</td></>
                  ) : (
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{formatCurrency(summary.igst)}</td>
                  )}
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#6d28d9' }}>{formatCurrency(summary.totalTax)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px' }}>
              Reverse Charge: {invoice.reverseCharge ? 'Yes' : 'No'}
            </div>
          </div>

          {/* Totals */}
          <div style={{ width: '200px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>Summary</div>
            <div style={{ background: '#faf5ff', borderRadius: '10px', padding: '12px 14px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#6b7280' }}>
                <span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span>
              </div>
              {summary.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#6b7280' }}>
                  <span>Discount</span><span style={{ color: '#dc2626' }}>− {formatCurrency(summary.discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#6b7280' }}>
                <span>Total Tax</span><span>{formatCurrency(summary.totalTax)}</span>
              </div>
              {summary.roundOff !== 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#6b7280' }}>
                  <span>Round Off</span><span>{formatCurrency(summary.roundOff)}</span>
                </div>
              )}
              <div style={{ height: '1px', background: '#ddd6fe', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px' }}>
                <span style={{ color: '#1e1b4b' }}>TOTAL</span>
                <span style={{ color: '#7c3aed' }}>{formatCurrency(summary.finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', marginBottom: '20px', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', borderLeft: '3px solid #ddd6fe' }}>
          {numberToWords(summary.finalAmount)}
        </div>

        {/* Notes & Terms */}
        {invoice.notes && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Notes</div>
            <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.6' }}>{invoice.notes}</div>
          </div>
        )}
        {invoice.terms && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Terms & Conditions</div>
            <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.6' }}>{invoice.terms}</div>
          </div>
        )}

        {/* Signature */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
          <div style={{ textAlign: 'center' }}>
            {business.signature && (
              <img src={business.signature} alt="signature" style={{ height: '48px', marginBottom: '6px', objectFit: 'contain' }} />
            )}
            <div style={{ width: '160px', borderTop: '2px solid #8b5cf6', paddingTop: '6px', fontSize: '10px', color: '#6b7280' }}>
              Authorised Signatory<br />
              <span style={{ fontWeight: '700', color: '#1e1b4b' }}>{business.name}</span>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div style={{ marginTop: '28px', height: '4px', borderRadius: '2px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)' }} />
      </div>
    </div>
  );
}
