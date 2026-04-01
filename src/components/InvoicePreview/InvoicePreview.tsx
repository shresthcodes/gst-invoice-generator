import type { Invoice } from '../../types/invoice';
import TemplateMinimal from './TemplateMinimal';
import TemplateProfessional from './TemplateProfessional';
import TemplateModern from './TemplateModern';
import TemplateCompact from './TemplateCompact';

interface Props {
  invoice: Invoice;
  previewId?: string;
}

export default function InvoicePreview({ invoice, previewId = 'invoice-preview' }: Props) {
  return (
    <div id={previewId} className="bg-white shadow-lg" style={{ width: '210mm' }}>
      {invoice.template === 'minimal' && <TemplateMinimal invoice={invoice} />}
      {invoice.template === 'professional' && <TemplateProfessional invoice={invoice} />}
      {invoice.template === 'modern' && <TemplateModern invoice={invoice} />}
      {invoice.template === 'compact' && <TemplateCompact invoice={invoice} />}
    </div>
  );
}
