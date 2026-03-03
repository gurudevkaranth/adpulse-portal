import {
  LayoutDashboard, BarChart3, TrendingUp, ShoppingCart,
  Grid3x3, Trophy, GitCompareArrows, Bot,
} from 'lucide-react';

export const ROUTE_CONFIG = {
  '/': {
    breadcrumbs: [{ label: 'Home', icon: LayoutDashboard }],
  },
  '/analyze/acquisition': {
    breadcrumbs: [{ label: 'Analyze', icon: BarChart3 }, { label: 'Acquisition' }],
    // Sub-tab navigation is handled by the sidebar; no top-bar sub-tabs needed
    validTabs: ['channels', 'creatives', 'campaigns', 'adSets', 'landingPages', 'topPerformers', 'comparative'],
    showFilterBar: true,
  },
  '/analyze/conversion': {
    breadcrumbs: [{ label: 'Analyze', icon: BarChart3 }, { label: 'Conversion' }],
    showFilterBar: true,
  },
  '/copilot': {
    breadcrumbs: [{ label: 'AI Copilot', icon: Bot }],
  },
};

export function getRouteConfig(pathname) {
  // Exact match first
  if (ROUTE_CONFIG[pathname]) return ROUTE_CONFIG[pathname];
  // Check for dynamic routes (e.g., /creatives/:id)
  if (pathname.startsWith('/creatives/')) {
    return {
      breadcrumbs: [
        { label: 'Analyze', icon: BarChart3 },
        { label: 'Creatives', to: '/analyze/acquisition?tab=creatives' },
        { label: 'Detail' },
      ],
    };
  }
  return { breadcrumbs: [{ label: 'Home', icon: LayoutDashboard }] };
}
