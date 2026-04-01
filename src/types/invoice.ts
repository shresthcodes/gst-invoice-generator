export interface LineItem {
  id: string;
  description: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  taxPercent: number;
  amount: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Partial';
  business: {
    name: string; gstin: string; address: string; city: string;
    state: string; stateCode: string; phone: string; email: string;
    logo: string; signature: string;
  };
  client: {
    name: string; gstin: string; address: string; city: string;
    state: string; stateCode: string; phone: string; email: string;
  };
  items: LineItem[];
  taxType: 'CGST_SGST' | 'IGST';
  reverseCharge: boolean;
  summary: {
    subtotal: number; discountType: 'flat' | 'percent'; discountValue: number;
    discountAmount: number; taxableAmount: number; cgst: number; sgst: number;
    igst: number; totalTax: number; grandTotal: number; roundOff: number; finalAmount: number;
  };
  template: 'minimal' | 'professional' | 'modern' | 'compact';
  notes: string;
  terms: string;
  currency: string;
  payments: Payment[];
  invoiceNumberPrefix: string;
  activityLog: ActivityEntry[];
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  note: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  timestamp: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  gstPercent: number;
  gstAmount: number;
  vendor: string;
}

export interface SavedClient {
  id: string;
  name: string; gstin: string; address: string; city: string;
  state: string; stateCode: string; phone: string; email: string;
}

export interface BusinessProfile {
  name: string; gstin: string; address: string; city: string;
  state: string; stateCode: string; phone: string; email: string;
  logo: string; signature: string; defaultGstRate: number;
  defaultTerms: string; upiId: string; invoicePrefix: string;
  accentColor: string;
}

export interface RecurringInvoice {
  id: string;
  templateInvoiceId: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDueDate: string;
  lastGeneratedDate: string | null;
  active: boolean;
  clientName: string;
  amount: number;
  description: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  createdAt: string;
  validUntil: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Converted';
  convertedInvoiceId?: string;
  business: Invoice['business'];
  client: Invoice['client'];
  items: LineItem[];
  taxType: 'CGST_SGST' | 'IGST';
  summary: Invoice['summary'];
  notes: string;
  terms: string;
  currency: string;
  template: Invoice['template'];
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  createdAt: string;
  reason: string;
  items: LineItem[];
  summary: Invoice['summary'];
  business: Invoice['business'];
  client: Invoice['client'];
  taxType: 'CGST_SGST' | 'IGST';
  currency: string;
  template: Invoice['template'];
}
