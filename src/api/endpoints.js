import apiClient from './client';

function buildParams({ startDate, endDate, channels, creativeTypes, status } = {}) {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (channels?.length) params.channels = channels.join(',');
  if (creativeTypes?.length) params.creative_types = creativeTypes.join(',');
  if (status) params.status = status;
  return params;
}

export function fetchChannels(filters) {
  return apiClient.get('/v1/analysis/acquisition/channels', {
    params: buildParams(filters),
  });
}

export function fetchCampaigns(filters) {
  return apiClient.get('/v1/analysis/acquisition/campaigns', {
    params: buildParams(filters),
  });
}

export function fetchAdSets(filters) {
  return apiClient.get('/v1/analysis/acquisition/ad-sets', {
    params: buildParams(filters),
  });
}

export function fetchAds(filters) {
  return apiClient.get('/v1/analysis/acquisition/ads', {
    params: buildParams(filters),
  });
}

export function fetchLandingPages(filters) {
  return apiClient.get('/v1/analysis/acquisition/landing-pages', {
    params: buildParams(filters),
  });
}

export function fetchHealthScores(filters) {
  return apiClient.get('/v1/analysis/acquisition/health-scores', {
    params: buildParams(filters),
  });
}

export function fetchDashboardSummary(filters) {
  return apiClient.get('/v1/analysis/acquisition/summary', {
    params: buildParams(filters),
  });
}
