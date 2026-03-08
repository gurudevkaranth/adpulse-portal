import { useMemo, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import { fetchAds } from '../api/endpoints';
import { mapBackendAd, mergeAdsWithScores } from '../api/mappers';
import {
  generateAds,
  generateAdPerformanceHistory,
  generateAIRecommendations,
  generatePerformanceSummary,
  generateCreativeAnalysis,
} from '../data/mockData';

export function useCreativeDetail(adId) {
  const mockFn = useMemo(() => {
    return () => {
      const ads = generateAds(30);
      const ad = ads.find((a) => a.id === adId) || ads[0];
      return {
        ad,
        history: generateAdPerformanceHistory(ad),
        recommendations: generateAIRecommendations(ad),
        summary: generatePerformanceSummary(ad),
        analysis: generateCreativeAnalysis(ad),
      };
    };
  }, [adId]);

  const mapFn = useCallback(
    (raw) => {
      const ad = mapBackendAd(raw.ad || raw);
      const scores = raw.health_scores ? mergeAdsWithScores([ad], raw.health_scores) : [ad];
      return {
        ad: scores[0],
        history: raw.history || [],
        recommendations: raw.recommendations || [],
        summary: raw.summary || {},
        analysis: raw.analysis || {},
      };
    },
    []
  );

  const apiFn = useCallback(
    (filters, opts) => fetchAds({ ...filters, ad_id: adId }, opts),
    [adId]
  );

  return useApiQuery(apiFn, mockFn, mapFn);
}
