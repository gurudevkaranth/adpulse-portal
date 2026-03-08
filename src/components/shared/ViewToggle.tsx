import { List, Grid3x3, LayoutGrid, type LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  list: List,
  grid: Grid3x3,
  expanded: LayoutGrid,
};

interface ViewToggleProps {
  mode: string;
  onChange: (mode: string) => void;
  modes?: string[];
}

export default function ViewToggle({ mode, onChange, modes = ['list', 'grid'] }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
      {modes.map(m => {
        const Icon = ICON_MAP[m] || List;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`p-1.5 rounded-md transition-colors ${
              mode === m
                ? 'bg-white shadow-sm text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
            title={m.charAt(0).toUpperCase() + m.slice(1)}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
