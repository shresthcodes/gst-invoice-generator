import type { Invoice, BusinessProfile, SavedClient, Expense, RecurringInvoice, Quotation, CreditNote } from '../types/invoice';

const INVOICES_KEY = 'gst_invoices';
const BUSINESS_KEY = 'gst_business_profile';
const COUNTER_KEY = 'gst_invoice_counter';
const THEME_KEY = 'gst_dark_mode';
const CLIENTS_KEY = 'gst_saved_clients';
const EXPENSES_KEY = 'gst_expenses';
const ONBOARDED_KEY = 'gst_onboarded';
const RECURRING_KEY = 'gst_recurring_invoices';
const QUOTATIONS_KEY = 'gst_quotations';
const QUOTATION_COUNTER_KEY = 'gst_quotation_counter';
const CREDIT_NOTES_KEY = 'gst_credit_notes';
const CREDIT_NOTE_COUNTER_KEY = 'gst_credit_note_counter';

export const localStorageService = {
  // ── Invoices ──────────────────────────────────────────────
  getInvoices(): Invoice[] {
    try { return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]'); }
    catch { return []; }
  },

  saveInvoice(invoice: Invoice): void {
    const invoices = localStorageService.getInvoices();
    const idx = invoices.findIndex(i => i.id === invoice.id);
    if (idx >= 0) invoices[idx] = invoice;
    else invoices.unshift(invoice);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  },

  deleteInvoice(id: string): void {
    const invoices = localStorageService.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  },

  getInvoiceById(id: string): Invoice | undefined {
    return localStorageService.getInvoices().find(i => i.id === id);
  },

  getNextInvoiceNumber(prefix = 'INV'): string {
    const year = new Date().getFullYear();
    const counter = parseInt(localStorage.getItem(COUNTER_KEY) || '0') + 1;
    localStorage.setItem(COUNTER_KEY, String(counter));
    return `${prefix}-${year}-${String(counter).padStart(3, '0')}`;
  },

  // ── Business Profile ──────────────────────────────────────
  getBusinessProfile(): BusinessProfile | null {
    try { return JSON.parse(localStorage.getItem(BUSINESS_KEY) || 'null'); }
    catch { return null; }
  },

  saveBusinessProfile(profile: BusinessProfile): void {
    localStorage.setItem(BUSINESS_KEY, JSON.stringify(profile));
  },

  // ── Saved Clients ─────────────────────────────────────────
  getSavedClients(): SavedClient[] {
    try { return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]'); }
    catch { return []; }
  },

  saveClient(client: SavedClient): void {
    const clients = localStorageService.getSavedClients();
    const idx = clients.findIndex(c => c.id === client.id);
    if (idx >= 0) clients[idx] = client;
    else clients.unshift(client);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  },

  deleteClient(id: string): void {
    const clients = localStorageService.getSavedClients().filter(c => c.id !== id);
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  },

  // ── Theme ─────────────────────────────────────────────────
  getDarkMode(): boolean { return localStorage.getItem(THEME_KEY) === 'true'; },
  setDarkMode(val: boolean): void { localStorage.setItem(THEME_KEY, String(val)); },

  // ── Expenses ──────────────────────────────────────────────
  getExpenses(): Expense[] {
    try { return JSON.parse(localStorage.getItem(EXPENSES_KEY) || '[]'); }
    catch { return []; }
  },
  saveExpense(expense: Expense): void {
    const expenses = localStorageService.getExpenses();
    const idx = expenses.findIndex(e => e.id === expense.id);
    if (idx >= 0) expenses[idx] = expense;
    else expenses.unshift(expense);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },
  deleteExpense(id: string): void {
    const expenses = localStorageService.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },

  // ── Onboarding ────────────────────────────────────────────
  isOnboarded(): boolean { return localStorage.getItem(ONBOARDED_KEY) === 'true'; },
  setOnboarded(): void { localStorage.setItem(ONBOARDED_KEY, 'true'); },

  // ── Backup / Restore ──────────────────────────────────────
  exportBackup(): void {
    const data = {
      invoices: localStorageService.getInvoices(),
      businessProfile: localStorageService.getBusinessProfile(),
      savedClients: localStorageService.getSavedClients(),
      expenses: localStorageService.getExpenses(),
      recurringInvoices: localStorageService.getRecurringInvoices(),
      quotations: localStorageService.getQuotations(),
      creditNotes: localStorageService.getCreditNotes(),
      counter: localStorage.getItem(COUNTER_KEY),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gst-invoice-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportCSV(): void {
    const invoices = localStorageService.getInvoices();
    const rows = [
      ['Invoice No', 'Date', 'Client', 'Status', 'Subtotal', 'Tax', 'Total', 'Currency'],
      ...invoices.map(inv => [
        inv.invoiceNumber, inv.createdAt.slice(0, 10), inv.client.name,
        inv.status, inv.summary.subtotal, inv.summary.totalTax,
        inv.summary.finalAmount, inv.currency || 'INR',
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup(json: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(json);
      if (data.invoices) localStorage.setItem(INVOICES_KEY, JSON.stringify(data.invoices));
      if (data.businessProfile) localStorage.setItem(BUSINESS_KEY, JSON.stringify(data.businessProfile));
      if (data.savedClients) localStorage.setItem(CLIENTS_KEY, JSON.stringify(data.savedClients));
      if (data.expenses) localStorage.setItem(EXPENSES_KEY, JSON.stringify(data.expenses));
      if (data.recurringInvoices) localStorage.setItem(RECURRING_KEY, JSON.stringify(data.recurringInvoices));
      if (data.quotations) localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(data.quotations));
      if (data.creditNotes) localStorage.setItem(CREDIT_NOTES_KEY, JSON.stringify(data.creditNotes));
      if (data.counter) localStorage.setItem(COUNTER_KEY, data.counter);
      return { success: true, message: `Restored ${data.invoices?.length || 0} invoices` };
    } catch {
      return { success: false, message: 'Invalid backup file' };
    }
  },

  // ── Recurring Invoices ────────────────────────────────────
  getRecurringInvoices(): RecurringInvoice[] {
    try { return JSON.parse(localStorage.getItem(RECURRING_KEY) || '[]'); }
    catch { return []; }
  },
  saveRecurringInvoice(r: RecurringInvoice): void {
    const list = localStorageService.getRecurringInvoices();
    const idx = list.findIndex(x => x.id === r.id);
    if (idx >= 0) list[idx] = r; else list.unshift(r);
    localStorage.setItem(RECURRING_KEY, JSON.stringify(list));
  },
  deleteRecurringInvoice(id: string): void {
    const list = localStorageService.getRecurringInvoices().filter(r => r.id !== id);
    localStorage.setItem(RECURRING_KEY, JSON.stringify(list));
  },

  // ── Quotations ────────────────────────────────────────────
  getQuotations(): Quotation[] {
    try { return JSON.parse(localStorage.getItem(QUOTATIONS_KEY) || '[]'); }
    catch { return []; }
  },
  saveQuotation(q: Quotation): void {
    const list = localStorageService.getQuotations();
    const idx = list.findIndex(x => x.id === q.id);
    if (idx >= 0) list[idx] = q; else list.unshift(q);
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(list));
  },
  deleteQuotation(id: string): void {
    const list = localStorageService.getQuotations().filter(q => q.id !== id);
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(list));
  },
  getNextQuotationNumber(prefix = 'QT'): string {
    const year = new Date().getFullYear();
    const counter = parseInt(localStorage.getItem(QUOTATION_COUNTER_KEY) || '0') + 1;
    localStorage.setItem(QUOTATION_COUNTER_KEY, String(counter));
    return `${prefix}-${year}-${String(counter).padStart(3, '0')}`;
  },

  // ── Credit Notes ──────────────────────────────────────────
  getCreditNotes(): CreditNote[] {
    try { return JSON.parse(localStorage.getItem(CREDIT_NOTES_KEY) || '[]'); }
    catch { return []; }
  },
  saveCreditNote(cn: CreditNote): void {
    const list = localStorageService.getCreditNotes();
    const idx = list.findIndex(x => x.id === cn.id);
    if (idx >= 0) list[idx] = cn; else list.unshift(cn);
    localStorage.setItem(CREDIT_NOTES_KEY, JSON.stringify(list));
  },
  deleteCreditNote(id: string): void {
    const list = localStorageService.getCreditNotes().filter(cn => cn.id !== id);
    localStorage.setItem(CREDIT_NOTES_KEY, JSON.stringify(list));
  },
  getNextCreditNoteNumber(prefix = 'CN'): string {
    const year = new Date().getFullYear();
    const counter = parseInt(localStorage.getItem(CREDIT_NOTE_COUNTER_KEY) || '0') + 1;
    localStorage.setItem(CREDIT_NOTE_COUNTER_KEY, String(counter));
    return `${prefix}-${year}-${String(counter).padStart(3, '0')}`;
  },
};
