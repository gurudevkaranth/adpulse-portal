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
    subTabs: [
      { key: 'channels', label: 'Channels' },
      { key: 'creatives', label: 'Creatives' },
      { key: 'campaigns', label: 'Campaigns' },
      { key: 'adSets', label: 'Ad Sets' },
      { key: 'landingPages', label: 'Landing Pages' },
      { key: 'topPerformers', label: 'Top Performers' },
      { key: 'comparative', label: 'Comparative' },
    ],
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
