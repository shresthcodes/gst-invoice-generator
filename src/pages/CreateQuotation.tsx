import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Quotation } from '../types/invoice';
import { useInvoiceStore } from '../store/invoiceStore';
import { calculateSummary, determineTaxType } from '../utils/gstCalculator';
import { localStorageService } from '../utils/localStorageService';
import { v4 as uuidv4 } from 'uuid';
import BusinessDetails from '../components/InvoiceForm/BusinessDetails';
import ClientDetails from '../components/InvoiceForm/ClientDetails';
import LineItems from '../components/InvoiceForm/LineItems';
import Totals from '../components/InvoiceForm/Totals';
import Button from '../components/Common/Button';
import Input, { Textarea } from '../components/Common/Input';
import dayjs from 'dayjs';

function makeEmpty(profile: any): Quotation {
  return {
    id: uuidv4(),
    quotationNumber: localStorageService.getNextQuotationNumber(profile?.invoicePrefix ? profile.invoicePrefix.replace('INV', 'QT') : 'QT'),
    createdAt: dayjs().toISOString(),
    validUntil: dayjs().add(30, 'day').toISOString(),
    status: 'Draft',
    business: {
      name: profile?.name || '', gstin: profile?.gstin || '', address: profile?.address || '',
      city: profile?.city || '', state: profile?.state || '', stateCode: profile?.stateCode || '',
      phone: profile?.phone || '', email: profile?.email || '', logo: profile?.logo || '', signature: profile?.signature || '',
    },
    client: { name: '', gstin: '', address: '', city: '', state: '', stateCode: '', phone: '', email: '' },
    items: [],
    taxType: 'CGST_SGST',
    summary: { subtotal: 0, discountType: 'flat', discountValue: 0, discountAmount: 0, taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0, grandTotal: 0, roundOff: 0, finalAmount: 0 },
    notes: '',
    terms: profile?.defaultTerms || '',
    currency: 'INR',
    template: 'professional',
  };
}

export default function CreateQuotation() {
  const { businessProfile, saveQuotation, showToast } = useInvoiceStore();
  const navigate = useNavigate();
  const [q, setQ] = useState<Quotation>(() => makeEmpty(businessProfile));

  const recalc = (quot: Quotation): Quotation => {
    const taxType = determineTaxType(quot.business.stateCode, quot.client.stateCode);
    const summary = calculateSummary(quot.items, taxType, quot.summary.discountType, quot.summary.discountValue);
    return { ...quot, taxType, summary };
  };

  const update = (partial: Partial<Quotation>) => setQ(prev => recalc({ ...prev, ...partial }));

  function handleSave() {
    if (!q.business.name) { showToast('Business name required', 'error'); return; }
    if (!q.client.name) { showToast('Client name required', 'error'); return; }
    if (q.items.length === 0) { showToast('Add at least one item', 'error'); return; }
    saveQuotation(q);
    showToast('Quotation saved');
    navigate('/quotations');
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">New Quotation</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/quotations')}>Cancel</Button>
          <Button onClick={handleSave}>Save Quotation</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Quotation Number" value={q.quotationNumber} onChange={e => update({ quotationNumber: e.target.value })} />
          <Input label="Valid Until" type="date" value={dayjs(q.validUntil).format('YYYY-MM-DD')} onChange={e => update({ validUntil: dayjs(e.target.value).toISOString() })} />
        </div>
        <BusinessDetails business={q.business} onChange={business => update({ business })} />
        <ClientDetails client={q.client} onChange={client => update({ client })} />
        <LineItems items={q.items} onChange={items => update({ items })} />
        <Totals
          summary={q.summary}
          reverseCharge={false}
          taxType={q.taxType}
          onDiscountChange={(type, value) => update({ summary: { ...q.summary, discountType: type, discountValue: value } })}
          onReverseChargeChange={() => {}}
        />
        <Textarea label="Notes" value={q.notes} onChange={e => update({ notes: e.target.value })} rows={2} placeholder="Valid for 30 days from date of issue." />
        <Textarea label="Terms" value={q.terms} onChange={e => update({ terms: e.target.value })} rows={2} />
      </div>
    </div>
  );
}
