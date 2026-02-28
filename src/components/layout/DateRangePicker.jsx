import { Calendar, ChevronDown } from 'lucide-react';

const PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

function formatDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(start)} - ${fmt(end)}`;
}

export default function DateRangePicker({ value = 'Last 30 Days', onChange }) {
  const days = PRESETS.find(p => p.label === value)?.days || 30;
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-gray-50 transition-colors bg-white">
        <Calendar className="w-4 h-4 text-text-tertiary" />
        <span>{formatDateRange(days)}</span>
        <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />
      </button>
      <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-50 hidden group-hover:block min-w-[160px]">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => onChange?.(preset.label)}
            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
              value === preset.label ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-secondary hover:bg-gray-50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
