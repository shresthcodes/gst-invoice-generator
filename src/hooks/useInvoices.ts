import { useInvoiceStore } from '../store/invoiceStore';
import type { Invoice } from '../types/invoice';
import { localStorageService } from '../utils/localStorageService';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

export function useInvoices() {
  const store = useInvoiceStore();

  function createNewInvoice(): Invoice {
    // Read directly from localStorage to avoid race condition with Zustand hydration
    const profile = localStorageService.getBusinessProfile() || store.businessProfile;
    const prefix = profile?.invoicePrefix || 'INV';
    return {
      id: uuidv4(),
      invoiceNumber: localStorageService.getNextInvoiceNumber(prefix),
      invoiceNumberPrefix: prefix,
      createdAt: dayjs().toISOString(),
      dueDate: dayjs().add(30, 'day').toISOString(),
      status: 'Unpaid',
      business: {
        name: profile?.name || '',
        gstin: profile?.gstin || '',
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        stateCode: profile?.stateCode || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
        logo: profile?.logo || '',
        signature: profile?.signature || '',
      },
      client: { name: '', gstin: '', address: '', city: '', state: '', stateCode: '', phone: '', email: '' },
      items: [],
      taxType: 'CGST_SGST',
      reverseCharge: false,
      summary: {
        subtotal: 0, discountType: 'flat', discountValue: 0, discountAmount: 0,
        taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0,
        grandTotal: 0, roundOff: 0, finalAmount: 0,
      },
      template: 'professional',
      notes: '',
      terms: profile?.defaultTerms || 'Payment due within 30 days.',
      currency: 'INR',
      payments: [],
      activityLog: [],
    };
  }

  return { ...store, createNewInvoice };
}
