import { useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ArrowUpRight, ArrowDownRight, Minus,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  generateTrendData, generateWeeklyLeaderboard, generateMetricCardData,
} from '../data/mockData';
import { useDashboardData } from '../hooks/useDashboardData';
import { formatCurrency, formatNumber, formatRoas, getRankChange } from '../utils/formatters';
import MetricCard from '../components/shared/MetricCard';
import ScoreRing from '../components/shared/ScoreRing';
import GradeBadge from '../components/shared/GradeBadge';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border p-3 text-xs">
      <div className="font-medium text-text-primary mb-1">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-medium text-text-primary">
            {entry.name === 'ROAS' ? `${entry.value}x` : entry.name === 'Revenue' || entry.name === 'Spend' ? formatCurrency(entry.value) : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { filters } = useOutletContext();

  const dashboard = useDashboardData(filters);
  const d = dashboard.data;
  const ads = useMemo(() => d?.ads || [], [d]);
  const platformData = useMemo(() => d?.platforms || [], [d]);
  const funnelData = useMemo(() => d?.funnel || [], [d]);

  const currentTrend = useMemo(() => d?.trends || generateTrendData(30), [d]);
  const previousTrend = useMemo(() => generateTrendData(30), []);
  const trendData = useMemo(() => currentTrend.map((item, i) => ({
    ...item,
    prevRevenue: previousTrend[i]?.revenue || 0,
    prevSpend: previousTrend[i]?.spend || 0,
  })), [currentTrend, previousTrend]);
  const leaderboard = useMemo(() => generateWeeklyLeaderboard(ads), [ads]);
  const metricCards = useMemo(() => generateMetricCardData(), []);

  const scalingCount = ads.filter(a => a.status === 'Scaling').length;
  const decliningCount = ads.filter(a => a.status === 'Declining').length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Creative Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Performance overview across {ads.length} active creatives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {scalingCount} Scaling
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            {decliningCount} Declining
          </span>
        </div>
      </div>

      {/* Metric Cards (production-style) */}
      <div className="grid grid-cols-4 gap-4">
        {metricCards.slice(0, 4).map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {metricCards.slice(4, 8).map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue & Spend Trend */}
        <div className="col-span-2 bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Revenue & Spend Trend</h3>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500" /> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-0 border-t-2 border-dashed border-gray-300" /> Prev Period
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              {/* Previous period - dashed lines behind */}
              <Area type="monotone" dataKey="prevRevenue" name="Prev Revenue" stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="4 3" fill="none" dot={false} />
              <Area type="monotone" dataKey="prevSpend" name="Prev Spend" stroke="#c4b5fd" strokeWidth={1.5} strokeDasharray="4 3" fill="none" dot={false} />
              {/* Current period */}
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#gradRevenue)" strokeWidth={2} />
              <Area type="monotone" dataKey="spend" name="Spend" stroke="#8b5cf6" fill="url(#gradSpend)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Breakdown */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Platform Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="platform" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} barSize={18}>
                {platformData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-2">
            {platformData.map((p, i) => (
              <div key={p.platform} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-text-secondary">{p.platform}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-tertiary">{formatCurrency(p.spend)} spend</span>
                  <span className="font-medium text-text-primary">{formatRoas(p.roas)} ROAS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Shifts + Leaderboard row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Performance Shifts */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Performance Shifts</h3>
            <Link
              to="/creatives"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {ads
              .filter(a => a.status === 'Scaling' || a.status === 'Declining')
              .slice(0, 6)
              .map((ad) => (
                <div key={ad.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div
                    className="w-10 h-10 rounded-lg shrink-0"
                    style={{ background: ad.thumbnail }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{ad.name}</div>
                    <div className="text-[11px] text-text-tertiary">{ad.platform} &middot; {ad.campaign}</div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    ad.status === 'Scaling' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ad.status === 'Scaling' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {ad.status === 'Scaling' ? '+' : ''}{Math.round((ad.metrics.roas - 2) * 100 / 2)}%
                  </div>
                  <GradeBadge score={ad.overallScore} size="sm" />
                </div>
              ))}
          </div>
        </div>

        {/* Weekly Leaderboard */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Weekly Leaderboard</h3>
            <Link
              to="/top-performers"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Full report <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 7).map((ad) => {
              const rankChange = getRankChange(ad.rank, ad.previousRank);
              return (
                <div key={ad.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-6 text-center">
                    <span className="text-sm font-bold text-text-primary">#{ad.rank}</span>
                  </div>
                  <div className="w-4">
                    {rankChange.direction === 'up' && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                    )}
                    {rankChange.direction === 'down' && (
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    )}
                    {rankChange.direction === 'same' && (
                      <Minus className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg shrink-0"
                    style={{ background: ad.thumbnail }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{ad.name}</div>
                    <div className="text-[11px] text-text-tertiary">{ad.platform}</div>
                  </div>
                  <GradeBadge score={ad.overallScore} size="sm" />
                  <ScoreRing score={ad.overallScore} size={36} strokeWidth={3} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Creative Funnel Performance</h3>
        <div className="flex items-end justify-between gap-2 px-4">
          {funnelData.map((stage, i) => {
            const height = Math.max(30, (stage.rate / funnelData[0].rate) * 200);
            return (
              <div key={stage.stage} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-semibold text-text-primary">
                  {formatNumber(stage.value)}
                </div>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${height}px`,
                    background: `linear-gradient(180deg, ${CHART_COLORS[i % CHART_COLORS.length]}dd, ${CHART_COLORS[i % CHART_COLORS.length]}88)`,
                  }}
                />
                <div className="text-[10px] text-text-tertiary text-center leading-tight">
                  {stage.stage}
                </div>
                <div className="text-[10px] font-medium text-text-secondary">
                  {stage.rate}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
