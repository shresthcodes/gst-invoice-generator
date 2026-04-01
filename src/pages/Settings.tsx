import { useState, useEffect, useRef } from 'react';
import { useInvoiceStore } from '../store/invoiceStore';
import type { BusinessProfile } from '../types/invoice';
import Input, { Select, Textarea } from '../components/Common/Input';
import Button from '../components/Common/Button';
import ImageUpload from '../components/Common/ImageUpload';
import { localStorageService } from '../utils/localStorageService';
import { ACCENT_COLORS } from '../store/invoiceStore';
import { INDIAN_STATES, validateGSTIN } from '../utils/gstCalculator';
import { generateDemoInvoices, generateDemoExpenses, demoBusinessProfile } from '../utils/demoData';

const defaultProfile: BusinessProfile = {
  name: '', gstin: '', address: '', city: '', state: '', stateCode: '',
  phone: '', email: '', logo: '', signature: '', defaultGstRate: 18,
  defaultTerms: 'Payment due within 30 days. Late payments subject to 2% monthly interest.',
  upiId: '', invoicePrefix: 'INV', accentColor: '#2563eb',
};

export default function Settings() {
  const { businessProfile, saveBusinessProfile, showToast, loadAll, savedClients, deleteClient } = useInvoiceStore();
  const [profile, setProfile] = useState<BusinessProfile>({ ...defaultProfile, ...businessProfile });
  const [activeTab, setActiveTab] = useState<'business' | 'clients' | 'backup'>('business');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (businessProfile) setProfile(p => ({ ...defaultProfile, ...businessProfile, ...p }));
  }, [businessProfile]);

  const set = (key: keyof BusinessProfile, val: string | number) =>
    setProfile(p => ({ ...p, [key]: val }));

  const handleStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find(s => s.code === stateCode);
    setProfile(p => ({ ...p, stateCode, state: state?.name || '' }));
  };

  // image uploads now handled by ImageUpload component

  const handleSave = () => {
    if (!profile.name) { showToast('Business name is required', 'error'); return; }
    saveBusinessProfile(profile);
    showToast('Settings saved!');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = localStorageService.importBackup(reader.result as string);
      if (result.success) { loadAll(); showToast(result.message); }
      else showToast(result.message, 'error');
    };
    reader.readAsText(file);
  };

  const gstinValid = validateGSTIN(profile.gstin);
  const tabs = [
    { id: 'business', label: 'Business' },
    { id: 'clients', label: `Saved Clients (${savedClients.length})` },
    { id: 'backup', label: 'Backup & Data' },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${activeTab === t.id ? 'bg-white dark:bg-gray-900 shadow text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Business Tab */}
      {activeTab === 'business' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <Input label="Business Name *" value={profile.name} onChange={e => set('name', e.target.value)} placeholder="Acme Pvt Ltd" />
          <Input label="GSTIN" value={profile.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="27AAPFU0939F1ZV"
            error={profile.gstin && !gstinValid ? 'Invalid GSTIN format' : undefined} />
          <Input label="Address" value={profile.address} onChange={e => set('address', e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={profile.city} onChange={e => set('city', e.target.value)} />
            <Select label="State" value={profile.stateCode} onChange={e => handleStateChange(e.target.value)}>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </Select>
            <Input label="Phone" value={profile.phone} onChange={e => set('phone', e.target.value)} />
            <Input label="Email" value={profile.email} onChange={e => set('email', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ImageUpload
              label="Business Logo"
              value={profile.logo || ''}
              onChange={val => set('logo', val)}
              onClear={() => set('logo', '')}
              placeholder="Upload your logo"
              icon="🏢"
            />
            <ImageUpload
              label="Signature"
              value={profile.signature || ''}
              onChange={val => set('signature', val)}
              onClear={() => set('signature', '')}
              placeholder="Upload signature"
              icon="✍️"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="UPI ID" value={profile.upiId || ''} onChange={e => set('upiId', e.target.value)} placeholder="yourname@upi" />
            <Input label="Invoice Prefix" value={profile.invoicePrefix || 'INV'} onChange={e => set('invoicePrefix', e.target.value.toUpperCase())} placeholder="INV" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">Accent Color</label>
            <div className="flex gap-2 flex-wrap">
              {ACCENT_COLORS.map(c => (
                <button key={c.value} onClick={() => set('accentColor', c.value)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${profile.accentColor === c.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                  title={c.name} />
              ))}
            </div>
          </div>

          <Select label="Default GST Rate" value={profile.defaultGstRate} onChange={e => set('defaultGstRate', parseInt(e.target.value))}>
            {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
          </Select>

          <Textarea label="Default Terms & Conditions" value={profile.defaultTerms} onChange={e => set('defaultTerms', e.target.value)} rows={3} />

          <Button onClick={handleSave} size="lg" className="w-full justify-center">Save Settings</Button>
        </div>
      )}

      {/* Saved Clients Tab */}
      {activeTab === 'clients' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          {savedClients.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-sm">No saved clients yet</div>
              <div className="text-xs mt-1">Save clients from the invoice form to reuse them</div>
            </div>
          ) : (
            <div className="space-y-2">
              {savedClients.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-gray-400">{c.city} · {c.gstin || 'No GSTIN'} · {c.phone}</div>
                  </div>
                  <button onClick={() => { deleteClient(c.id); showToast('Client removed'); }} className="text-red-400 hover:text-red-600 text-sm px-2">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <div>
            <div className="font-medium mb-1">Export Backup</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Download all your invoices, clients and settings as a JSON file.</div>
            <Button onClick={() => { localStorageService.exportBackup(); showToast('Backup downloaded!'); }}>⬇️ Download Backup</Button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="font-medium mb-1">Restore Backup</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Upload a previously exported backup file. This will overwrite current data.</div>
            <input ref={fileRef} type="file" accept=".json" onChange={handleRestore} className="hidden" />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>📂 Choose Backup File</Button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="font-medium mb-1 flex items-center gap-2">
              <span>🎭</span> Demo Data
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Load sample invoices, expenses and business profile to explore all features instantly.
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm('This will add demo invoices and expenses. Continue?')) {
                  // Load demo business profile
                  localStorageService.saveBusinessProfile(demoBusinessProfile);
                  // Load demo invoices
                  generateDemoInvoices().forEach(inv => localStorageService.saveInvoice(inv));
                  // Load demo expenses
                  generateDemoExpenses().forEach(exp => localStorageService.saveExpense(exp));
                  // Set counter
                  localStorage.setItem('gst_invoice_counter', '7');
                  loadAll();
                  showToast('Demo data loaded! 7 invoices + 5 expenses added 🎉');
                }
              }}
            >
              🎭 Load Demo Data
            </Button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="font-medium text-red-600 mb-1">Danger Zone</div>            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Clear all data from this browser. This cannot be undone.</div>
            <Button variant="danger" onClick={() => {
              if (confirm('Delete ALL data? This cannot be undone.')) {
                localStorage.clear();
                loadAll();
                showToast('All data cleared', 'info');
              }
            }}>🗑 Clear All Data</Button>
          </div>
        </div>
      )}
    </div>
  );
}
