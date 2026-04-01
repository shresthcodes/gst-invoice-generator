import Input, { Select } from '../Common/Input';
import ImageUpload from '../Common/ImageUpload';
import type { Invoice } from '../../types/invoice';
import { INDIAN_STATES, validateGSTIN, getStateFromGSTIN } from '../../utils/gstCalculator';

interface Props {
  business: Invoice['business'];
  onChange: (business: Invoice['business']) => void;
}

export default function BusinessDetails({ business, onChange }: Props) {
  const set = (key: keyof Invoice['business'], val: string) =>
    onChange({ ...business, [key]: val });

  const handleStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find(s => s.code === stateCode);
    onChange({ ...business, stateCode, state: state?.name || '' });
  };

  const gstinValid = validateGSTIN(business.gstin);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Your Business</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input label="Business Name *" value={business.name} onChange={e => set('name', e.target.value)} placeholder="Acme Pvt Ltd" />
        </div>
        <div className="col-span-2">
          <Input
            label="GSTIN"
            value={business.gstin}
            onChange={e => {
              const val = e.target.value.toUpperCase();
              const detected = getStateFromGSTIN(val);
              if (detected && !business.stateCode) {
                onChange({ ...business, gstin: val, stateCode: detected.stateCode, state: detected.state });
              } else {
                set('gstin', val);
              }
            }}
            placeholder="27AAPFU0939F1ZV"
            error={business.gstin && !gstinValid ? 'Invalid GSTIN format' : undefined}
          />
          {business.gstin.length >= 2 && getStateFromGSTIN(business.gstin) && !gstinValid && (
            <div className="text-xs text-indigo-500 mt-0.5">State detected: {getStateFromGSTIN(business.gstin)?.state}</div>
          )}
        </div>
        <div className="col-span-2">
          <Input label="Address" value={business.address} onChange={e => set('address', e.target.value)} placeholder="123, Main Street" />
        </div>
        <Input label="City" value={business.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
        <Select label="State" value={business.stateCode} onChange={e => handleStateChange(e.target.value)}>
          <option value="">Select State</option>
          {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
        </Select>
        <Input label="Phone" value={business.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
        <Input label="Email" value={business.email} onChange={e => set('email', e.target.value)} placeholder="hello@acme.com" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImageUpload
          label="Business Logo"
          value={business.logo}
          onChange={val => set('logo', val)}
          onClear={() => set('logo', '')}
          placeholder="Upload your logo"
          icon="🏢"
        />
        <ImageUpload
          label="Signature"
          value={business.signature}
          onChange={val => set('signature', val)}
          onClear={() => set('signature', '')}
          placeholder="Upload signature"
          icon="✍️"
        />
      </div>
    </div>
  );
}
