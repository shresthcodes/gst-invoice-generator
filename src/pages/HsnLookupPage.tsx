import { useState } from 'react';

interface HsnEntry { code: string; description: string; gstRate: number; type: 'HSN' | 'SAC' }

const HSN_DATA: HsnEntry[] = [
  { code: '1001', description: 'Wheat and meslin', gstRate: 0, type: 'HSN' },
  { code: '0901', description: 'Coffee, whether or not roasted', gstRate: 5, type: 'HSN' },
  { code: '0902', description: 'Tea, whether or not flavoured', gstRate: 5, type: 'HSN' },
  { code: '2201', description: 'Waters, including natural or artificial mineral waters', gstRate: 0, type: 'HSN' },
  { code: '2202', description: 'Waters, including mineral waters and aerated waters, containing added sugar', gstRate: 12, type: 'HSN' },
  { code: '3004', description: 'Medicaments (excluding goods of heading 3002, 3005 or 3006)', gstRate: 12, type: 'HSN' },
  { code: '4901', description: 'Printed books, brochures, leaflets and similar printed matter', gstRate: 0, type: 'HSN' },
  { code: '6101', description: 'Men\'s or boys\' overcoats, car-coats, capes, cloaks, anoraks', gstRate: 5, type: 'HSN' },
  { code: '6109', description: 'T-shirts, singlets and other vests, knitted or crocheted', gstRate: 5, type: 'HSN' },
  { code: '6203', description: 'Men\'s or boys\' suits, ensembles, jackets, blazers, trousers', gstRate: 12, type: 'HSN' },
  { code: '6402', description: 'Other footwear with outer soles and uppers of rubber or plastics', gstRate: 18, type: 'HSN' },
  { code: '7113', description: 'Articles of jewellery and parts thereof, of precious metal', gstRate: 3, type: 'HSN' },
  { code: '8471', description: 'Automatic data processing machines and units thereof; computers', gstRate: 18, type: 'HSN' },
  { code: '8517', description: 'Telephone sets, including smartphones and other telephones', gstRate: 18, type: 'HSN' },
  { code: '8703', description: 'Motor cars and other motor vehicles principally designed for transport of persons', gstRate: 28, type: 'HSN' },
  { code: '8711', description: 'Motorcycles (including mopeds) and cycles fitted with an auxiliary motor', gstRate: 28, type: 'HSN' },
  { code: '9403', description: 'Other furniture and parts thereof', gstRate: 18, type: 'HSN' },
  { code: '9503', description: 'Tricycles, scooters, pedal cars and similar wheeled toys; dolls\' carriages', gstRate: 12, type: 'HSN' },
  // SAC codes
  { code: '9954', description: 'Construction services', gstRate: 18, type: 'SAC' },
  { code: '9961', description: 'Services in wholesale trade', gstRate: 18, type: 'SAC' },
  { code: '9962', description: 'Services in retail trade', gstRate: 18, type: 'SAC' },
  { code: '9971', description: 'Financial and related services', gstRate: 18, type: 'SAC' },
  { code: '9972', description: 'Real estate services', gstRate: 18, type: 'SAC' },
  { code: '9973', description: 'Leasing or rental services with or without operator', gstRate: 18, type: 'SAC' },
  { code: '9981', description: 'Research and development services', gstRate: 18, type: 'SAC' },
  { code: '9982', description: 'Legal and accounting services', gstRate: 18, type: 'SAC' },
  { code: '9983', description: 'Other professional, technical and business services', gstRate: 18, type: 'SAC' },
  { code: '9984', description: 'Telecommunications, broadcasting and information supply services', gstRate: 18, type: 'SAC' },
  { code: '9985', description: 'Support services', gstRate: 18, type: 'SAC' },
  { code: '9986', description: 'Agriculture, forestry, fishing and mining services', gstRate: 0, type: 'SAC' },
  { code: '9987', description: 'Maintenance, repair and installation (except construction) services', gstRate: 18, type: 'SAC' },
  { code: '9988', description: 'Manufacturing services on physical inputs (goods) owned by others', gstRate: 18, type: 'SAC' },
  { code: '9991', description: 'Public administration and other services provided to the community', gstRate: 0, type: 'SAC' },
  { code: '9992', description: 'Education services', gstRate: 0, type: 'SAC' },
  { code: '9993', description: 'Human health and social care services', gstRate: 0, type: 'SAC' },
  { code: '9994', description: 'Sewage and waste collection, treatment and disposal services', gstRate: 18, type: 'SAC' },
  { code: '9995', description: 'Services of membership organisations', gstRate: 18, type: 'SAC' },
  { code: '9996', description: 'Recreational, cultural and sporting services', gstRate: 18, type: 'SAC' },
  { code: '9997', description: 'Other services', gstRate: 18, type: 'SAC' },
  { code: '9998', description: 'Domestic services', gstRate: 0, type: 'SAC' },
  { code: '9999', description: 'Services provided by extraterritorial organisations and bodies', gstRate: 0, type: 'SAC' },
  // IT / Software
  { code: '8523', description: 'Discs, tapes, solid-state non-volatile storage devices, smart cards', gstRate: 18, type: 'HSN' },
  { code: '9813', description: 'Temporary admission of goods', gstRate: 0, type: 'SAC' },
];

const RATE_COLORS: Record<number, string> = {
  0: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  3: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  5: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  12: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
  18: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  28: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
};

export default function HsnLookupPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'HSN' | 'SAC'>('ALL');
  const [copied, setCopied] = useState('');

  const results = HSN_DATA.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.code.includes(q) || h.description.toLowerCase().includes(q);
    const matchFilter = filter === 'ALL' || h.type === filter;
    return matchSearch && matchFilter;
  });

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">HSN / SAC Code Lookup</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Find correct GST codes for your products and services</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by code or description..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-white/10">
          {(['ALL', 'HSN', 'SAC'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">GST Rate</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {results.map(h => (
              <tr key={h.code} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
                <td className="px-5 py-3 text-sm font-mono font-bold text-gray-900 dark:text-white">{h.code}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${h.type === 'HSN' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400'}`}>
                    {h.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{h.description}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${RATE_COLORS[h.gstRate] || RATE_COLORS[18]}`}>
                    {h.gstRate}%
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => copyCode(h.code)}
                    className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {copied === h.code ? '✓ Copied' : 'Copy'}
                  </button>
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">Showing {results.length} of {HSN_DATA.length} codes. This is a reference list — verify with official GST portal for complete data.</p>
    </div>
  );
}
