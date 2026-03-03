import { useState, useEffect } from 'react';
import { Outlet, useLocation, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import FilterBar from './FilterBar';
import { getRouteConfig } from '../../config/routes';

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'Last 30 Days',
    platform: 'All Platforms',
    search: '',
    attribution: 'Platform data-driven',
    channels: 'All Channels',
    creativeTypes: 'All Creative Types',
    status: 'All Status',
  });
  const [activeSubTab, setActiveSubTab] = useState('channels');

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeConfig = getRouteConfig(location.pathname);

  // Read ?tab= param from URL to set active sub-tab (e.g., from sidebar links)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs = routeConfig.validTabs || routeConfig.subTabs?.map(t => t.key) || [];
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveSubTab(tabParam);
    } else if (validTabs.length) {
      setActiveSubTab(validTabs[0]);
    }
  }, [location.pathname, searchParams]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[240px]'
        }`}
      >
        <TopBar
          filters={filters}
          onFiltersChange={setFilters}
          activeSubTab={activeSubTab}
          onSubTabChange={setActiveSubTab}
        />
        {routeConfig.showFilterBar && !routeConfig.validTabs && (
          <FilterBar filters={filters} onFiltersChange={setFilters} />
        )}
        <main className="p-6">
          <Outlet context={{ filters, setFilters, activeSubTab, setActiveSubTab }} />
        </main>
      </div>
    </div>
  );
}
