import {
  LayoutDashboard, BarChart3, TrendingUp, ShoppingCart,
  Grid3x3, Trophy, GitCompareArrows, Bot,
} from 'lucide-react';
import type { RouteConfigEntry } from '../types';

export const ROUTE_CONFIG: Record<string, RouteConfigEntry> = {
  '/': {
    breadcrumbs: [{ label: 'Home', icon: LayoutDashboard }],
  },
  '/analyze/acquisition': {
    breadcrumbs: [{ label: 'Analyze', icon: BarChart3 }, { label: 'Acquisition' }],
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

export function getRouteConfig(pathname: string): RouteConfigEntry {
  if (ROUTE_CONFIG[pathname]) return ROUTE_CONFIG[pathname];
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
