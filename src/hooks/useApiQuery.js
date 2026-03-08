import { useState, useEffect, useCallback, useRef } from 'react';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Generic data-fetching hook with mock fallback.
 * @param {Function} apiFn - API function returning a promise (axios response)
 * @param {Function} mockFn - Function returning mock data synchronously
 * @param {Function} [mapFn] - Optional mapper: (responseData) => mappedData
 * @param {object} [filters] - Filters passed to apiFn
 */
export function useApiQuery(apiFn, mockFn, mapFn, filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (USE_MOCK) {
      try {
        const result = mockFn();
        setData(result);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await apiFn(filters, { signal: controller.signal });
      const raw = response.data;
      setData(mapFn ? mapFn(raw) : raw);
    } catch (e) {
      if (e.name !== 'CanceledError') {
        setError(e);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFn, mockFn, mapFn, filters]);

  useEffect(() => {
    fetch();
    return () => abortRef.current?.abort();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
