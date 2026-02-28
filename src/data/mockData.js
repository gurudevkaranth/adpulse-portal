// Realistic ad creative mock data inspired by Motion, Parker, and GetCrux

const PLATFORMS = ['Meta', 'TikTok', 'Google', 'YouTube'];
const FORMATS = ['Video', 'Image', 'Carousel', 'UGC', 'Story'];
const OBJECTIVES = ['Conversions', 'Traffic', 'Awareness', 'Engagement'];
const STATUSES = ['Active', 'Scaling', 'Declining', 'Paused', 'Testing'];
const TAGS = {
  hook: ['Problem-Solution', 'Social Proof', 'Curiosity', 'Fear of Missing Out', 'Discount/Offer', 'Before-After', 'Testimonial', 'Question Hook'],
  cta: ['Shop Now', 'Learn More', 'Get Started', 'Try Free', 'Sign Up', 'Buy Now', 'Claim Offer'],
  tone: ['Playful', 'Professional', 'Urgent', 'Emotional', 'Educational', 'Aspirational'],
  visual: ['Product Close-up', 'Lifestyle', 'Text Overlay', 'Split Screen', 'Talking Head', 'Stop Motion', 'Animation'],
};

// Generate placeholder thumbnails using colored gradients
function generateThumbnail(id) {
  const colors = [
    ['#667eea', '#764ba2'], ['#f093fb', '#f5576c'], ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'], ['#fa709a', '#fee140'], ['#a18cd1', '#fbc2eb'],
    ['#ffecd2', '#fcb69f'], ['#ff9a9e', '#fecfef'], ['#a1c4fd', '#c2e9fb'],
    ['#d4fc79', '#96e6a1'], ['#84fab0', '#8fd3f4'], ['#ffc3a0', '#ffafbd'],
  ];
  const pair = colors[id % colors.length];
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function randInt(min, max) {
  return Math.floor(rand(min, max));
}
function pick(arr) {
  return arr[randInt(0, arr.length)];
}

function computeScores(metrics) {
  const hookScore = Math.min(100, Math.round(
    (metrics.thumbstopRate / 40) * 50 +
    (metrics.firstFrameRetention / 80) * 50
  ));
  const watchScore = Math.min(100, Math.round(
    (metrics.avgWatchTime / 15) * 40 +
    (metrics.videoRetention15s / 60) * 30 +
    (metrics.thruplayRate / 50) * 30
  ));
  const clickScore = Math.min(100, Math.round(
    (metrics.ctr / 3) * 60 +
    (metrics.linkClickRate / 2.5) * 40
  ));
  const convertScore = Math.min(100, Math.round(
    (metrics.conversionRate / 5) * 40 +
    (metrics.roas / 4) * 40 +
    (50 / Math.max(metrics.cpa, 1)) * 20
  ));
  const reachScore = Math.max(0, Math.min(100, Math.round(
    (Math.min(metrics.impressions, 500000) / 500000) * 30 +
    Math.max(0, (1 - Math.min(metrics.cpm, 30) / 30)) * 35 +
    (Math.min(metrics.estimatedReach || 0, 300000) / 300000) * 35
  )));
  const signalsScore = Math.min(100, Math.round(
    (metrics.engagementRate / 6) * 30 +
    (metrics.shareRate / 2) * 25 +
    (metrics.saveRate / 3) * 25 +
    ((100 - metrics.fatigueIndex) / 100) * 20
  ));
  return { hookScore, watchScore, clickScore, convertScore, reachScore, signalsScore };
}

function getScoreGrade(score) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

function getScoreColor(score) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#65a30d';
  if (score >= 40) return '#d97706';
  return '#dc2626';
}

const adNames = [
  'Summer Sale - Beach Vibes', 'Product Demo - Quick Start', 'UGC Review - Sarah M.',
  'Lifestyle - Morning Routine', 'Problem-Solution - Pain Points', 'Testimonial - John D.',
  'Holiday Special - Gift Guide', 'Brand Story - Our Journey', 'How-To Tutorial - Setup',
  'Flash Sale - 48hr Only', 'Comparison - Us vs Them', 'Unboxing Experience',
  'Behind the Scenes', 'Customer Story - Real Results', 'New Launch - Feature Focus',
  'Seasonal - Back to School', 'Influencer Collab - @creator', 'Retargeting - Come Back',
  'Social Proof - 10K Reviews', 'Emotional Hook - Transform', 'Limited Edition Drop',
  'Free Trial - No Risk', 'Bundle Deal - Save 30%', 'User Generated - TikTok Style',
  'Explainer - How It Works', 'Before & After Results', 'Team Favorites Pick',
  'New Year New You', 'Weekend Warriors', 'First Time Buyer Special',
];

const campaignNames = [
  'Q1 Performance Max', 'Summer Brand Awareness', 'Holiday Retargeting',
  'Evergreen Conversions', 'New Product Launch', 'Influencer Partnership',
  'Back to School Push', 'Flash Sale Weekend', 'Customer Win-Back',
  'Top of Funnel - Prospecting', 'Mid-Funnel Engagement', 'Bottom Funnel - Purchase',
];

const adSetNames = [
  'Lookalike 1% - US', 'Broad - 25-45 F', 'Interest - Fitness',
  'Retargeting - 30d', 'Custom Audience - Purchasers', 'Lookalike 3% - US',
  'Interest - Beauty', 'Broad - 18-35 M', 'Engagement - 7d',
];

export function generateAds(count = 30) {
  return Array.from({ length: count }, (_, i) => {
    const platform = pick(PLATFORMS);
    const format = pick(FORMATS);
    const isVideo = format === 'Video' || format === 'UGC' || format === 'Story';

    const spend = rand(200, 25000);
    const impressions = randInt(5000, 500000);
    const clicks = randInt(impressions * 0.005, impressions * 0.06);
    const conversions = randInt(clicks * 0.01, clicks * 0.12);
    const revenue = conversions * rand(20, 150);

    const metrics = {
      spend: Math.round(spend * 100) / 100,
      impressions,
      clicks,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      ctr: Math.round((clicks / impressions) * 10000) / 100,
      cpc: Math.round((spend / Math.max(clicks, 1)) * 100) / 100,
      cpm: Math.round((spend / impressions * 1000) * 100) / 100,
      cpa: Math.round((spend / Math.max(conversions, 1)) * 100) / 100,
      roas: Math.round((revenue / spend) * 100) / 100,
      conversionRate: Math.round((conversions / Math.max(clicks, 1)) * 10000) / 100,
      linkClickRate: Math.round(rand(0.5, 3.5) * 100) / 100,
      thumbstopRate: Math.round(rand(10, 45) * 100) / 100,
      firstFrameRetention: Math.round(rand(30, 85) * 100) / 100,
      avgWatchTime: Math.round(rand(2, 18) * 10) / 10,
      videoRetention15s: isVideo ? Math.round(rand(15, 65) * 100) / 100 : null,
      thruplayRate: isVideo ? Math.round(rand(10, 55) * 100) / 100 : null,
      holdRate: platform === 'TikTok' ? Math.round(rand(5, 35) * 100) / 100 : null,
      // Reach metrics
      estimatedReach: randInt(Math.round(impressions * 0.4), Math.round(impressions * 0.85)),
      frequency: Math.round(rand(1.2, 4.5) * 100) / 100,
      // Signal metrics
      engagementRate: Math.round(rand(0.5, 6.0) * 100) / 100,
      shareRate: Math.round(rand(0.1, 2.5) * 100) / 100,
      saveRate: Math.round(rand(0.2, 3.5) * 100) / 100,
      commentSentiment: Math.round(rand(40, 95)),
      fatigueIndex: Math.round(rand(5, 65)),
    };

    const scores = computeScores(metrics);
    const overallScore = Math.round(
      scores.hookScore * 0.15 +
      scores.watchScore * 0.15 +
      scores.clickScore * 0.2 +
      scores.convertScore * 0.25 +
      scores.reachScore * 0.1 +
      scores.signalsScore * 0.15
    );

    const status = overallScore >= 70 ? (rand(0, 1) > 0.3 ? 'Scaling' : 'Active')
      : overallScore >= 50 ? 'Active'
      : overallScore >= 35 ? (rand(0, 1) > 0.5 ? 'Declining' : 'Testing')
      : 'Declining';

    return {
      id: `ad_${i + 1}`,
      name: adNames[i % adNames.length],
      campaign: pick(campaignNames),
      adSet: pick(adSetNames),
      platform,
      format,
      objective: pick(OBJECTIVES),
      status,
      thumbnail: generateThumbnail(i),
      isVideo,
      tags: {
        hook: pick(TAGS.hook),
        cta: pick(TAGS.cta),
        tone: pick(TAGS.tone),
        visual: pick(TAGS.visual),
      },
      metrics,
      scores,
      overallScore,
      grade: getScoreGrade(overallScore),
      createdAt: new Date(Date.now() - randInt(1, 90) * 86400000).toISOString(),
      lastActive: new Date(Date.now() - randInt(0, 7) * 86400000).toISOString(),
    };
  });
}

export function generateTrendData(days = 30) {
  const data = [];
  const now = new Date();
  let baseRevenue = 5000;
  let baseSpend = 2000;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1;
    const trendMultiplier = 1 + (days - i) * 0.005;

    const revenue = Math.round(baseRevenue * weekendMultiplier * trendMultiplier * rand(0.85, 1.2));
    const spend = Math.round(baseSpend * weekendMultiplier * rand(0.9, 1.1));
    const orders = randInt(30, 120);
    const impressions = randInt(50000, 200000);
    const clicks = randInt(impressions * 0.01, impressions * 0.04);

    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      spend,
      orders,
      roas: Math.round((revenue / spend) * 100) / 100,
      impressions,
      clicks,
      ctr: Math.round((clicks / impressions) * 10000) / 100,
      conversions: randInt(20, 90),
      convRate: Math.round(rand(1, 6) * 100) / 100,
      cpm: Math.round(rand(5, 25) * 100) / 100,
      cpa: Math.round(rand(10, 80) * 100) / 100,
    });
  }
  return data;
}

export function generatePlatformBreakdown() {
  return [
    { platform: 'Meta', spend: 45200, revenue: 128500, roas: 2.84, impressions: 2500000, conversions: 3200, share: 48 },
    { platform: 'TikTok', spend: 22100, revenue: 71800, roas: 3.25, impressions: 1800000, conversions: 1800, share: 24 },
    { platform: 'Google', spend: 18500, revenue: 52300, roas: 2.83, impressions: 950000, conversions: 1400, share: 20 },
    { platform: 'YouTube', spend: 7200, revenue: 18400, roas: 2.56, impressions: 620000, conversions: 480, share: 8 },
  ];
}

export function generateFunnelData() {
  return [
    { stage: 'Impressions', value: 5870000, rate: 100 },
    { stage: 'Thumbstops', value: 1467500, rate: 25.0 },
    { stage: 'Video Views (3s)', value: 880500, rate: 15.0 },
    { stage: 'Clicks', value: 176100, rate: 3.0 },
    { stage: 'Page Views', value: 140880, rate: 2.4 },
    { stage: 'Add to Cart', value: 28176, rate: 0.48 },
    { stage: 'Purchases', value: 6880, rate: 0.12 },
  ];
}

export function generateComparativeData() {
  const categories = [
    { label: 'UGC', type: 'format' },
    { label: 'Polished Video', type: 'format' },
    { label: 'Static Image', type: 'format' },
    { label: 'Carousel', type: 'format' },
    { label: 'Problem-Solution', type: 'hook' },
    { label: 'Social Proof', type: 'hook' },
    { label: 'Discount/Offer', type: 'hook' },
    { label: 'Curiosity', type: 'hook' },
    { label: 'Testimonial', type: 'hook' },
    { label: 'Before-After', type: 'hook' },
  ];

  return categories.map(cat => ({
    ...cat,
    spend: Math.round(rand(5000, 40000)),
    revenue: Math.round(rand(10000, 120000)),
    roas: Math.round(rand(1.2, 4.5) * 100) / 100,
    ctr: Math.round(rand(0.8, 4.2) * 100) / 100,
    cpa: Math.round(rand(12, 85) * 100) / 100,
    conversions: randInt(50, 2500),
    hookScore: randInt(30, 95),
    conversionRate: Math.round(rand(1, 7) * 100) / 100,
    adCount: randInt(3, 15),
  }));
}

export function generateWeeklyLeaderboard(ads) {
  return ads
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 10)
    .map((ad, i) => ({
      ...ad,
      rank: i + 1,
      previousRank: i + 1 + randInt(-3, 4),
      weeklySpendChange: Math.round(rand(-30, 60) * 100) / 100,
    }));
}

export function generateCopilotSuggestions() {
  return [
    'Which creatives are scaling this week?',
    'What hooks drive the lowest CPA?',
    'Compare UGC vs polished video performance',
    'Show me ads with declining ROAS',
    'Which ad format has the best hook rate?',
    'What are my top 5 converting creatives?',
    'Analyze creative fatigue signals',
    'Which platform performs best for conversions?',
  ];
}

// --- Creative Detail Page Data Generators ---

export function generateAdPerformanceHistory(ad, days = 30) {
  const data = [];
  const now = new Date();

  // Base values derived from the ad's current metrics
  const baseSpend = ad.metrics.spend / 30;
  const baseImpressions = ad.metrics.impressions / 30;
  const baseCTR = ad.metrics.ctr;
  const baseConvRate = ad.metrics.conversionRate;
  const baseRoas = ad.metrics.roas;
  const baseCPA = ad.metrics.cpa;
  const baseThumbstop = ad.metrics.thumbstopRate;

  // Determine trajectory: scaling ads trend up, declining trend down
  const trajectoryMap = { Scaling: 0.012, Active: 0.003, Testing: 0.005, Declining: -0.015, Paused: -0.008 };
  const trajectory = trajectoryMap[ad.status] || 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const weekendMult = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.12 : 1;
    const trendMult = 1 + (days - i) * trajectory;
    const noise = rand(0.85, 1.18);

    const dailySpend = Math.round(baseSpend * weekendMult * trendMult * noise * 100) / 100;
    const dailyImpressions = Math.round(baseImpressions * weekendMult * trendMult * rand(0.8, 1.25));
    const dailyCTR = Math.round(baseCTR * trendMult * rand(0.88, 1.15) * 100) / 100;
    const dailyClicks = Math.round(dailyImpressions * (dailyCTR / 100));
    const dailyConvRate = Math.round(baseConvRate * trendMult * rand(0.85, 1.2) * 100) / 100;
    const dailyConversions = Math.max(0, Math.round(dailyClicks * (dailyConvRate / 100)));
    const dailyRevenue = Math.round(dailyConversions * (ad.metrics.revenue / Math.max(ad.metrics.conversions, 1)) * rand(0.8, 1.2) * 100) / 100;
    const dailyRoas = dailySpend > 0 ? Math.round((dailyRevenue / dailySpend) * 100) / 100 : 0;
    const dailyCPA = dailyConversions > 0 ? Math.round((dailySpend / dailyConversions) * 100) / 100 : 0;
    const dailyThumbstop = Math.round(baseThumbstop * trendMult * rand(0.9, 1.1) * 100) / 100;

    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      spend: dailySpend,
      impressions: dailyImpressions,
      clicks: dailyClicks,
      conversions: dailyConversions,
      revenue: dailyRevenue,
      ctr: dailyCTR,
      conversionRate: dailyConvRate,
      roas: dailyRoas,
      cpa: dailyCPA,
      cpm: dailyImpressions > 0 ? Math.round((dailySpend / dailyImpressions * 1000) * 100) / 100 : 0,
      thumbstopRate: dailyThumbstop,
    });
  }
  return data;
}

const competitorBrands = [
  'Competitor A', 'Competitor B', 'Competitor C', 'Competitor D', 'Competitor E',
];

const competitorInsightTypes = [
  'Similar Hook Strategy', 'Alternative Visual', 'Different CTA Approach',
  'Same Audience Targeting', 'Higher Production Value',
];

const competitorActions = [
  'Using short-form UGC testimonials that out-perform polished brand content by 2.3x on CTR',
  'Running product demo videos with text overlay hooks — high thumbstop but lower hold rate',
  'Leveraging creator partnerships with "day in my life" formats, strong engagement signals',
  'Testing carousel ads with before/after frames, showing 40% higher conversion rate',
  'Using urgency-driven CTAs (countdown timers, limited stock) in static images',
  'Running A/B tests between aspirational vs. pain-point hooks, aspirational winning',
  'Employing split-screen format comparing their product to generic alternatives',
  'Featuring micro-influencer reviews with authentic settings, lower CPA than brand content',
];

export function generateCompetitiveInsights(ad) {
  const count = randInt(3, 6);
  const insights = [];

  for (let i = 0; i < count; i++) {
    const competitorScore = randInt(35, 95);
    const brand = competitorBrands[i % competitorBrands.length];
    insights.push({
      id: `comp_${i}`,
      brand,
      type: pick(competitorInsightTypes),
      platform: pick(PLATFORMS),
      format: pick(FORMATS),
      thumbnail: generateThumbnail(i + 20), // offset to get different colors
      estimatedSpend: Math.round(rand(5000, 80000)),
      estimatedImpressions: randInt(100000, 2000000),
      firstSeen: new Date(Date.now() - randInt(3, 45) * 86400000).toISOString().split('T')[0],
      isActive: rand(0, 1) > 0.3,
      overallScore: competitorScore,
      grade: getScoreGrade(competitorScore),
      observation: competitorActions[i % competitorActions.length],
      tags: {
        hook: pick(TAGS.hook),
        cta: pick(TAGS.cta),
        visual: pick(TAGS.visual),
      },
    });
  }

  // Sort by score descending
  insights.sort((a, b) => b.overallScore - a.overallScore);
  return insights;
}

const recommendationCategories = [
  { category: 'Hook', icon: '🎯' },
  { category: 'Creative', icon: '🎨' },
  { category: 'Targeting', icon: '👥' },
  { category: 'Budget', icon: '💰' },
  { category: 'Testing', icon: '🧪' },
];

export function generateAIRecommendations(ad) {
  const recs = [];
  const { scores, metrics, status, tags } = ad;

  // Hook recommendations based on hook score
  if (scores.hookScore < 60) {
    recs.push({
      id: 'rec_hook_1',
      category: 'Hook',
      icon: '🎯',
      priority: 'high',
      title: 'Improve opening hook to boost thumbstop rate',
      description: `Your thumbstop rate (${metrics.thumbstopRate}%) is below the ${metrics.platform === 'TikTok' ? '28%' : '22%'} benchmark. Try leading with a bold visual or text hook in the first 0.5s — problem-solution and curiosity hooks are driving 35% higher engagement in your category right now.`,
      impact: 'High — Could increase thumbstop rate by 40-60%',
      effort: 'Medium',
    });
  } else {
    recs.push({
      id: 'rec_hook_1',
      category: 'Hook',
      icon: '🎯',
      priority: 'low',
      title: 'Hook is performing well — test variations to scale',
      description: `Your "${tags.hook}" hook strategy is working (thumbstop: ${metrics.thumbstopRate}%). Create 3-4 hook variants using the same formula to find the ceiling. Test shorter hooks (under 3s) to push thumbstop even higher.`,
      impact: 'Medium — Could find 10-20% improvement',
      effort: 'Low',
    });
  }

  // Watch score recommendations
  if (scores.watchScore < 50) {
    recs.push({
      id: 'rec_watch_1',
      category: 'Creative',
      icon: '🎨',
      priority: 'high',
      title: 'Improve mid-video retention — viewers are dropping off',
      description: `Average watch time is ${metrics.avgWatchTime}s with ${metrics.videoRetention15s || 'low'}% 15s retention. Add pattern interrupts every 3-5 seconds (text callouts, scene changes, zoom cuts) to maintain engagement. Consider shortening to under 15s if retention drops sharply after that point.`,
      impact: 'High — Better retention feeds stronger click-through',
      effort: 'Medium',
    });
  }

  // Click score recommendations
  if (scores.clickScore < 55) {
    recs.push({
      id: 'rec_click_1',
      category: 'Creative',
      icon: '🎨',
      priority: 'high',
      title: 'Strengthen your call-to-action to drive more clicks',
      description: `CTR is ${metrics.ctr}% vs. category benchmark of 2.1%. Your "${tags.cta}" CTA may be too generic. Test action-specific CTAs like "See My Results" or "Get Your Price" — personalized CTAs typically lift click rate by 25-40%.`,
      impact: 'High — Direct impact on traffic and conversions',
      effort: 'Low',
    });
  }

  // Conversion score recommendations
  if (scores.convertScore < 50) {
    recs.push({
      id: 'rec_conv_1',
      category: 'Targeting',
      icon: '👥',
      priority: 'high',
      title: 'Conversion efficiency is below target — review audience-creative alignment',
      description: `CPA of ${formatCurrencySimple(metrics.cpa)} and ROAS of ${metrics.roas}x suggest the creative is attracting clicks but not converting. Consider: (1) tighter audience targeting based on past purchasers, (2) adding social proof or urgency to the creative, (3) ensuring landing page matches the ad promise.`,
      impact: 'High — Directly improves profitability',
      effort: 'High',
    });
  } else {
    recs.push({
      id: 'rec_conv_1',
      category: 'Budget',
      icon: '💰',
      priority: 'medium',
      title: 'Strong conversion efficiency — consider scaling spend',
      description: `With a ${metrics.roas}x ROAS and ${formatCurrencySimple(metrics.cpa)} CPA, this creative has room to scale. Increase daily budget by 20% every 3 days while monitoring CPA. If CPA stays within 15% of current, continue scaling.`,
      impact: 'Medium — More volume at efficient CPA',
      effort: 'Low',
    });
  }

  // Testing recommendations
  if (status === 'Active' || status === 'Scaling') {
    recs.push({
      id: 'rec_test_1',
      category: 'Testing',
      icon: '🧪',
      priority: 'medium',
      title: 'Run structured creative iterations',
      description: `This creative is ${status.toLowerCase()}. Create a test matrix: hold the ${tags.hook} hook constant and vary the visual style (test ${tags.visual} vs Lifestyle vs Split Screen). Also test 2-3 CTA variations. Run each variant for 5 days with equal budget before declaring winners.`,
      impact: 'Medium — Systematic testing prevents creative fatigue',
      effort: 'Medium',
    });
  }

  if (status === 'Declining') {
    recs.push({
      id: 'rec_fatigue_1',
      category: 'Creative',
      icon: '🎨',
      priority: 'high',
      title: 'Creative fatigue detected — refresh needed',
      description: `This ad is showing declining performance signals. The creative has likely saturated its target audience. Options: (1) Create new hook variants keeping the same offer, (2) Test a completely different visual approach, (3) Shift spend to higher-performing creatives while this refreshes. Don't pause entirely — reduce budget by 50% and run fresh variants in parallel.`,
      impact: 'High — Prevents further performance decay',
      effort: 'High',
    });
  }

  // Competitive insight recommendation (always add)
  recs.push({
    id: 'rec_comp_1',
    category: 'Creative',
    icon: '🎨',
    priority: 'medium',
    title: 'Competitive gap: test UGC testimonial format',
    description: `Competitors in your space are seeing strong results with authentic UGC testimonials — averaging 2.8x higher engagement than polished brand content. Consider sourcing 3-5 creator testimonials and testing them against your current "${tags.visual}" format.`,
    impact: 'Medium — Could unlock new creative angle',
    effort: 'Medium',
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}

// Simple currency formatter for use in mock data strings
function formatCurrencySimple(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

// Generate performance summary highlights (what's working / not working)
export function generatePerformanceSummary(ad) {
  const { scores, metrics } = ad;
  const strengths = [];
  const weaknesses = [];

  if (scores.hookScore >= 65) strengths.push({ metric: 'Hook Rate', value: `${metrics.thumbstopRate}%`, detail: 'Above average — strong opening engagement' });
  else weaknesses.push({ metric: 'Hook Rate', value: `${metrics.thumbstopRate}%`, detail: 'Below benchmark — viewers scrolling past' });

  if (scores.watchScore >= 65) strengths.push({ metric: 'Watch Time', value: `${metrics.avgWatchTime}s`, detail: 'Good retention — content is resonating' });
  else weaknesses.push({ metric: 'Watch Time', value: `${metrics.avgWatchTime}s`, detail: 'Low retention — losing viewers mid-content' });

  if (scores.clickScore >= 65) strengths.push({ metric: 'Click Rate', value: `${metrics.ctr}%`, detail: 'Strong CTR — compelling CTA driving action' });
  else weaknesses.push({ metric: 'Click Rate', value: `${metrics.ctr}%`, detail: 'Weak CTR — CTA or offer not compelling enough' });

  if (scores.convertScore >= 65) strengths.push({ metric: 'Conversion', value: `${metrics.roas}x ROAS`, detail: 'Efficient conversion — good audience match' });
  else weaknesses.push({ metric: 'Conversion', value: `${metrics.roas}x ROAS`, detail: 'Poor conversion efficiency — audience or landing page mismatch' });

  if (metrics.cpa < 40) strengths.push({ metric: 'CPA', value: formatCurrencySimple(metrics.cpa), detail: 'Cost-efficient acquisition' });
  else if (metrics.cpa > 60) weaknesses.push({ metric: 'CPA', value: formatCurrencySimple(metrics.cpa), detail: 'Acquisition cost above target' });

  return { strengths, weaknesses };
}

// GetCrux-style AI creative analysis
export function generateCreativeAnalysis(ad) {
  const { scores, metrics, tags, format, platform, status } = ad;

  // Element-level analysis (like GetCrux's 30+ labels)
  const elements = [
    {
      element: 'Opening Hook',
      label: tags.hook,
      impact: scores.hookScore >= 65 ? 'positive' : scores.hookScore >= 40 ? 'neutral' : 'negative',
      score: scores.hookScore,
      insight: scores.hookScore >= 65
        ? `"${tags.hook}" hook is outperforming category average by ${randInt(15, 40)}%`
        : `"${tags.hook}" hook underperforms — top performers use "Problem-Solution" or "Curiosity" hooks`,
    },
    {
      element: 'Visual Style',
      label: tags.visual,
      impact: scores.watchScore >= 60 ? 'positive' : scores.watchScore >= 40 ? 'neutral' : 'negative',
      score: scores.watchScore,
      insight: scores.watchScore >= 60
        ? `${tags.visual} style drives ${randInt(10, 30)}% higher watch-through in ${platform}`
        : `${tags.visual} format has lower retention — "Talking Head" and "Product Close-up" win on ${platform}`,
    },
    {
      element: 'Call to Action',
      label: tags.cta,
      impact: scores.clickScore >= 60 ? 'positive' : scores.clickScore >= 40 ? 'neutral' : 'negative',
      score: scores.clickScore,
      insight: scores.clickScore >= 60
        ? `"${tags.cta}" CTA is driving strong click intent — above ${platform} benchmark`
        : `"${tags.cta}" CTA is generic — test personalized CTAs like "See My Results" or "Get Your Price"`,
    },
    {
      element: 'Tone & Voice',
      label: tags.tone,
      impact: metrics.engagementRate >= 3 ? 'positive' : metrics.engagementRate >= 1.5 ? 'neutral' : 'negative',
      score: Math.round(metrics.engagementRate / 6 * 100),
      insight: metrics.engagementRate >= 3
        ? `"${tags.tone}" tone resonates with audience — ${metrics.engagementRate}% engagement rate`
        : `"${tags.tone}" tone isn't landing — "Playful" and "Emotional" tones drive 2x engagement in your category`,
    },
    {
      element: 'Format',
      label: format,
      impact: ad.overallScore >= 65 ? 'positive' : ad.overallScore >= 45 ? 'neutral' : 'negative',
      score: ad.overallScore,
      insight: format === 'UGC'
        ? 'UGC format outperforms polished content by 34% on thumbstop rate'
        : format === 'Video'
        ? `Video format — ${metrics.avgWatchTime}s avg watch time (benchmark: 8s)`
        : `${format} format — consider testing video/UGC variants for this audience`,
    },
  ];

  // Audience signal analysis
  const audienceSignals = {
    sentiment: metrics.commentSentiment,
    sentimentLabel: metrics.commentSentiment >= 75 ? 'Positive' : metrics.commentSentiment >= 50 ? 'Mixed' : 'Negative',
    topObjections: [
      metrics.cpa > 50 ? 'Price sensitivity — audience finds offer expensive' : null,
      metrics.conversionRate < 2 ? 'Trust gap — viewers click but don\'t convert' : null,
      metrics.engagementRate < 1.5 ? 'Low resonance — content not sparking conversation' : null,
    ].filter(Boolean),
    topAngles: [
      scores.hookScore >= 60 ? `"${tags.hook}" hook resonates strongly` : null,
      metrics.shareRate >= 1 ? `High share rate (${metrics.shareRate}%) — content is viral-worthy` : null,
      metrics.saveRate >= 1.5 ? `High save rate (${metrics.saveRate}%) — high purchase intent signal` : null,
    ].filter(Boolean),
    engagementBreakdown: {
      likes: Math.round(metrics.impressions * metrics.engagementRate / 100 * 0.7),
      comments: Math.round(metrics.impressions * metrics.engagementRate / 100 * 0.15),
      shares: Math.round(metrics.impressions * metrics.shareRate / 100),
      saves: Math.round(metrics.impressions * metrics.saveRate / 100),
    },
  };

  // Pattern insights (cross-creative)
  const patterns = [
    {
      pattern: 'Hook Pattern',
      finding: `"${tags.hook}" hooks on ${platform} have a ${randInt(55, 85)}% win rate when paired with "${tags.visual}" visuals`,
      confidence: randInt(70, 95),
    },
    {
      pattern: 'Format Trend',
      finding: `${format} ads in your category show ${rand(0, 1) > 0.5 ? 'increasing' : 'stable'} performance over the past 14 days`,
      confidence: randInt(60, 90),
    },
    {
      pattern: 'Audience Overlap',
      finding: `${randInt(25, 60)}% audience overlap with your top 3 creatives — ${randInt(30, 55)}% of conversions come from new audiences`,
      confidence: randInt(65, 88),
    },
  ];

  // Fix recommendations (GetCrux "Fixer" style)
  const fixes = [];
  if (scores.hookScore < 55) {
    fixes.push({
      type: 'fix',
      area: 'Hook',
      severity: 'critical',
      current: `${metrics.thumbstopRate}% thumbstop (below ${platform === 'TikTok' ? '28%' : '22%'} benchmark)`,
      suggestion: 'Lead with bold text overlay + motion in first 0.5s. Test "Did you know..." or problem statement hooks.',
      expectedLift: `+${randInt(30, 60)}% thumbstop rate`,
    });
  }
  if (scores.watchScore < 50) {
    fixes.push({
      type: 'fix',
      area: 'Retention',
      severity: 'critical',
      current: `${metrics.avgWatchTime}s avg watch (below 8s benchmark)`,
      suggestion: 'Add pattern interrupts every 3s (zoom cuts, text callouts). Shorten to under 15s if 15s retention < 30%.',
      expectedLift: `+${randInt(20, 45)}% watch time`,
    });
  }
  if (scores.clickScore < 55) {
    fixes.push({
      type: 'fix',
      area: 'CTA',
      severity: 'high',
      current: `${metrics.ctr}% CTR (below 2.1% benchmark)`,
      suggestion: `Replace "${tags.cta}" with personalized CTA. Add urgency element (limited time, stock counter).`,
      expectedLift: `+${randInt(25, 40)}% CTR`,
    });
  }
  if (metrics.fatigueIndex > 40) {
    fixes.push({
      type: 'fix',
      area: 'Fatigue',
      severity: metrics.fatigueIndex > 55 ? 'critical' : 'high',
      current: `${metrics.fatigueIndex}% fatigue index (frequency: ${metrics.frequency}x)`,
      suggestion: 'Creative is saturating. Create 3-5 hook variants with same offer. Expand audience by 20% or refresh visual style.',
      expectedLift: `−${randInt(15, 35)}% CPA after refresh`,
    });
  }
  if (scores.convertScore < 50) {
    fixes.push({
      type: 'fix',
      area: 'Conversion',
      severity: 'high',
      current: `${metrics.roas}x ROAS / $${metrics.cpa.toFixed(2)} CPA`,
      suggestion: 'Add social proof (review count, star rating) in last 3s. Test landing page alignment — headline should match ad promise.',
      expectedLift: `+${randInt(15, 30)}% conversion rate`,
    });
  }
  if (scores.reachScore < 45) {
    fixes.push({
      type: 'fix',
      area: 'Reach',
      severity: 'medium',
      current: `${formatCurrencySimple(metrics.cpm)} CPM / ${(metrics.frequency).toFixed(1)}x frequency`,
      suggestion: 'Broaden targeting to reduce CPM. Current audience may be too narrow — test lookalike expansion from 1% to 3%.',
      expectedLift: `+${randInt(20, 50)}% reach at same budget`,
    });
  }
  // Always add at least one optimization suggestion
  if (fixes.length === 0 || status === 'Scaling') {
    fixes.push({
      type: 'optimize',
      area: 'Scale',
      severity: 'low',
      current: `Strong performer — ${ad.overallScore} overall score`,
      suggestion: `Increase daily budget by 20% every 3 days. Create ${randInt(3, 5)} variations to extend creative lifespan. Test on ${platform === 'Meta' ? 'TikTok' : 'Meta'} for cross-platform scale.`,
      expectedLift: `+${randInt(30, 60)}% volume at stable CPA`,
    });
  }

  // Sort fixes by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  fixes.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { elements, audienceSignals, patterns, fixes };
}

// === HIERARCHICAL DATA GENERATORS (Production Patterns) ===

function computeGradesFromMetrics(metrics) {
  const roasScore = Math.min(100, Math.round((metrics.roas / 4) * 100));
  const ctrScore = Math.min(100, Math.round((metrics.ctr / 3) * 100));
  const cvrScore = Math.min(100, Math.round((metrics.cvr / 5) * 100));
  const overall = Math.round(roasScore * 0.4 + ctrScore * 0.3 + cvrScore * 0.3);
  return {
    overall: getScoreGrade(overall),
    overallScore: overall,
    ctr: getScoreGrade(Math.round(ctrScore)),
    ctrScore: Math.round(ctrScore),
    cvr: getScoreGrade(Math.round(cvrScore)),
    cvrScore: Math.round(cvrScore),
    roas: getScoreGrade(Math.round(roasScore)),
    roasScore: Math.round(roasScore),
  };
}

export function generateHierarchicalData(ads) {
  const campaigns = {};
  ads.forEach(ad => {
    if (!campaigns[ad.campaign]) {
      campaigns[ad.campaign] = {
        id: `camp_${Object.keys(campaigns).length}`,
        name: ad.campaign,
        type: 'campaign',
        children: {},
        metrics: { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 },
      };
    }
    const camp = campaigns[ad.campaign];
    if (!camp.children[ad.adSet]) {
      camp.children[ad.adSet] = {
        id: `adset_${ad.campaign}_${Object.keys(camp.children).length}`,
        name: ad.adSet,
        type: 'adSet',
        children: [],
        adCount: 0,
        metrics: { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 },
      };
    }
    const adSet = camp.children[ad.adSet];
    adSet.children.push(ad);
    adSet.adCount++;
    ['spend', 'revenue', 'impressions', 'clicks', 'conversions'].forEach(k => {
      adSet.metrics[k] += ad.metrics[k];
      camp.metrics[k] += ad.metrics[k];
    });
  });

  return Object.values(campaigns).map(camp => {
    camp.metrics.roas = camp.metrics.spend > 0 ? camp.metrics.revenue / camp.metrics.spend : 0;
    camp.metrics.ctr = camp.metrics.impressions > 0 ? (camp.metrics.clicks / camp.metrics.impressions) * 100 : 0;
    camp.metrics.cvr = camp.metrics.clicks > 0 ? (camp.metrics.conversions / camp.metrics.clicks) * 100 : 0;
    camp.grades = computeGradesFromMetrics(camp.metrics);
    camp.adCount = 0;
    camp.children = Object.values(camp.children).map(adSet => {
      adSet.metrics.roas = adSet.metrics.spend > 0 ? adSet.metrics.revenue / adSet.metrics.spend : 0;
      adSet.metrics.ctr = adSet.metrics.impressions > 0 ? (adSet.metrics.clicks / adSet.metrics.impressions) * 100 : 0;
      adSet.metrics.cvr = adSet.metrics.clicks > 0 ? (adSet.metrics.conversions / adSet.metrics.clicks) * 100 : 0;
      adSet.grades = computeGradesFromMetrics(adSet.metrics);
      camp.adCount += adSet.adCount;
      return adSet;
    });
    return camp;
  }).sort((a, b) => b.metrics.revenue - a.metrics.revenue);
}

const LANDING_PAGES = ['homepage', 'products', 'collections', 'carbon-x-pro', 'beard-trimmer', 'others', 'facebook/reel', 'blog'];

export function generateLandingPageData(ads) {
  const pages = {};
  ads.forEach((ad, i) => {
    const pageName = LANDING_PAGES[i % LANDING_PAGES.length];
    if (!pages[pageName]) {
      pages[pageName] = {
        id: `lp_${Object.keys(pages).length}`,
        name: pageName,
        type: 'landingPage',
        children: [],
        adCount: 0,
        metrics: { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 },
      };
    }
    pages[pageName].children.push(ad);
    pages[pageName].adCount++;
    ['spend', 'revenue', 'impressions', 'clicks', 'conversions'].forEach(k => {
      pages[pageName].metrics[k] += ad.metrics[k];
    });
  });

  return Object.values(pages).map(page => {
    page.metrics.roas = page.metrics.spend > 0 ? page.metrics.revenue / page.metrics.spend : 0;
    page.metrics.ctr = page.metrics.impressions > 0 ? (page.metrics.clicks / page.metrics.impressions) * 100 : 0;
    page.metrics.cvr = page.metrics.clicks > 0 ? (page.metrics.conversions / page.metrics.clicks) * 100 : 0;
    page.grades = computeGradesFromMetrics(page.metrics);
    return page;
  }).sort((a, b) => b.metrics.revenue - a.metrics.revenue);
}

export function generateSparklineData(length = 14) {
  const data = [];
  let value = rand(40, 80);
  for (let i = 0; i < length; i++) {
    value = Math.max(10, Math.min(100, value + rand(-15, 15)));
    data.push({ value: Math.round(value) });
  }
  return data;
}

export function generateMetricCardData() {
  return [
    { title: 'Impressions', value: randInt(30000, 80000), prevValue: randInt(30000, 80000), format: 'number' },
    { title: 'Clicks', value: randInt(1000, 5000), prevValue: randInt(1000, 5000), format: 'number' },
    { title: 'Spend', value: Math.round(rand(5000, 50000) * 100) / 100, prevValue: Math.round(rand(5000, 50000) * 100) / 100, format: 'currency' },
    { title: 'Revenue', value: Math.round(rand(10000, 100000) * 100) / 100, prevValue: Math.round(rand(10000, 100000) * 100) / 100, format: 'currency' },
    { title: 'ROAS', value: Math.round(rand(1.5, 5.0) * 100) / 100, prevValue: Math.round(rand(1.5, 5.0) * 100) / 100, format: 'roas' },
    { title: 'CTR', value: Math.round(rand(0.5, 4.0) * 100) / 100, prevValue: Math.round(rand(0.5, 4.0) * 100) / 100, format: 'percent' },
    { title: 'CPA', value: Math.round(rand(10, 80) * 100) / 100, prevValue: Math.round(rand(10, 80) * 100) / 100, format: 'currency' },
    { title: 'Conversions', value: randInt(100, 2000), prevValue: randInt(100, 2000), format: 'number' },
  ].map(m => ({
    ...m,
    change: Math.round(((m.value - m.prevValue) / Math.max(m.prevValue, 1)) * 10000) / 100,
    sparklineData: generateSparklineData(),
    grade: getScoreGrade(Math.min(100, Math.round((m.value / (Math.max(m.prevValue, 1) * 1.2)) * 100))),
  }));
}

export function generateChannelChartData(days = 7) {
  const channels = ['Paid Ads', 'Organic', 'Direct', 'Email Marketing', 'Referrals', 'Unattributed'];
  const data = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    const entry = { date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    channels.forEach(ch => {
      const base = ch === 'Paid Ads' ? 8000 : ch === 'Organic' ? 3000 : ch === 'Direct' ? 2000 : ch === 'Email Marketing' ? 1500 : ch === 'Referrals' ? 800 : 400;
      entry[ch] = Math.round(base + rand(-base * 0.3, base * 0.3));
    });
    data.push(entry);
  }
  return { data, channels };
}

export { getScoreGrade, getScoreColor };
