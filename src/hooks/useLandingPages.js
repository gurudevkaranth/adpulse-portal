import { useMemo, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import { fetchLandingPages } from '../api/endpoints';
import { generateAds, generateLandingPageData } from '../data/mockData';

export function useLandingPages(filters) {
  const mockFn = useMemo(() => {
    return () => {
      const ads = generateAds(30);
      return generateLandingPageData(ads);
    };
  }, []);

  const mapFn = useCallback((raw) => raw.landing_pages || raw, []);

  return useApiQuery(fetchLandingPages, mockFn, mapFn, filters);
}
