import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Invoice } from '../types/invoice';
import { useInvoices } from '../hooks/useInvoices';
import { calculateSummary, determineTaxType } from '../utils/gstCalculator';
import { localStorageService } from '../utils/localStorageService';
import { CURRENCIES } from '../utils/currency';
import { v4 as uuidv4 } from 'uuid';
import { useAutosave, clearDraft } from '../hooks/useAutosave';
import BusinessDetails from '../components/InvoiceForm/BusinessDetails';
import ClientDetails from '../components/InvoiceForm/ClientDetails';
import LineItems from '../components/InvoiceForm/LineItems';
import Totals from '../components/InvoiceForm/Totals';
import PaymentTracker from '../components/InvoiceForm/PaymentTracker';
import InvoicePreview from '../components/InvoicePreview/InvoicePreview';
import Input, { Select, Textarea } from '../components/Common/Input';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, LayoutTemplate } from 'lucide-react';

interface Props { mode?: 'create' | 'edit' }

export default function CreateInvoice({ mode = 'create' }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createNewInvoice, saveInvoice, showToast } = useInvoices();

  const [invoice, setInvoice] = useState<Invoice>(() => {
    if (mode === 'edit' && id) {
      const existing = localStorageService.getInvoiceById(id);
      if (existing) return { ...existing, payments: existing.payments || [], invoiceNumberPrefix: existing.invoiceNumberPrefix || 'INV', activityLog: existing.activityLog || [] };
    }
    return { ...createNewInvoice(), activityLog: [] };
  });

  const recalc = (inv: Invoice): Invoice => {
    const taxType = determineTaxType(inv.business.stateCode, inv.client.stateCode);
    const summary = calculateSummary(inv.items, taxType, inv.summary.discountType, inv.summary.discountValue);
    const totalPaid = (inv.payments || []).reduce((s: number, p: any) => s + p.amount, 0);
    let status = inv.status;
    if (totalPaid >= summary.finalAmount && summary.finalAmount > 0) status = 'Paid';
    else if (totalPaid > 0) status = 'Partial';
    return { ...inv, taxType, summary, status };
  };

  useAutosave(invoice, mode === 'create');

  const update = (partial: Partial<Invoice>) =>
    setInvoice(prev => recalc({ ...prev, ...partial }));

  const handleSave = useCallback(() => {
    if (!invoice.business.name) { showToast('Business name is required', 'error'); return; }
    if (!invoice.client.name) { showToast('Client name is required', 'error'); return; }
    if (invoice.items.length === 0) { showToast('Add at least one line item', 'error'); return; }
    const action = mode === 'edit' ? 'Invoice updated' : 'Invoice created';
    const log = [...(invoice.activityLog || []), { id: uuidv4(), action, timestamp: new Date().toISOString() }];
    saveInvoice({ ...invoice, activityLog: log });
    clearDraft();
    showToast(mode === 'edit' ? 'Invoice updated! (Ctrl+S)' : 'Invoice saved!');
    navigate(`/invoice/${invoice.id}/preview`);
  }, [invoice, mode, saveInvoice, showToast, navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const templates: Invoice['template'][] = ['minimal', 'professional', 'modern', 'compact'];

  return (
    <div className="flex h-[calc(100vh-[73px])] pt-2">
      {/* Left: Form - Clean Wizard Style */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-1/2 flex flex-col border-r border-gray-200 dark:border-white/5 bg-slate-50 dark:bg-[#0a0a0f] relative z-10"
      >
        {/* Sticky Header with Glassmorphism */}
        <div className="sticky top-0 z-20 glass px-6 py-4 flex items-center justify-between border-b border-gray-200/50 dark:border-white/5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {mode === 'edit' ? 'Edit Invoice' : 'New Invoice'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400">
              {invoice.status}
            </span>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-smooth">
          
          <motion.div layout className="grid grid-cols-2 gap-4 bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <Input label="Invoice No." value={invoice.invoiceNumber} onChange={(e: any) => update({ invoiceNumber: e.target.value })} />
            <Select label="Status" value={invoice.status} onChange={(e: any) => update({ status: e.target.value as Invoice['status'] })}>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
            </Select>
            <Input label="Date" type="date" value={dayjs(invoice.createdAt).format('YYYY-MM-DD')} onChange={(e: any) => update({ createdAt: dayjs(e.target.value).toISOString() })} />
            <Input label="Due Date" type="date" value={dayjs(invoice.dueDate).format('YYYY-MM-DD')} onChange={(e: any) => update({ dueDate: dayjs(e.target.value).toISOString() })} />
            <Select label="Currency" value={invoice.currency || 'INR'} onChange={(e: any) => update({ currency: e.target.value })} className="col-span-2">
              {CURRENCIES.map((c: any) => <option key={c.code} value={c.code}>{c.code} — {c.name} ({c.symbol})</option>)}
            </Select>
          </motion.div>

          <motion.div layout className="space-y-6">
            <BusinessDetails business={invoice.business} onChange={(business: any) => update({ business })} />
            <ClientDetails client={invoice.client} onChange={(client: any) => update({ client })} />
            
            <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 lg:col-span-2 pb-6">
               {/* Wrapped LineItems to give it space */}
               <LineItems items={invoice.items} onChange={(items: any) => update({ items })} />
            </div>

            <Totals
              summary={invoice.summary}
              reverseCharge={invoice.reverseCharge}
              taxType={invoice.taxType}
              onDiscountChange={(type: any, value: any) => update({ summary: { ...invoice.summary, discountType: type, discountValue: value } })}
              onReverseChargeChange={(val: any) => update({ reverseCharge: val })}
            />
            
            <PaymentTracker
              payments={invoice.payments || []}
              totalAmount={invoice.summary.finalAmount}
              onChange={(payments: any) => update({ payments })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
              <Textarea label="Notes" value={invoice.notes} onChange={(e: any) => update({ notes: e.target.value })} rows={3} placeholder="Thank you for your business!" />
              <Textarea label="Terms & Conditions" value={invoice.terms} onChange={(e: any) => update({ terms: e.target.value })} rows={3} placeholder="Payment due within 30 days." />
            </div>

            {/* Template Switcher */}
            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <LayoutTemplate className="w-4 h-4 text-indigo-500" />
                Template Design
              </div>
              <div className="flex gap-2">
                {templates.map(t => (
                  <button key={t} onClick={() => update({ template: t })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${invoice.template === t ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-400 py-4 opacity-60">
              Pro tip: Use <kbd className="font-mono bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded">Ctrl+S</kbd> to save anytime
            </div>
            
          </motion.div>
        </div>
      </motion.div>

      {/* Right: Live Preview */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#0f111a] dark:to-[#0a0a0f] items-start justify-center overflow-y-auto"
      >
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="sticky top-8 origin-top scale-[0.7] transform-gpu transition-transform hover:scale-[0.72] duration-300">
          <div className="shadow-2xl shadow-black/20 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10 bg-white">
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
