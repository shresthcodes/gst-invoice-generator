import type { Invoice } from '../types/invoice';
import dayjs from 'dayjs';

interface Props { invoice: Invoice }

export default function StatusTimeline({ invoice }: Props) {
  const steps = [
    { label: 'Created', done: true, date: invoice.createdAt, icon: '📝' },
    { label: 'Sent', done: !!(invoice.activityLog?.some(l => l.action.toLowerCase().includes('sent') || l.action.toLowerCase().includes('email'))), date: null, icon: '📤' },
    { label: 'Partial', done: invoice.status === 'Partial' || invoice.status === 'Paid', date: invoice.activityLog?.find(l => l.action.includes('Partial'))?.timestamp || null, icon: '💰' },
    { label: 'Paid', done: invoice.status === 'Paid', date: invoice.activityLog?.find(l => l.action.includes('Paid'))?.timestamp || null, icon: '✅' },
  ];

  const currentStep = steps.filter(s => s.done).length - 1;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Invoice Progress</div>
      <div className="flex items-center">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all ${
                step.done
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-400'
              } ${i === currentStep ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>
                {step.icon}
              </div>
              <div className={`text-[10px] mt-1 font-medium ${step.done ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
                {step.label}
              </div>
              {step.done && step.date && (
                <div className="text-[9px] text-gray-400">{dayjs(step.date).format('DD MMM')}</div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${step.done && steps[i + 1].done ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200 dark:bg-white/10'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
