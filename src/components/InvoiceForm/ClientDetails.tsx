import { useState } from 'react';
import Input, { Select } from '../Common/Input';
import type { Invoice, SavedClient } from '../../types/invoice';
import { INDIAN_STATES, validateGSTIN, getStateFromGSTIN } from '../../utils/gstCalculator';
import { useInvoiceStore } from '../../store/invoiceStore';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  client: Invoice['client'];
  onChange: (client: Invoice['client']) => void;
}

export default function ClientDetails({ client, onChange }: Props) {
  const { savedClients, saveClient, deleteClient, showToast } = useInvoiceStore();
  const [showSaved, setShowSaved] = useState(false);

  const set = (key: keyof Invoice['client'], val: string) =>
    onChange({ ...client, [key]: val });

  const handleStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find(s => s.code === stateCode);
    onChange({ ...client, stateCode, state: state?.name || '' });
  };

  const selectSavedClient = (sc: SavedClient) => {
    onChange({ name: sc.name, gstin: sc.gstin, address: sc.address, city: sc.city, state: sc.state, stateCode: sc.stateCode, phone: sc.phone, email: sc.email });
    setShowSaved(false);
  };

  const handleSaveClient = () => {
    if (!client.name) { showToast('Enter client name first', 'error'); return; }
    const sc: SavedClient = { id: uuidv4(), ...client };
    saveClient(sc);
    showToast(`${client.name} saved to clients`);
  };

  const gstinValid = validateGSTIN(client.gstin);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wide">Bill To (Client)</h3>
        <div className="flex gap-2">
          {savedClients.length > 0 && (
            <button onClick={() => setShowSaved(!showSaved)} className="text-xs text-blue-600 hover:underline">
              {showSaved ? 'Hide' : `Saved (${savedClients.length})`}
            </button>
          )}
          <button onClick={handleSaveClient} className="text-xs text-green-600 hover:underline">+ Save Client</button>
        </div>
      </div>

      {/* Saved clients dropdown */}
      {showSaved && savedClients.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 max-h-40 overflow-y-auto">
          {savedClients.map(sc => (
            <div key={sc.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => selectSavedClient(sc)}>
              <div>
                <div className="text-sm font-medium">{sc.name}</div>
                <div className="text-xs text-gray-400">{sc.city} · {sc.gstin || 'No GSTIN'}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteClient(sc.id); }} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input label="Client Name *" value={client.name} onChange={e => set('name', e.target.value)} placeholder="Client Company Ltd" />
        </div>
        <div className="col-span-2">
          <Input
            label="Client GSTIN"
            value={client.gstin}
            onChange={e => {
              const val = e.target.value.toUpperCase();
              const detected = getStateFromGSTIN(val);
              if (detected && !client.stateCode) {
                onChange({ ...client, gstin: val, stateCode: detected.stateCode, state: detected.state });
              } else {
                set('gstin', val);
              }
            }}
            placeholder="29AAPFU0939F1ZV"
            error={client.gstin && !gstinValid ? 'Invalid GSTIN format' : undefined}
          />
          {client.gstin.length >= 2 && getStateFromGSTIN(client.gstin) && (
            <div className="text-xs text-indigo-500 mt-0.5">
              📍 {getStateFromGSTIN(client.gstin)?.state} auto-detected
            </div>
          )}
        </div>
        <div className="col-span-2">
          <Input label="Address" value={client.address} onChange={e => set('address', e.target.value)} placeholder="456, Client Street" />
        </div>
        <Input label="City" value={client.city} onChange={e => set('city', e.target.value)} placeholder="Bangalore" />
        <Select label="State" value={client.stateCode} onChange={e => handleStateChange(e.target.value)}>
          <option value="">Select State</option>
          {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
        </Select>
        <Input label="Phone" value={client.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
        <Input label="Email" value={client.email} onChange={e => set('email', e.target.value)} placeholder="client@company.com" />
      </div>
    </div>
  );
}
