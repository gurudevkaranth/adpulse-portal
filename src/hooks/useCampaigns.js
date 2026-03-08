import { useMemo, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import { fetchCampaigns } from '../api/endpoints';
import { mapBackendCampaign } from '../api/mappers';
import { generateAds, generateHierarchicalData } from '../data/mockData';

export function useCampaigns(filters) {
  const mockFn = useMemo(() => {
    return () => {
      const ads = generateAds(30);
      return generateHierarchicalData(ads);
    };
  }, []);

  const mapFn = useCallback(
    (raw) => (raw.campaigns || raw).map(mapBackendCampaign),
    []
  );

  return useApiQuery(fetchCampaigns, mockFn, mapFn, filters);
}
