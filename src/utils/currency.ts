export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

// Static approximate rates vs INR (for display only — not for financial use)
export const APPROX_RATES_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  EUR: 90.2,
  GBP: 105.8,
  AED: 22.7,
  SGD: 61.5,
  AUD: 54.2,
  CAD: 61.8,
  JPY: 0.55,
};

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code === code)?.symbol || code;
}

export function formatAmount(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode);
  if (currencyCode === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function convertFromINR(amountINR: number, toCurrency: string): number {
  const rate = APPROX_RATES_TO_INR[toCurrency] || 1;
  return amountINR / rate;
}

export function convertToINR(amount: number, fromCurrency: string): number {
  const rate = APPROX_RATES_TO_INR[fromCurrency] || 1;
  return amount * rate;
}
