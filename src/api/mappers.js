// Maps backend API response shapes to the frontend data shapes
// used by components (matching the mockData.js structure).

const PROVIDER_MAP = {
  google_ads: 'Google',
  facebook: 'Meta',
  meta: 'Meta',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

export function mapProviderToPlatform(provider) {
  return PROVIDER_MAP[provider?.toLowerCase()] || provider || 'Unknown';
}

export function gradeFromScore(score) {
  if (score >= 75) return 'A';
  if (score >= 50) return 'B';
  if (score >= 25) return 'C';
  return 'D';
}

export function mapBackendAd(raw) {
  const platform = mapProviderToPlatform(raw.ad_provider || raw.provider);
  const spend = raw.spend ?? 0;
  const revenue = raw.conversion_value ?? raw.revenue ?? 0;
  const impressions = raw.impressions ?? 0;
  const clicks = raw.clicks ?? 0;
  const conversions = raw.conversions ?? 0;

  const metrics = {
    spend,
    impressions,
    clicks,
    conversions,
    revenue,
    ctr: raw.ctr ?? (impressions ? (clicks / impressions) * 100 : 0),
    cpc: raw.cpc ?? (clicks ? spend / clicks : 0),
    cpm: raw.cpm ?? (impressions ? (spend / impressions) * 1000 : 0),
    cpa: raw.cost_per_purchase ?? raw.cpa ?? (conversions ? spend / conversions : 0),
    roas: raw.roas ?? (spend ? revenue / spend : 0),
    conversionRate: raw.conversion_rate ?? (clicks ? (conversions / clicks) * 100 : 0),
    engagementRate: raw.engagement_rate ?? 0,
    thumbstopRate: raw.hook_rate ? raw.hook_rate * 100 : 0,
    avgWatchTime: raw.avg_watch_time_seconds ?? raw.avg_watch_time ?? 0,
  };

  return {
    id: raw.ad_id || raw.id,
    name: raw.ad_name || raw.name || 'Untitled',
    campaign: raw.campaign_name || raw.campaign || '',
    adSet: raw.ad_set_name || raw.ad_set || '',
    platform,
    format: raw.creative_type || raw.format || 'Unknown',
    objective: raw.objective || '',
    status: raw.status || 'Active',
    thumbnail: raw.thumbnail_url || raw.thumbnail || null,
    isVideo: ['Video', 'UGC', 'Story'].includes(raw.creative_type || raw.format || ''),
    metrics,
    scores: {},
    overallScore: 0,
    grade: 'C',
    createdAt: raw.created_at || raw.createdAt || null,
    lastActive: raw.last_active || raw.lastActive || null,
  };
}

export function mergeAdsWithScores(ads, scoreRows) {
  if (!scoreRows?.length) return ads;
  const scoreMap = new Map(scoreRows.map((s) => [s.ad_id, s]));

  return ads.map((ad) => {
    const s = scoreMap.get(ad.id);
    if (!s) return ad;
    const overallScore = Math.round(s.overall_score ?? 0);
    return {
      ...ad,
      scores: {
        hookScore: Math.round(s.hook_score ?? 0),
        watchScore: Math.round(s.watch_score ?? 0),
        clickScore: Math.round(s.click_score ?? 0),
        convertScore: Math.round(s.convert_score ?? 0),
        reachScore: Math.round(s.reach_score ?? 0),
        signalsScore: Math.round(s.signals_score ?? 0),
      },
      overallScore,
      grade: s.grade || gradeFromScore(overallScore),
    };
  });
}

export function mapBackendChannel(raw) {
  return {
    id: raw.channel_id || raw.id || raw.channel,
    name: raw.channel_name || raw.channel || raw.name || 'Unknown',
    spend: raw.spend ?? 0,
    revenue: raw.conversion_value ?? raw.revenue ?? 0,
    roas: raw.roas ?? 0,
    impressions: raw.impressions ?? 0,
    clicks: raw.clicks ?? 0,
    conversions: raw.conversions ?? 0,
    ctr: raw.ctr ?? 0,
    cpm: raw.cpm ?? 0,
    cpc: raw.cpc ?? 0,
  };
}

export function mapBackendCampaign(raw) {
  return {
    id: raw.campaign_id || raw.id,
    name: raw.campaign_name || raw.name || 'Untitled',
    platform: mapProviderToPlatform(raw.ad_provider || raw.provider),
    status: raw.status || 'Active',
    spend: raw.spend ?? 0,
    revenue: raw.conversion_value ?? raw.revenue ?? 0,
    roas: raw.roas ?? 0,
    impressions: raw.impressions ?? 0,
    clicks: raw.clicks ?? 0,
    conversions: raw.conversions ?? 0,
    ctr: raw.ctr ?? 0,
    cpm: raw.cpm ?? 0,
  };
}
