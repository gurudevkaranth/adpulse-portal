import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { getRouteConfig } from '../../config/routes';
import Breadcrumb from './Breadcrumb';
import SubTabNav from './SubTabNav';
import DateRangePicker from './DateRangePicker';

interface TopBarProps {
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  activeSubTab: string;
  onSubTabChange: (tab: string) => void;
}

export default function TopBar({ filters, onFiltersChange, activeSubTab, onSubTabChange }: TopBarProps) {
  const location = useLocation();
  const routeConfig = getRouteConfig(location.pathname);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-white border-b border-border sticky top-0 z-20">
      {/* Row 1: Breadcrumb + Search + Date Picker */}
      <div className="flex items-center justify-between px-6 h-12">
        <div className="flex items-center gap-4">
          <Breadcrumb items={routeConfig.breadcrumbs} />
          {/* Inline search */}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onFiltersChange?.({ ...filters, search: e.target.value });
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-tertiary rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500/20 placeholder:text-text-tertiary"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={filters?.dateRange || 'Last 30 Days'}
            onChange={(val) => onFiltersChange?.({ ...filters, dateRange: val })}
          />
          <button
            className="p-2 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row 2: Sub-tabs (conditional) */}
      {routeConfig.subTabs && (
        <div className="px-6 pb-3 pt-1">
          <SubTabNav
            tabs={routeConfig.subTabs}
            activeTab={activeSubTab}
            onChange={onSubTabChange}
          />
        </div>
      )}
    </div>
  );
}
