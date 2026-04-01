import { useEffect, useRef } from 'react';
import type { Invoice } from '../types/invoice';

const DRAFT_KEY = 'gst_invoice_draft';

export function useAutosave(invoice: Invoice, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    timerRef.current = setInterval(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ invoice, savedAt: new Date().toISOString() }));
    }, 30000); // every 30s

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [invoice, enabled]);

  // Save on unmount too
  useEffect(() => {
    return () => {
      if (enabled && invoice.items.length > 0) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ invoice, savedAt: new Date().toISOString() }));
      }
    };
  }, [invoice, enabled]);
}

export function getDraft(): { invoice: Invoice; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
