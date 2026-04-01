import type { Invoice } from '../../types/invoice';
import { formatCurrency } from '../../utils/invoiceHelpers';
import Input, { Select } from '../Common/Input';

interface Props {
  summary: Invoice['summary'];
  reverseCharge: boolean;
  taxType: Invoice['taxType'];
  onDiscountChange: (type: 'flat' | 'percent', value: number) => void;
  onReverseChargeChange: (val: boolean) => void;
}

export default function Totals({ summary, reverseCharge, taxType, onDiscountChange, onReverseChargeChange }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Summary</h3>

      <div className="flex gap-2 items-end">
        <Select
          label="Discount Type"
          value={summary.discountType}
          onChange={e => onDiscountChange(e.target.value as 'flat' | 'percent', summary.discountValue)}
          className="w-32"
        >
          <option value="flat">Flat (₹)</option>
          <option value="percent">Percent (%)</option>
        </Select>
        <Input
          label="Discount Value"
          type="number" min="0"
          value={summary.discountValue}
          onChange={e => onDiscountChange(summary.discountType, parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="reverseCharge"
          checked={reverseCharge}
          onChange={e => onReverseChargeChange(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="reverseCharge" className="text-sm text-gray-600 dark:text-gray-400">Reverse Charge Applicable</label>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-1.5 text-sm">
        <Row label="Subtotal" value={formatCurrency(summary.subtotal)} />
        {summary.discountAmount > 0 && <Row label={`Discount (${summary.discountType === 'percent' ? summary.discountValue + '%' : '₹' + summary.discountValue})`} value={`- ${formatCurrency(summary.discountAmount)}`} />}
        <Row label="Taxable Amount" value={formatCurrency(summary.taxableAmount)} />
        {taxType === 'CGST_SGST' ? (
          <>
            <Row label="CGST" value={formatCurrency(summary.cgst)} />
            <Row label="SGST" value={formatCurrency(summary.sgst)} />
          </>
        ) : (
          <Row label="IGST" value={formatCurrency(summary.igst)} />
        )}
        {summary.roundOff !== 0 && <Row label="Round Off" value={formatCurrency(summary.roundOff)} />}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5">
          <Row label="Grand Total" value={formatCurrency(summary.finalAmount)} bold />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-base' : 'text-gray-600 dark:text-gray-400'}`}>
      <span>{label}</span>
      <span className={bold ? 'text-blue-600 dark:text-blue-400' : ''}>{value}</span>
    </div>
  );
}
