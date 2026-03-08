import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle2, Eye, Swords,
  ChevronDown, ChevronUp, BarChart3, Clock, MousePointerClick,
  ShoppingCart, Target, Sparkles,
  Megaphone, Activity, Users, MessageSquare, Heart,
  Share2, Bookmark, Brain,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  generateCompetitiveInsights, getScoreColor,
} from '../data/mockData';
import { useCreativeDetail } from '../hooks/useCreativeDetail';
import {
  formatCurrency, formatNumber, formatPercent, formatRoas,
  getScoreColorClass, getStatusColor, timeAgo,
} from '../utils/formatters';
import ScoreRing from '../components/shared/ScoreRing';
import AdThumbnail from '../components/shared/AdThumbnail';
import TagBadge from '../components/shared/TagBadge';
import GradeBadge from '../components/shared/GradeBadge';
import { LoadingSpinner } from '../components/shared/LoadingSkeleton';

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border p-3 text-xs">
      <div className="font-medium text-text-primary mb-1.5">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-medium text-text-primary">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// Metric trend indicator
function MetricTrend({ current, previous }) {
  if (!previous) return null;
  const pctChange = ((current - previous) / Math.abs(previous || 1)) * 100;
  const isUp = pctChange > 2;
  const isDown = pctChange < -2;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
      isUp ? 'text-green-600' : isDown ? 'text-red-600' : 'text-gray-400'
    }`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : isDown ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {Math.abs(pctChange).toFixed(1)}%
    </span>
  );
}

// Priority badge for recommendations
function PriorityBadge({ priority }) {
  const styles = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border uppercase tracking-wider ${styles[priority]}`}>
      {priority}
    </span>
  );
}

// Chart metric selector
const CHART_METRICS = [
  { key: 'spend', label: 'Spend', format: v => `$${v}` },
  { key: 'revenue', label: 'Revenue', format: v => `$${v}` },
  { key: 'roas', label: 'ROAS', format: v => `${v}x` },
  { key: 'ctr', label: 'CTR', format: v => `${v}%` },
  { key: 'cpa', label: 'CPA', format: v => `$${v}` },
  { key: 'conversions', label: 'Conversions', format: v => v },
  { key: 'thumbstopRate', label: 'Thumbstop', format: v => `${v}%` },
  { key: 'impressions', label: 'Impressions', format: v => formatNumber(v) },
];

export default function CreativeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeChart, setActiveChart] = useState('roas');
  const [expandedRec, setExpandedRec] = useState(null);
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);

  // Fetch data via hook (uses mock when VITE_USE_MOCK_DATA=true)
  const detail = useCreativeDetail(id);
  const ad = detail.data?.ad;
  const history = detail.data?.history || [];
  const competitors = useMemo(() => ad ? generateCompetitiveInsights(ad) : [], [ad]);
  const performanceSummary = detail.data?.summary || { strengths: [], weaknesses: [] };
  const creativeAnalysis = detail.data?.analysis || null;

  if (detail.loading) {
    return <LoadingSpinner className="h-96" />;
  }

  if (!ad) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Creative not found</h2>
        <p className="text-sm text-text-secondary mb-6">The creative you're looking for doesn't exist or has been removed.</p>
        <Link to="/analyze/acquisition?tab=creatives" className="text-sm font-medium text-primary-600 hover:text-primary-700">
          &larr; Back to Creatives
        </Link>
      </div>
    );
  }

  // Calculate 7d trend from history
  const recent7 = history.slice(-7);
  const prior7 = history.slice(-14, -7);
  const avg = (arr, key) => arr.reduce((s, d) => s + d[key], 0) / (arr.length || 1);

  const chartMetric = CHART_METRICS.find(m => m.key === activeChart);

  // Score breakdown data
  const funnelStages = [
    { label: 'Hook', score: ad.scores.hookScore, icon: Eye, desc: 'Captures attention in feed', metrics: [`Thumbstop: ${ad.metrics.thumbstopRate}%`, `1st Frame Ret: ${ad.metrics.firstFrameRetention}%`] },
    { label: 'Watch', score: ad.scores.watchScore, icon: Clock, desc: 'Holds viewer attention', metrics: [`Avg Watch: ${ad.metrics.avgWatchTime}s`, ad.metrics.videoRetention15s ? `15s Ret: ${ad.metrics.videoRetention15s}%` : null, ad.metrics.thruplayRate ? `Thruplay: ${ad.metrics.thruplayRate}%` : null].filter(Boolean) },
    { label: 'Click', score: ad.scores.clickScore, icon: MousePointerClick, desc: 'Drives action & clicks', metrics: [`CTR: ${ad.metrics.ctr}%`, `Link Clicks: ${ad.metrics.linkClickRate}%`] },
    { label: 'Convert', score: ad.scores.convertScore, icon: ShoppingCart, desc: 'Generates conversions', metrics: [`Conv Rate: ${ad.metrics.conversionRate}%`, `ROAS: ${ad.metrics.roas}x`, `CPA: $${ad.metrics.cpa.toFixed(2)}`] },
    { label: 'Reach', score: ad.scores.reachScore, icon: Megaphone, desc: 'Audience reach efficiency', metrics: [`Reach: ${formatNumber(ad.metrics.estimatedReach)}`, `CPM: $${ad.metrics.cpm.toFixed(2)}`, `Frequency: ${ad.metrics.frequency}x`] },
    { label: 'Signals', score: ad.scores.signalsScore, icon: Activity, desc: 'Engagement & health signals', metrics: [`Engagement: ${ad.metrics.engagementRate}%`, `Share Rate: ${ad.metrics.shareRate}%`, `Fatigue: ${ad.metrics.fatigueIndex}%`] },
  ];

  const visibleCompetitors = showAllCompetitors ? competitors : competitors.slice(0, 3);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb & Back */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/analyze/acquisition?tab=creatives')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-lg px-1.5 py-0.5 -ml-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Creatives
        </button>
        <span className="text-text-tertiary">/</span>
        <span className="text-sm font-medium text-text-primary truncate">{ad.name}</span>
      </div>

      {/* =========== HERO SECTION =========== */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-72 shrink-0">
            <AdThumbnail ad={ad} size="lg" />
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-bold text-text-primary">{ad.name}</h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}>
                    {ad.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>{ad.platform}</span>
                  <span className="text-text-tertiary">&middot;</span>
                  <span>{ad.format}</span>
                  <span className="text-text-tertiary">&middot;</span>
                  <span>{ad.objective}</span>
                </div>
                <div className="text-xs text-text-tertiary mt-1">
                  {ad.campaign} &middot; {ad.adSet}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {Object.entries(ad.tags).map(([type, value]) => (
                    <TagBadge key={type} type={type} value={value} />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <ScoreRing score={ad.overallScore} size={80} strokeWidth={5} />
                <div className="flex items-center justify-center gap-2 mt-2">
                  <GradeBadge score={ad.overallScore} size="lg" />
                  <span className="text-xs font-semibold text-text-secondary">Grade {ad.grade}</span>
                </div>
                <div className="text-xs text-text-tertiary mt-0.5">Overall Score</div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6 pt-5 border-t border-border-light">
              {[
                { label: 'Spend', value: formatCurrency(ad.metrics.spend), trend: avg(recent7, 'spend') - avg(prior7, 'spend') > 0 },
                { label: 'Revenue', value: formatCurrency(ad.metrics.revenue), trend: avg(recent7, 'revenue') - avg(prior7, 'revenue') > 0 },
                { label: 'ROAS', value: formatRoas(ad.metrics.roas), trend: avg(recent7, 'roas') - avg(prior7, 'roas') > 0 },
                { label: 'CTR', value: formatPercent(ad.metrics.ctr), trend: avg(recent7, 'ctr') - avg(prior7, 'ctr') > 0 },
                { label: 'CPA', value: formatCurrency(ad.metrics.cpa), trend: avg(recent7, 'cpa') - avg(prior7, 'cpa') < 0 },
                { label: 'Conversions', value: formatNumber(ad.metrics.conversions), trend: avg(recent7, 'conversions') - avg(prior7, 'conversions') > 0 },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-lg font-bold text-text-primary">{stat.value}</div>
                  <div className={`text-xs font-medium ${stat.trend ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend ? '7d trending up' : '7d trending down'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========== HEALTH FUNNEL STRIP (full width) =========== */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-500" />
            Creative Health
          </h2>
          <div className="flex items-center gap-3 text-xs text-text-tertiary">
            {[
              { grade: 'A', range: '80+', color: 'bg-green-500' },
              { grade: 'B', range: '60-79', color: 'bg-lime-500' },
              { grade: 'C', range: '40-59', color: 'bg-amber-500' },
              { grade: 'D', range: '0-39', color: 'bg-red-500' },
            ].map(g => (
              <span key={g.grade} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${g.color}`} />
                <span className="font-semibold text-text-secondary">{g.grade}</span>
                <span>{g.range}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {funnelStages.map((stage) => {
            const Icon = stage.icon;
            const color = getScoreColor(stage.score);
            const stageGrade = stage.score >= 80 ? 'A' : stage.score >= 60 ? 'B' : stage.score >= 40 ? 'C' : 'D';
            return (
              <div key={stage.label} className="p-4 rounded-lg bg-gray-50 border border-border-light text-center hover:bg-white hover:shadow-sm hover:border-border transition-all duration-150">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-xs font-semibold text-text-primary">{stage.label}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    stageGrade === 'A' ? 'bg-green-100 text-green-700' :
                    stageGrade === 'B' ? 'bg-lime-100 text-lime-700' :
                    stageGrade === 'C' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>{stageGrade}</span>
                </div>
                <div className="flex justify-center mb-2">
                  <ScoreRing score={stage.score} size={48} strokeWidth={4} />
                </div>
                <p className="text-xs text-text-tertiary mb-1.5">{stage.desc}</p>
                <div className="space-y-0.5">
                  {stage.metrics.map((m, i) => (
                    <div key={i} className="text-xs text-text-secondary">{m}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========== PERFORMANCE TREND CHART (full width) =========== */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-500" />
              Performance Trend
            </h2>
            <p className="text-xs text-text-tertiary mt-0.5">Daily performance over the last 30 days</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {CHART_METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveChart(m.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                  activeChart === m.key
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey={activeChart}
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#colorMetric)"
                name={chartMetric.label}
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========== TWO-COLUMN LAYOUT =========== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* =========== LEFT COLUMN (3/5) =========== */}
        <div className="lg:col-span-3 space-y-6">

          {/* --- WHAT'S WORKING / NOT WORKING --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                What's Working
              </h3>
              <div className="space-y-3">
                {performanceSummary.strengths.length > 0 ? performanceSummary.strengths.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                    <div className="w-1 h-full min-h-[40px] bg-green-400 rounded-full shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-green-700">{item.metric}</span>
                        <span className="text-sm font-bold text-green-800">{item.value}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-text-tertiary italic">No strong signals detected yet.</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                What Needs Work
              </h3>
              <div className="space-y-3">
                {performanceSummary.weaknesses.length > 0 ? performanceSummary.weaknesses.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg border border-red-100">
                    <div className="w-1 h-full min-h-[40px] bg-red-400 rounded-full shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-red-700">{item.metric}</span>
                        <span className="text-sm font-bold text-red-800">{item.value}</span>
                      </div>
                      <p className="text-xs text-red-600 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-text-tertiary italic">All metrics look healthy!</p>
                )}
              </div>
            </div>
          </div>

          {/* --- AI RECOMMENDATIONS (integrated) --- */}
          {creativeAnalysis && (
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  AI Recommendations
                </h2>
                <span className="text-xs text-text-tertiary">{creativeAnalysis.fixes.length} suggestions</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {creativeAnalysis.fixes.map((fix, idx) => {
                  const iconMap = {
                    Hook: { icon: Eye, gradient: 'from-violet-500 to-purple-600' },
                    Retention: { icon: Clock, gradient: 'from-blue-500 to-cyan-600' },
                    CTA: { icon: MousePointerClick, gradient: 'from-emerald-500 to-teal-600' },
                    Fatigue: { icon: AlertTriangle, gradient: 'from-orange-500 to-amber-600' },
                    Conversion: { icon: ShoppingCart, gradient: 'from-pink-500 to-rose-600' },
                    Reach: { icon: Megaphone, gradient: 'from-sky-500 to-blue-600' },
                    Scale: { icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
                  };
                  const mapped = iconMap[fix.area] || { icon: Sparkles, gradient: 'from-indigo-500 to-purple-600' };
                  const FixIcon = mapped.icon;
                  return (
                    <div key={idx} className="rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                      <div className={`h-1 bg-gradient-to-r ${mapped.gradient}`} />
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${mapped.gradient} flex items-center justify-center`}>
                              <FixIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-xs font-bold text-text-primary uppercase tracking-wide">{fix.area}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            fix.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            fix.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            fix.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {fix.severity}
                          </span>
                        </div>
                        <div className="text-xs text-text-tertiary mb-2">{fix.current}</div>
                        <p className="text-sm text-text-primary leading-relaxed mb-4">{fix.suggestion}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-border-light">
                          <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs font-semibold text-green-700">{fix.expectedLift}</span>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary-50 text-text-secondary hover:text-primary-700 rounded-lg text-xs font-medium transition-colors group-hover:bg-primary-50 group-hover:text-primary-700">
                            <Sparkles className="w-3 h-3" />
                            Generate brief
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* =========== RIGHT COLUMN (2/5) =========== */}
        <div className="lg:col-span-2 space-y-6">

          {/* --- GROUPED METRICS --- */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Key Metrics</h3>

            {[
              { group: 'Financial', icon: ShoppingCart, metrics: [
                ['Spend', formatCurrency(ad.metrics.spend)],
                ['Revenue', formatCurrency(ad.metrics.revenue)],
                ['ROAS', formatRoas(ad.metrics.roas)],
                ['CPA', formatCurrency(ad.metrics.cpa)],
                ['CPC', formatCurrency(ad.metrics.cpc)],
                ['CPM', formatCurrency(ad.metrics.cpm)],
              ]},
              { group: 'Traffic', icon: MousePointerClick, metrics: [
                ['Impressions', formatNumber(ad.metrics.impressions)],
                ['Clicks', formatNumber(ad.metrics.clicks)],
                ['CTR', formatPercent(ad.metrics.ctr)],
                ['Conv Rate', formatPercent(ad.metrics.conversionRate)],
                ['Conversions', formatNumber(ad.metrics.conversions)],
                ['Link Click Rate', formatPercent(ad.metrics.linkClickRate)],
              ]},
              { group: 'Creative Quality', icon: Eye, metrics: [
                ['Thumbstop Rate', formatPercent(ad.metrics.thumbstopRate)],
                ['1st Frame Retention', formatPercent(ad.metrics.firstFrameRetention)],
                ['Avg Watch Time', `${ad.metrics.avgWatchTime}s`],
                ...(ad.metrics.videoRetention15s != null ? [['15s Retention', formatPercent(ad.metrics.videoRetention15s)]] : []),
                ...(ad.metrics.thruplayRate != null ? [['Thruplay Rate', formatPercent(ad.metrics.thruplayRate)]] : []),
                ...(ad.metrics.holdRate != null ? [['Hold Rate', formatPercent(ad.metrics.holdRate)]] : []),
              ]},
              { group: 'Engagement & Health', icon: Activity, metrics: [
                ['Est. Reach', formatNumber(ad.metrics.estimatedReach)],
                ['Frequency', `${ad.metrics.frequency}x`],
                ['Engagement Rate', formatPercent(ad.metrics.engagementRate)],
                ['Share Rate', formatPercent(ad.metrics.shareRate)],
                ['Save Rate', formatPercent(ad.metrics.saveRate)],
                ['Fatigue Index', `${ad.metrics.fatigueIndex}%`],
              ]},
            ].map(({ group, icon: GroupIcon, metrics }) => (
              <div key={group} className="mb-4 last:mb-0">
                <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GroupIcon className="w-3 h-3" />
                  {group}
                </div>
                <div className="space-y-0">
                  {metrics.map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-border-light last:border-0">
                      <span className="text-xs text-text-tertiary">{label}</span>
                      <span className="text-xs font-semibold text-text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* --- ELEMENT ANALYSIS --- */}
          {creativeAnalysis && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-purple-500" />
                Element Analysis
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {creativeAnalysis.elements.map((el) => (
                  <div key={el.element} className="text-center p-2.5 rounded-lg bg-gray-50 border border-border-light">
                    <ScoreRing score={el.score} size={36} strokeWidth={3} />
                    <div className="text-xs font-semibold text-text-primary mt-1.5">{el.element}</div>
                    <div className="text-xs text-text-tertiary mt-0.5 truncate">{el.label}</div>
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full mx-auto ${
                      el.impact === 'positive' ? 'bg-green-500' :
                      el.impact === 'neutral' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- AUDIENCE SIGNALS --- */}
          {creativeAnalysis && (
            <div className="bg-white rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-500" />
                Audience Signals
              </h3>
              <div className="flex items-center gap-3 mb-3 p-2.5 bg-gray-50 rounded-lg">
                <ScoreRing score={creativeAnalysis.audienceSignals.sentiment} size={40} strokeWidth={3} />
                <div>
                  <span className={`text-sm font-bold ${
                    creativeAnalysis.audienceSignals.sentiment >= 75 ? 'text-green-600' :
                    creativeAnalysis.audienceSignals.sentiment >= 50 ? 'text-amber-600' : 'text-red-600'
                  }`}>{creativeAnalysis.audienceSignals.sentimentLabel}</span>
                  <div className="text-xs text-text-tertiary">Sentiment</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Likes', value: creativeAnalysis.audienceSignals.engagementBreakdown.likes, icon: Heart, color: 'text-red-400' },
                  { label: 'Comments', value: creativeAnalysis.audienceSignals.engagementBreakdown.comments, icon: MessageSquare, color: 'text-blue-400' },
                  { label: 'Shares', value: creativeAnalysis.audienceSignals.engagementBreakdown.shares, icon: Share2, color: 'text-green-400' },
                  { label: 'Saves', value: creativeAnalysis.audienceSignals.engagementBreakdown.saves, icon: Bookmark, color: 'text-purple-400' },
                ].map(({ label, value, icon: SigIcon, color }) => (
                  <div key={label} className="text-center p-2 bg-gray-50 rounded-lg">
                    <SigIcon className={`w-3.5 h-3.5 ${color} mx-auto mb-1`} />
                    <div className="text-xs font-bold text-text-primary">{formatNumber(value)}</div>
                    <div className="text-xs text-text-tertiary">{label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {creativeAnalysis.audienceSignals.topAngles.map((angle, i) => (
                  <div key={`a-${i}`} className="flex items-start gap-1.5 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-text-secondary">{angle}</span>
                  </div>
                ))}
                {creativeAnalysis.audienceSignals.topObjections.map((obj, i) => (
                  <div key={`o-${i}`} className="flex items-start gap-1.5 text-xs">
                    <AlertTriangle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-text-secondary">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- DETAILS / META --- */}
          <div className="bg-white rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Created</span>
                <span className="text-text-primary">{timeAgo(ad.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Last Active</span>
                <span className="text-text-primary">{timeAgo(ad.lastActive)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Ad Set</span>
                <span className="text-text-primary">{ad.adSet}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Objective</span>
                <span className="text-text-primary">{ad.objective}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Ad ID</span>
                <span className="text-text-primary font-mono text-xs">{ad.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========== COMPETITIVE INSIGHTS (full width, bottom) =========== */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Swords className="w-4 h-4 text-purple-500" />
              Competitive Insights
            </h2>
            <p className="text-xs text-text-tertiary mt-0.5">
              What competitors are running in similar ad categories
            </p>
          </div>
          <span className="text-xs text-text-tertiary">{competitors.length} competitor ads found</span>
        </div>
        <div className="space-y-3">
          {visibleCompetitors.map((comp) => (
            <div key={comp.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-border-light hover:border-purple-200 transition-colors">
              <div className="w-20 h-20 rounded-lg shrink-0 relative overflow-hidden" style={{ background: comp.thumbnail }}>
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 rounded text-xs text-white font-medium">
                  {comp.format}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{comp.brand}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                      {comp.type}
                    </span>
                    {comp.isActive && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${getScoreColorClass(comp.overallScore).split(' ')[0]}`}>
                    Score: {comp.overallScore}
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-2">{comp.observation}</p>
                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span>{comp.platform}</span>
                  <span>Est. Spend: {formatCurrency(comp.estimatedSpend)}</span>
                  <span>Est. Impressions: {formatNumber(comp.estimatedImpressions)}</span>
                  <span>First seen: {comp.firstSeen}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  <TagBadge type="hook" value={comp.tags.hook} />
                  <TagBadge type="cta" value={comp.tags.cta} />
                  <TagBadge type="visual" value={comp.tags.visual} />
                </div>
              </div>
            </div>
          ))}
        </div>
        {competitors.length > 3 && (
          <button
            onClick={() => setShowAllCompetitors(!showAllCompetitors)}
            className="mt-4 w-full flex items-center justify-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
          >
            {showAllCompetitors ? (
              <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
            ) : (
              <>Show All {competitors.length} Competitors <ChevronDown className="w-3.5 h-3.5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
