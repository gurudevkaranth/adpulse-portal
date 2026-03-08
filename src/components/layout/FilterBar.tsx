import { ChevronDown } from 'lucide-react';

interface FilterConfig {
  key: string;
  label: string;
  options: string[];
}

const FILTER_CONFIGS: FilterConfig[] = [
  { key: 'attribution', label: 'Attribution Model', options: ['Platform data-driven', 'Last Click', 'First Click', 'Linear', 'Time Decay'] },
  { key: 'channels', label: 'Channels', options: ['All Channels', 'Paid Ads', 'Organic', 'Email Marketing', 'Direct', 'Referrals'] },
  { key: 'creativeTypes', label: 'Creative Types', options: ['All Creative Types', 'Video', 'Image', 'UGC', 'Carousel', 'Story'] },
  { key: 'status', label: 'Status', options: ['All Status', 'Active', 'Paused', 'Scaling', 'Declining', 'Testing'] },
];

interface FilterBarProps {
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
}

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  return (
    <div className="bg-white border-b border-border px-6 py-3 flex items-end gap-4">
      {FILTER_CONFIGS.map(config => (
        <div key={config.key} className="min-w-[160px]">
          <label className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider block mb-1">
            {config.label}
          </label>
          <div className="relative">
            <select
              value={filters?.[config.key] || config.options[0]}
              onChange={(e) => onFiltersChange?.({ ...filters, [config.key]: e.target.value })}
              className="appearance-none w-full border border-border rounded-lg px-3 py-2 pr-8 text-sm bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
            >
              {config.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
