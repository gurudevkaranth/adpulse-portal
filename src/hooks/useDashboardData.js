import { useMemo, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import { fetchDashboardSummary } from '../api/endpoints';
import {
  generateAds,
  generateTrendData,
  generatePlatformBreakdown,
  generateFunnelData,
} from '../data/mockData';

export function useDashboardData(filters) {
  const mockFn = useMemo(() => {
    return () => ({
      ads: generateAds(30),
      trends: generateTrendData(30),
      platforms: generatePlatformBreakdown(),
      funnel: generateFunnelData(),
    });
  }, []);

  const mapFn = useCallback((raw) => raw, []);

  return useApiQuery(fetchDashboardSummary, mockFn, mapFn, filters);
}
