import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import type { Invoice, BusinessProfile, Expense } from '../types/invoice';
import { calculateSummary } from './gstCalculator';

const business = {
  name: 'TechSolutions Pvt Ltd',
  gstin: '27AAPFU0939F1ZV',
  address: '45, Bandra Kurla Complex',
  city: 'Mumbai',
  state: 'Maharashtra',
  stateCode: '27',
  phone: '+91 98765 43210',
  email: 'billing@techsolutions.in',
  logo: '',
  signature: '',
};

const clients = [
  { name: 'Infosys Limited', gstin: '29AABCI1681G1ZK', address: 'Electronics City', city: 'Bangalore', state: 'Karnataka', stateCode: '29', phone: '+91 80 2852 0261', email: 'accounts@infosys.com' },
  { name: 'Tata Consultancy Services', gstin: '27AAACT2727Q1ZX', address: 'TCS House, Raveline Street', city: 'Mumbai', state: 'Maharashtra', stateCode: '27', phone: '+91 22 6778 9999', email: 'vendor@tcs.com' },
  { name: 'Wipro Technologies', gstin: '29AAACW0867R1ZP', address: 'Sarjapur Road', city: 'Bangalore', state: 'Karnataka', stateCode: '29', phone: '+91 80 2844 0011', email: 'payments@wipro.com' },
  { name: 'HCL Technologies', gstin: '09AAACH1645R1ZA', address: 'Sector 126, Noida', city: 'Noida', state: 'Uttar Pradesh', stateCode: '09', phone: '+91 120 432 5000', email: 'finance@hcl.com' },
  { name: 'Razorpay Software Pvt Ltd', gstin: '29AAFCR3277N1ZT', address: 'SJR Cyber, Laskar Hosur Road', city: 'Bangalore', state: 'Karnataka', stateCode: '29', phone: '+91 80 4600 0000', email: 'billing@razorpay.com' },
];

const services = [
  { description: 'Web Application Development', hsnSac: '998314', rate: 85000, taxPercent: 18 },
  { description: 'UI/UX Design Services', hsnSac: '998312', rate: 45000, taxPercent: 18 },
  { description: 'Cloud Infrastructure Setup', hsnSac: '998315', rate: 35000, taxPercent: 18 },
  { description: 'API Integration & Testing', hsnSac: '998314', rate: 28000, taxPercent: 18 },
  { description: 'Mobile App Development', hsnSac: '998314', rate: 120000, taxPercent: 18 },
  { description: 'SEO & Digital Marketing', hsnSac: '998361', rate: 22000, taxPercent: 18 },
  { description: 'Database Design & Optimization', hsnSac: '998315', rate: 18000, taxPercent: 18 },
  { description: 'Annual Maintenance Contract', hsnSac: '998314', rate: 60000, taxPercent: 18 },
];

function makeInvoice(
  num: number,
  clientIdx: number,
  serviceIdxs: number[],
  status: Invoice['status'],
  daysAgo: number,
  template: Invoice['template'] = 'professional'
): Invoice {
  const client = clients[clientIdx];
  const taxType = business.stateCode === client.stateCode ? 'CGST_SGST' : 'IGST';
  const items = serviceIdxs.map(si => {
    const svc = services[si];
    const amount = svc.rate;
    const taxAmount = parseFloat(((amount * svc.taxPercent) / 100).toFixed(2));
    return {
      id: uuidv4(),
      description: svc.description,
      hsnSac: svc.hsnSac,
      quantity: 1,
      rate: svc.rate,
      taxPercent: svc.taxPercent,
      amount,
      taxAmount,
      total: amount + taxAmount,
    };
  });

  const summary = calculateSummary(items, taxType, 'flat', 0);
  const createdAt = dayjs().subtract(daysAgo, 'day').toISOString();
  const dueDate = dayjs().subtract(daysAgo, 'day').add(30, 'day').toISOString();

  return {
    id: uuidv4(),
    invoiceNumber: `INV-2026-${String(num).padStart(3, '0')}`,
    invoiceNumberPrefix: 'INV',
    createdAt,
    dueDate,
    status,
    business,
    client,
    items,
    taxType,
    reverseCharge: false,
    summary,
    template,
    notes: 'Thank you for your business. We look forward to working with you again.',
    terms: 'Payment due within 30 days. Late payments subject to 2% monthly interest.',
    currency: 'INR',
    payments: status === 'Paid' ? [{ id: uuidv4(), date: dayjs().subtract(daysAgo - 5, 'day').toISOString(), amount: summary.finalAmount, method: 'Bank Transfer', note: 'NEFT' }] : [],
    activityLog: [
      { id: uuidv4(), action: 'Invoice created', timestamp: createdAt },
      ...(status === 'Paid' ? [{ id: uuidv4(), action: 'Status changed to Paid', timestamp: dayjs().subtract(daysAgo - 5, 'day').toISOString() }] : []),
    ],
  };
}

export function generateDemoInvoices(): Invoice[] {
  return [
    makeInvoice(1, 0, [0, 1], 'Paid', 45, 'professional'),
    makeInvoice(2, 1, [2, 3], 'Paid', 38, 'modern'),
    makeInvoice(3, 2, [4], 'Unpaid', 25, 'minimal'),
    makeInvoice(4, 3, [5, 6], 'Partial', 18, 'compact'),
    makeInvoice(5, 4, [7], 'Paid', 12, 'professional'),
    makeInvoice(6, 0, [0, 2, 3], 'Unpaid', 5, 'modern'),
    makeInvoice(7, 1, [1, 4], 'Unpaid', 2, 'professional'),
  ];
}

export function generateDemoExpenses(): Expense[] {
  return [
    { id: uuidv4(), date: dayjs().subtract(30, 'day').toISOString(), category: 'Software', description: 'GitHub Pro Subscription', amount: 4000, gstPercent: 18, gstAmount: 720, vendor: 'GitHub Inc' },
    { id: uuidv4(), date: dayjs().subtract(25, 'day').toISOString(), category: 'Office', description: 'Office Supplies & Stationery', amount: 2500, gstPercent: 12, gstAmount: 300, vendor: 'Amazon' },
    { id: uuidv4(), date: dayjs().subtract(20, 'day').toISOString(), category: 'Software', description: 'AWS Cloud Services', amount: 12000, gstPercent: 18, gstAmount: 2160, vendor: 'Amazon Web Services' },
    { id: uuidv4(), date: dayjs().subtract(15, 'day').toISOString(), category: 'Travel', description: 'Client Meeting - Bangalore', amount: 8500, gstPercent: 5, gstAmount: 425, vendor: 'IndiGo Airlines' },
    { id: uuidv4(), date: dayjs().subtract(8, 'day').toISOString(), category: 'Marketing', description: 'Google Ads Campaign', amount: 15000, gstPercent: 18, gstAmount: 2700, vendor: 'Google LLC' },
  ];
}

export const demoBusinessProfile: BusinessProfile = {
  ...business,
  defaultGstRate: 18,
  defaultTerms: 'Payment due within 30 days. Late payments subject to 2% monthly interest.',
  upiId: 'techsolutions@upi',
  invoicePrefix: 'INV',
  accentColor: '#2563eb',
};
