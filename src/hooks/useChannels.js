import { useMemo, useCallback } from 'react';
import { useApiQuery } from './useApiQuery';
import { fetchChannels } from '../api/endpoints';
import { mapBackendChannel } from '../api/mappers';
import { generateChannelChartData } from '../data/mockData';

export function useChannels(filters) {
  const mockFn = useMemo(() => () => generateChannelChartData(), []);
  const mapFn = useCallback(
    (raw) => (raw.channels || raw).map(mapBackendChannel),
    []
  );

  return useApiQuery(fetchChannels, mockFn, mapFn, filters);
}
