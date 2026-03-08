// Core domain types for AdPulse Portal

// === Enums / Unions ===

export type Platform = 'Meta' | 'TikTok' | 'Google' | 'YouTube';
export type AdFormat = 'Video' | 'Image' | 'Carousel' | 'UGC' | 'Story';
export type AdObjective = 'Conversions' | 'Traffic' | 'Awareness' | 'Engagement';
export type AdStatus = 'Active' | 'Scaling' | 'Declining' | 'Paused' | 'Testing';
export type Grade = 'A' | 'B' | 'C' | 'D';
export type ScoreDimension = 'hook' | 'watch' | 'click' | 'convert' | 'reach' | 'signals';
export type MetricFormat = 'currency' | 'percent' | 'roas' | 'number';
export type RankDirection = 'up' | 'down' | 'same';

// === Metrics ===

export interface AdMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;
  conversionRate: number;
  linkClickRate: number;
  thumbstopRate: number;
  firstFrameRetention: number;
  avgWatchTime: number;
  videoRetention15s: number | null;
  thruplayRate: number | null;
  holdRate: number | null;
  estimatedReach: number;
  frequency: number;
  engagementRate: number;
  shareRate: number;
  saveRate: number;
  commentSentiment: number;
  fatigueIndex: number;
}

export interface AdScores {
  hookScore: number;
  watchScore: number;
  clickScore: number;
  convertScore: number;
  reachScore: number;
  signalsScore: number;
}

export interface GradeBreakdown {
  overall: Grade;
  overallScore: number;
  ctr: Grade;
  ctrScore: number;
  cvr: Grade;
  cvrScore: number;
  roas: Grade;
  roasScore: number;
}

// === Core Entities ===

export interface AdTags {
  hook: string;
  cta: string;
  tone: string;
  visual: string;
}

export interface Ad {
  id: string;
  name: string;
  campaign: string;
  adSet: string;
  platform: Platform;
  format: AdFormat;
  objective: AdObjective;
  status: AdStatus;
  thumbnail: string;
  isVideo: boolean;
  tags: AdTags;
  metrics: AdMetrics;
  scores: AdScores;
  overallScore: number;
  grade: Grade;
  createdAt: string;
  lastActive: string;
}

export interface HierarchicalMetrics {
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas?: number;
  ctr?: number;
  cvr?: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'campaign';
  children: AdSet[];
  adCount: number;
  metrics: HierarchicalMetrics;
  grades: GradeBreakdown;
}

export interface AdSet {
  id: string;
  name: string;
  type: 'adSet';
  children: Ad[];
  adCount: number;
  metrics: HierarchicalMetrics;
  grades: GradeBreakdown;
}

export interface LandingPage {
  id: string;
  name: string;
  type: 'landingPage';
  children: Ad[];
  adCount: number;
  metrics: HierarchicalMetrics;
  grades: GradeBreakdown;
}

// === Channel / Platform ===

export interface ChannelBreakdown {
  platform: string;
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  conversions: number;
  share: number;
}

// === Trend & Chart Data ===

export interface TrendDataPoint {
  date: string;
  label: string;
  revenue: number;
  spend: number;
  orders: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  convRate: number;
  cpm: number;
  cpa: number;
}

export interface SparklineDataPoint {
  value: number;
}

export interface FunnelStage {
  stage: string;
  value: number;
  rate: number;
}

// === Metric Cards ===

export interface MetricCardData {
  title: string;
  value: number;
  prevValue: number;
  format: MetricFormat;
  change: number;
  sparklineData: SparklineDataPoint[];
  grade: Grade;
}

// === Comparative ===

export interface ComparativeCategory {
  label: string;
  type: string;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpa: number;
  conversions: number;
  hookScore: number;
  conversionRate: number;
  adCount: number;
}

// === Leaderboard ===

export interface LeaderboardEntry extends Ad {
  rank: number;
  previousRank: number;
  weeklySpendChange: number;
}

// === Creative Detail ===

export interface PerformanceHistoryPoint {
  date: string;
  label: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  conversionRate: number;
  roas: number;
  cpa: number;
  cpm: number;
  thumbstopRate: number;
}

export interface CompetitiveInsight {
  id: string;
  brand: string;
  type: string;
  platform: Platform;
  format: AdFormat;
  thumbnail: string;
  estimatedSpend: number;
  estimatedImpressions: number;
  firstSeen: string;
  isActive: boolean;
  overallScore: number;
  grade: Grade;
  observation: string;
  tags: Omit<AdTags, 'tone'>;
}

export interface AIRecommendation {
  id: string;
  category: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: string;
}

export interface PerformanceSummaryItem {
  metric: string;
  value: string;
  detail: string;
}

export interface PerformanceSummary {
  strengths: PerformanceSummaryItem[];
  weaknesses: PerformanceSummaryItem[];
}

export interface CreativeElement {
  element: string;
  label: string;
  impact: 'positive' | 'neutral' | 'negative';
  score: number;
  insight: string;
}

export interface AudienceSignals {
  sentiment: number;
  sentimentLabel: 'Positive' | 'Mixed' | 'Negative';
  topObjections: string[];
  topAngles: string[];
  engagementBreakdown: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
}

export interface CreativePattern {
  pattern: string;
  finding: string;
  confidence: number;
}

export interface CreativeFix {
  type: 'fix' | 'optimize';
  area: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  current: string;
  suggestion: string;
  expectedLift: string;
}

export interface CreativeAnalysis {
  elements: CreativeElement[];
  audienceSignals: AudienceSignals;
  patterns: CreativePattern[];
  fixes: CreativeFix[];
}

// === Channel Chart ===

export interface ChannelChartData {
  data: Record<string, string | number>[];
  channels: string[];
}

// === Table Column Config ===

export interface ColumnConfig<T = Record<string, unknown>> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// === Route Config ===

export interface BreadcrumbItem {
  label: string;
  icon?: React.ComponentType<{ size?: number }>;
  to?: string;
}

export interface RouteConfigEntry {
  breadcrumbs: BreadcrumbItem[];
  validTabs?: string[];
  showFilterBar?: boolean;
  subTabs?: { key: string; label: string }[];
}

// === Rank Change ===

export interface RankChange {
  direction: RankDirection;
  value: number;
}

// === Outlet Context (AppLayout → children) ===

export interface AppOutletContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  selectedChannels: string[];
  setSelectedChannels: (channels: string[]) => void;
}
