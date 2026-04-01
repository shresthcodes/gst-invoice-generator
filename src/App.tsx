import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useInvoiceStore } from './store/invoiceStore';
import Navbar from './components/Navbar';
import Toast from './components/Common/Toast';
import Onboarding from './components/Onboarding';
import SpotlightSearch from './components/SpotlightSearch';
import PageWrapper from './components/PageWrapper';
import Dashboard from './pages/Dashboard';
import InvoiceListPage from './pages/InvoiceListPage';
import CreateInvoice from './pages/CreateInvoice';
import PreviewPage from './pages/PreviewPage';
import Settings from './pages/Settings';
import GSTSummaryPage from './pages/GSTSummaryPage';
import ExpensesPage from './pages/ExpensesPage';
import ClientsPage from './pages/ClientsPage';
import RecurringPage from './pages/RecurringPage';
import QuotationsPage from './pages/QuotationsPage';
import CreateQuotation from './pages/CreateQuotation';
import CreditNotesPage from './pages/CreditNotesPage';
import RemindersPage from './pages/RemindersPage';
import HsnLookupPage from './pages/HsnLookupPage';
import ImportExportPage from './pages/ImportExportPage';

export default function App() {
  const { loadAll, onboarded } = useInvoiceStore();
  const location = useLocation();

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-300">
      {!onboarded && <Onboarding />}
      <SpotlightSearch />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/invoices" element={<PageWrapper><InvoiceListPage /></PageWrapper>} />
          <Route path="/invoice/new" element={<PageWrapper><CreateInvoice mode="create" /></PageWrapper>} />
          <Route path="/invoice/:id/edit" element={<PageWrapper><CreateInvoice mode="edit" /></PageWrapper>} />
          <Route path="/invoice/:id/preview" element={<PageWrapper><PreviewPage /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
          <Route path="/gst-summary" element={<PageWrapper><GSTSummaryPage /></PageWrapper>} />
          <Route path="/expenses" element={<PageWrapper><ExpensesPage /></PageWrapper>} />
          <Route path="/clients" element={<PageWrapper><ClientsPage /></PageWrapper>} />
          <Route path="/recurring" element={<PageWrapper><RecurringPage /></PageWrapper>} />
          <Route path="/quotations" element={<PageWrapper><QuotationsPage /></PageWrapper>} />
          <Route path="/quotation/new" element={<PageWrapper><CreateQuotation /></PageWrapper>} />
          <Route path="/credit-notes" element={<PageWrapper><CreditNotesPage /></PageWrapper>} />
          <Route path="/reminders" element={<PageWrapper><RemindersPage /></PageWrapper>} />
          <Route path="/hsn-lookup" element={<PageWrapper><HsnLookupPage /></PageWrapper>} />
          <Route path="/import-export" element={<PageWrapper><ImportExportPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
      <Toast />
    </div>
  );
}
