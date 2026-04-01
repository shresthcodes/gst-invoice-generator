import type { LineItem, Invoice } from '../types/invoice';

export const GST_SLABS = [0, 5, 12, 18, 28];

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return true;
  return GSTIN_REGEX.test(gstin);
}

/** Auto-detect state from first 2 digits of GSTIN */
export function getStateFromGSTIN(gstin: string): { stateCode: string; state: string } | null {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.substring(0, 2);
  const state = INDIAN_STATES.find(s => s.code === code);
  return state ? { stateCode: state.code, state: state.name } : null;
}

export function determineTaxType(
  businessStateCode: string,
  clientStateCode: string
): 'CGST_SGST' | 'IGST' {
  if (!businessStateCode || !clientStateCode) return 'CGST_SGST';
  return businessStateCode === clientStateCode ? 'CGST_SGST' : 'IGST';
}

export function calculateLineItem(item: Omit<LineItem, 'amount' | 'taxAmount' | 'total'>): LineItem {
  const amount = parseFloat((item.quantity * item.rate).toFixed(2));
  const taxAmount = parseFloat(((amount * item.taxPercent) / 100).toFixed(2));
  const total = parseFloat((amount + taxAmount).toFixed(2));
  return { ...item, amount, taxAmount, total };
}

export function calculateSummary(
  items: LineItem[],
  taxType: 'CGST_SGST' | 'IGST',
  discountType: 'flat' | 'percent',
  discountValue: number
): Invoice['summary'] {
  const subtotal = parseFloat(items.reduce((sum, i) => sum + i.amount, 0).toFixed(2));

  const discountAmount =
    discountType === 'percent'
      ? parseFloat(((subtotal * discountValue) / 100).toFixed(2))
      : parseFloat(discountValue.toFixed(2));

  const taxableAmount = parseFloat((subtotal - discountAmount).toFixed(2));

  // Recalculate tax on taxable amount proportionally
  const totalTaxRaw = items.reduce((sum, item) => {
    const itemTaxableRatio = item.amount / (subtotal || 1);
    const itemTaxable = taxableAmount * itemTaxableRatio;
    return sum + (itemTaxable * item.taxPercent) / 100;
  }, 0);

  const totalTax = parseFloat(totalTaxRaw.toFixed(2));
  const grandTotal = parseFloat((taxableAmount + totalTax).toFixed(2));
  const finalAmountRaw = Math.round(grandTotal);
  const roundOff = parseFloat((finalAmountRaw - grandTotal).toFixed(2));

  const cgst = taxType === 'CGST_SGST' ? parseFloat((totalTax / 2).toFixed(2)) : 0;
  const sgst = taxType === 'CGST_SGST' ? parseFloat((totalTax / 2).toFixed(2)) : 0;
  const igst = taxType === 'IGST' ? totalTax : 0;

  return {
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    cgst,
    sgst,
    igst,
    totalTax,
    grandTotal,
    roundOff,
    finalAmount: finalAmountRaw,
  };
}

export const INDIAN_STATES: { code: string; name: string }[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];
