import { useMemo, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import { fetchAds, fetchHealthScores } from '../api/endpoints';
import { mapBackendAd, mergeAdsWithScores } from '../api/mappers';
import { generateAds } from '../data/mockData';

export function useAds(filters) {
  const mockFn = useMemo(() => () => generateAds(30), []);
  const mapFn = useCallback(
    (raw) => (raw.ads || raw).map(mapBackendAd),
    []
  );

  const result = useApiQuery(fetchAds, mockFn, mapFn, filters);

  return result;
}

export function useAdsWithScores(filters) {
  const ads = useAds(filters);

  const mockFn = useMemo(() => () => [], []);
  const mapFn = useCallback(
    (raw) => raw.health_scores || raw,
    []
  );

  const scores = useApiQuery(fetchHealthScores, mockFn, mapFn, filters);

  const data = useMemo(() => {
    if (!ads.data) return null;
    return mergeAdsWithScores(ads.data, scores.data);
  }, [ads.data, scores.data]);

  return {
    data,
    loading: ads.loading || scores.loading,
    error: ads.error || scores.error,
    refetch: () => {
      ads.refetch();
      scores.refetch();
    },
  };
}
