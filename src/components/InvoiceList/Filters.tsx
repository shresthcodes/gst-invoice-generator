import Input from '../Common/Input';
import { Select } from '../Common/Input';

interface Props {
  search: string;
  status: string;
  sortBy: string;
  onSearch: (v: string) => void;
  onStatus: (v: string) => void;
  onSort: (v: string) => void;
}

export default function Filters({ search, status, sortBy, onSearch, onStatus, onSort }: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="flex-1 min-w-48">
        <Input
          placeholder="Search by client or invoice no..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <Select value={status} onChange={e => onStatus(e.target.value)} className="w-36">
        <option value="">All Status</option>
        <option value="Paid">Paid</option>
        <option value="Unpaid">Unpaid</option>
        <option value="Partial">Partial</option>
      </Select>
      <Select value={sortBy} onChange={e => onSort(e.target.value)} className="w-40">
        <option value="date-desc">Newest First</option>
        <option value="date-asc">Oldest First</option>
        <option value="amount-desc">Amount (High)</option>
        <option value="amount-asc">Amount (Low)</option>
      </Select>
    </div>
  );
}
