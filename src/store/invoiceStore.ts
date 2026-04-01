import { create } from 'zustand';
import type { Invoice, BusinessProfile, SavedClient, Expense, RecurringInvoice, Quotation, CreditNote } from '../types/invoice';
import { localStorageService } from '../utils/localStorageService';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

interface InvoiceStore {
  invoices: Invoice[];
  businessProfile: BusinessProfile | null;
  savedClients: SavedClient[];
  expenses: Expense[];
  recurringInvoices: RecurringInvoice[];
  quotations: Quotation[];
  creditNotes: CreditNote[];
  darkMode: boolean;
  accentColor: string;
  onboarded: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  loadAll: () => void;
  saveInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => Invoice | null;
  updateStatus: (id: string, status: Invoice['status']) => void;
  logActivity: (id: string, action: string) => void;
  saveBusinessProfile: (profile: BusinessProfile) => void;
  saveClient: (client: SavedClient) => void;
  deleteClient: (id: string) => void;
  saveExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setAccentColor: (color: string) => void;
  completeOnboarding: () => void;
  toggleDarkMode: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  // Recurring
  saveRecurringInvoice: (r: RecurringInvoice) => void;
  deleteRecurringInvoice: (id: string) => void;
  // Quotations
  saveQuotation: (q: Quotation) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToInvoice: (id: string) => Invoice | null;
  // Credit Notes
  saveCreditNote: (cn: CreditNote) => void;
  deleteCreditNote: (id: string) => void;
}

export const ACCENT_COLORS: { name: string; value: string; bg: string }[] = [
  { name: 'Blue', value: '#2563eb', bg: 'bg-blue-600' },
  { name: 'Purple', value: '#7c3aed', bg: 'bg-purple-600' },
  { name: 'Green', value: '#16a34a', bg: 'bg-green-600' },
  { name: 'Orange', value: '#ea580c', bg: 'bg-orange-600' },
  { name: 'Rose', value: '#e11d48', bg: 'bg-rose-600' },
  { name: 'Teal', value: '#0d9488', bg: 'bg-teal-600' },
];

function applyAccentColor(color: string) {
  document.documentElement.style.setProperty('--accent', color);
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  businessProfile: null,
  savedClients: [],
  expenses: [],
  recurringInvoices: [],
  quotations: [],
  creditNotes: [],
  darkMode: false,
  accentColor: '#2563eb',
  onboarded: false,
  toast: null,

  loadAll: () => {
    const invoices = localStorageService.getInvoices();
    const businessProfile = localStorageService.getBusinessProfile();
    const savedClients = localStorageService.getSavedClients();
    const expenses = localStorageService.getExpenses();
    const darkMode = localStorageService.getDarkMode();
    const onboarded = localStorageService.isOnboarded();
    const recurringInvoices = localStorageService.getRecurringInvoices();
    const quotations = localStorageService.getQuotations();
    const creditNotes = localStorageService.getCreditNotes();
    const accentColor = businessProfile?.accentColor || '#2563eb';
    set({ invoices, businessProfile, savedClients, expenses, darkMode, onboarded, accentColor, recurringInvoices, quotations, creditNotes });
    if (darkMode) document.documentElement.classList.add('dark');
    applyAccentColor(accentColor);
  },

  saveInvoice: (invoice) => {
    localStorageService.saveInvoice(invoice);
    set({ invoices: localStorageService.getInvoices() });
  },

  deleteInvoice: (id) => {
    localStorageService.deleteInvoice(id);
    set({ invoices: localStorageService.getInvoices() });
  },

  duplicateInvoice: (id) => {
    const original = localStorageService.getInvoiceById(id);
    if (!original) return null;
    const profile = get().businessProfile;
    const newInvoice: Invoice = {
      ...original,
      id: uuidv4(),
      invoiceNumber: localStorageService.getNextInvoiceNumber(
        original.invoiceNumberPrefix || profile?.invoicePrefix || 'INV'
      ),
      createdAt: dayjs().toISOString(),
      dueDate: dayjs().add(30, 'day').toISOString(),
      status: 'Unpaid',
      payments: [],
      activityLog: [{ id: uuidv4(), action: 'Duplicated from ' + original.invoiceNumber, timestamp: dayjs().toISOString() }],
    };
    localStorageService.saveInvoice(newInvoice);
    set({ invoices: localStorageService.getInvoices() });
    return newInvoice;
  },

  updateStatus: (id, status) => {
    const invoices = localStorageService.getInvoices();
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;
    const log = [...(inv.activityLog || []), { id: uuidv4(), action: `Status changed to ${status}`, timestamp: dayjs().toISOString() }];
    const updated = { ...inv, status, activityLog: log };
    localStorageService.saveInvoice(updated);
    set({ invoices: localStorageService.getInvoices() });
  },

  logActivity: (id, action) => {
    const inv = localStorageService.getInvoiceById(id);
    if (!inv) return;
    const log = [...(inv.activityLog || []), { id: uuidv4(), action, timestamp: dayjs().toISOString() }];
    localStorageService.saveInvoice({ ...inv, activityLog: log });
    set({ invoices: localStorageService.getInvoices() });
  },

  saveBusinessProfile: (profile) => {
    localStorageService.saveBusinessProfile(profile);
    applyAccentColor(profile.accentColor || '#2563eb');
    set({ businessProfile: profile, accentColor: profile.accentColor || '#2563eb' });
  },

  saveClient: (client) => {
    localStorageService.saveClient(client);
    set({ savedClients: localStorageService.getSavedClients() });
  },

  deleteClient: (id) => {
    localStorageService.deleteClient(id);
    set({ savedClients: localStorageService.getSavedClients() });
  },

  saveExpense: (expense) => {
    localStorageService.saveExpense(expense);
    set({ expenses: localStorageService.getExpenses() });
  },

  deleteExpense: (id) => {
    localStorageService.deleteExpense(id);
    set({ expenses: localStorageService.getExpenses() });
  },

  setAccentColor: (color) => {
    applyAccentColor(color);
    set({ accentColor: color });
    const profile = get().businessProfile;
    if (profile) {
      const updated = { ...profile, accentColor: color };
      localStorageService.saveBusinessProfile(updated);
      set({ businessProfile: updated });
    }
  },

  completeOnboarding: () => {
    localStorageService.setOnboarded();
    set({ onboarded: true });
  },

  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorageService.setDarkMode(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    set({ darkMode: next });
  },

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },

  clearToast: () => set({ toast: null }),

  // ── Recurring Invoices ────────────────────────────────────
  saveRecurringInvoice: (r) => {
    localStorageService.saveRecurringInvoice(r);
    set({ recurringInvoices: localStorageService.getRecurringInvoices() });
  },
  deleteRecurringInvoice: (id) => {
    localStorageService.deleteRecurringInvoice(id);
    set({ recurringInvoices: localStorageService.getRecurringInvoices() });
  },

  // ── Quotations ────────────────────────────────────────────
  saveQuotation: (q) => {
    localStorageService.saveQuotation(q);
    set({ quotations: localStorageService.getQuotations() });
  },
  deleteQuotation: (id) => {
    localStorageService.deleteQuotation(id);
    set({ quotations: localStorageService.getQuotations() });
  },
  convertQuotationToInvoice: (id) => {
    const q = localStorageService.getQuotations().find(x => x.id === id);
    if (!q) return null;
    const profile = get().businessProfile;
    const newInvoice: Invoice = {
      id: uuidv4(),
      invoiceNumber: localStorageService.getNextInvoiceNumber(profile?.invoicePrefix || 'INV'),
      createdAt: dayjs().toISOString(),
      dueDate: dayjs().add(30, 'day').toISOString(),
      status: 'Unpaid',
      business: q.business,
      client: q.client,
      items: q.items,
      taxType: q.taxType,
      reverseCharge: false,
      summary: q.summary,
      template: q.template,
      notes: q.notes,
      terms: q.terms,
      currency: q.currency,
      payments: [],
      invoiceNumberPrefix: profile?.invoicePrefix || 'INV',
      activityLog: [{ id: uuidv4(), action: `Converted from Quotation ${q.quotationNumber}`, timestamp: dayjs().toISOString() }],
    };
    localStorageService.saveInvoice(newInvoice);
    const updated = { ...q, status: 'Converted' as const, convertedInvoiceId: newInvoice.id };
    localStorageService.saveQuotation(updated);
    set({ invoices: localStorageService.getInvoices(), quotations: localStorageService.getQuotations() });
    return newInvoice;
  },

  // ── Credit Notes ──────────────────────────────────────────
  saveCreditNote: (cn) => {
    localStorageService.saveCreditNote(cn);
    set({ creditNotes: localStorageService.getCreditNotes() });
  },
  deleteCreditNote: (id) => {
    localStorageService.deleteCreditNote(id);
    set({ creditNotes: localStorageService.getCreditNotes() });
  },
}));
