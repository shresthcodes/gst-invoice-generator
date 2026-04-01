import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import type { BusinessProfile } from '../types/invoice';
import Input, { Select } from './Common/Input';
import ImageUpload from './Common/ImageUpload';
import { INDIAN_STATES } from '../utils/gstCalculator';

const defaultProfile: BusinessProfile = {
  name: '', gstin: '', address: '', city: '', state: '', stateCode: '',
  phone: '', email: '', logo: '', signature: '', defaultGstRate: 18,
  defaultTerms: 'Payment due within 30 days.', upiId: '', invoicePrefix: 'INV', accentColor: '#6366f1',
};

const steps = [
  { title: 'Welcome to GST Invoice', subtitle: 'Free, offline, GST-compliant invoicing for Indian freelancers & businesses', icon: '🇮🇳' },
  { title: 'Setup Your Business', subtitle: 'This info will appear on every invoice you create', icon: '🏢' },
  { title: "You're all set!", subtitle: 'Create your first invoice in seconds', icon: '🎉' },
];

const features = [
  { icon: '📄', text: 'Create GST-compliant invoices instantly', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/20' },
  { icon: '🧮', text: 'Auto CGST/SGST vs IGST calculation', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20' },
  { icon: '💾', text: 'Everything saved locally — no account needed', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20' },
  { icon: '📊', text: 'Dashboard, aging reports, expense tracker', color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/20' },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<BusinessProfile>(defaultProfile);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);
  const { saveBusinessProfile, completeOnboarding } = useInvoiceStore();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  const set = (key: keyof BusinessProfile, val: string) =>
    setProfile(p => ({ ...p, [key]: val }));

  const handleStateChange = (stateCode: string) => {
    const state = INDIAN_STATES.find(s => s.code === stateCode);
    setProfile(p => ({ ...p, stateCode, state: state?.name || '' }));
  };

  const goToStep = (next: number) => {
    setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 200);
  };

  const handleFinish = () => {
    if (profile.name) saveBusinessProfile(profile);
    completeOnboarding();
    navigate('/invoice/new');
  };

  const handleSkip = () => {
    completeOnboarding();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-hidden">
      {/* Clean light-blue professional background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 40%, #faf5ff 100%)'
      }} />

      {/* Subtle decorative circles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, #c7d2fe 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #ddd6fe 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

      {/* Card */}
      <div
        className="relative w-full max-w-md transition-all duration-500"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)' }}
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 overflow-hidden border border-indigo-100/80">

          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          {/* Progress */}
          <div className="px-8 pt-6 flex items-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-gray-100'
              }`} />
            ))}
            <span className="text-xs text-gray-400 font-semibold ml-2 tabular-nums">{step + 1}/{steps.length}</span>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-6 transition-all duration-200"
            style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)' }}>

            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 text-2xl bg-indigo-50 border border-indigo-100 shadow-sm">
                {steps[step].icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1.5 tracking-tight">{steps[step].title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{steps[step].subtitle}</p>
            </div>

            {/* Step 0 — Features */}
            {step === 0 && (
              <div className="space-y-2.5">
                {features.map((f) => (
                  <div key={f.text} className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 bg-white border border-gray-100 shadow-sm">
                      {f.icon}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{f.text}</span>
                    <div className="ml-auto w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1 — Business Setup */}
            {step === 1 && (
              <div className="space-y-3">
                <Input label="Business Name *" value={profile.name} onChange={e => set('name', e.target.value)} placeholder="Acme Pvt Ltd" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Phone" value={profile.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
                  <Input label="Email" value={profile.email} onChange={e => set('email', e.target.value)} placeholder="you@company.com" />
                </div>
                <Input label="GSTIN (optional)" value={profile.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="27AAPFU0939F1ZV" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" value={profile.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
                  <Select label="State" value={profile.stateCode} onChange={e => handleStateChange(e.target.value)}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                  </Select>
                </div>
                <ImageUpload label="Business Logo (optional)" value={profile.logo}
                  onChange={val => set('logo', val)} onClear={() => set('logo', '')}
                  placeholder="Upload your logo" icon="🏢" />
              </div>
            )}

            {/* Step 2 — Done */}
            {step === 2 && (
              <div className="space-y-4 text-center py-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-2xl font-bold text-emerald-600 shadow-sm">
                  ✓
                </div>
                <div className="rounded-xl p-4 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100">
                  {profile.name ? `${profile.name} is ready to invoice!` : 'Your invoice generator is ready!'}
                </div>
                <p className="text-sm text-gray-400">You can update your business details anytime from Settings.</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-7">
              {step > 0 && (
                <button onClick={() => goToStep(step - 1)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 transition-all border border-gray-200 hover:border-gray-300 hover:bg-gray-50">
                  ← Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button onClick={() => goToStep(step + 1)}
                  disabled={step === 1 && !profile.name}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)' }}>
                  {step === 0 ? 'Get Started →' : 'Continue →'}
                </button>
              ) : (
                <button onClick={handleFinish}
                  className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)' }}>
                  Create First Invoice →
                </button>
              )}
            </div>

            {step === 0 && (
              <button onClick={handleSkip}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors py-1">
                Skip setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
