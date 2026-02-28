import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Trophy, ArrowUpRight, ArrowDownRight, Minus, Flame,
  TrendingUp, Target, Award, ChevronDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { generateAds, generateWeeklyLeaderboard, getScoreColor } from '../data/mockData';
import { formatCurrency, formatNumber, formatPercent, formatRoas, getStatusColor, getRankChange, getScoreColorClass } from '../utils/formatters';
import ScoreRing from '../components/shared/ScoreRing';
import TagBadge from '../components/shared/TagBadge';

const TABS = [
  { key: 'leaderboard', label: 'Weekly Leaderboard', icon: Trophy },
  { key: 'scaling', label: 'Scaling', icon: TrendingUp },
  { key: 'winners', label: 'Winners (A-Grade)', icon: Award },
  { key: 'watchlist', label: 'Needs Attention', icon: Target },
];

export default function TopPerformers() {
  const { filters } = useOutletContext();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [metricView, setMetricView] = useState('roas');

  const allAds = useMemo(() => generateAds(30), []);
  const leaderboard = useMemo(() => generateWeeklyLeaderboard(allAds), [allAds]);

  const getFilteredAds = () => {
    switch (activeTab) {
      case 'scaling':
        return allAds.filter(a => a.status === 'Scaling').sort((a, b) => b.overallScore - a.overallScore);
      case 'winners':
        return allAds.filter(a => a.grade === 'A').sort((a, b) => b.overallScore - a.overallScore);
      case 'watchlist':
        return allAds.filter(a => a.status === 'Declining' || a.grade === 'D').sort((a, b) => a.overallScore - b.overallScore);
      default:
        return leaderboard;
    }
  };

  const displayAds = getFilteredAds();

  // Chart data for score distribution
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: '90-100', min: 90, max: 100, count: 0 },
      { range: '80-89', min: 80, max: 89, count: 0 },
      { range: '70-79', min: 70, max: 79, count: 0 },
      { range: '60-69', min: 60, max: 69, count: 0 },
      { range: '50-59', min: 50, max: 59, count: 0 },
      { range: '40-49', min: 40, max: 49, count: 0 },
      { range: '30-39', min: 30, max: 39, count: 0 },
      { range: '0-29', min: 0, max: 29, count: 0 },
    ];
    allAds.forEach(ad => {
      const bucket = buckets.find(b => ad.overallScore >= b.min && ad.overallScore <= b.max);
      if (bucket) bucket.count++;
    });
    return buckets;
  }, [allAds]);

  const topMetricData = useMemo(() => {
    return allAds
      .sort((a, b) => {
        if (metricView === 'roas') return b.metrics.roas - a.metrics.roas;
        if (metricView === 'ctr') return b.metrics.ctr - a.metrics.ctr;
        if (metricView === 'conversions') return b.metrics.conversions - a.metrics.conversions;
        return b.metrics.revenue - a.metrics.revenue;
      })
      .slice(0, 10)
      .map(ad => ({
        name: ad.name.length > 20 ? ad.name.slice(0, 20) + '...' : ad.name,
        value: metricView === 'roas' ? ad.metrics.roas
          : metricView === 'ctr' ? ad.metrics.ctr
          : metricView === 'conversions' ? ad.metrics.conversions
          : ad.metrics.revenue,
        score: ad.overallScore,
      }));
  }, [allAds, metricView]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Top Performers</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Identify your best creatives and spot rising stars
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-border p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-50 text-primary-700'
                : 'text-text-secondary hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-text-tertiary mb-1">A-Grade Creatives</div>
          <div className="text-2xl font-bold text-green-600">
            {allAds.filter(a => a.grade === 'A').length}
          </div>
          <div className="text-xs text-text-tertiary mt-1">of {allAds.length} total</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-text-tertiary mb-1">Avg Overall Score</div>
          <div className="text-2xl font-bold text-text-primary">
            {Math.round(allAds.reduce((s, a) => s + a.overallScore, 0) / allAds.length)}
          </div>
          <div className="text-xs text-text-tertiary mt-1">across all creatives</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-text-tertiary mb-1">Best ROAS</div>
          <div className="text-2xl font-bold text-primary-600">
            {formatRoas(Math.max(...allAds.map(a => a.metrics.roas)))}
          </div>
          <div className="text-xs text-text-tertiary mt-1">top performer</div>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <div className="text-xs text-text-tertiary mb-1">Scaling Now</div>
          <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
            <Flame className="w-5 h-5" />
            {allAds.filter(a => a.status === 'Scaling').length}
          </div>
          <div className="text-xs text-text-tertiary mt-1">creatives on the rise</div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Score Distribution */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="range" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(value) => [`${value} creatives`, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {scoreDistribution.map((entry, i) => (
                  <Cell key={i} fill={getScoreColor((entry.min + entry.max) / 2)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top by Metric */}
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Top Creatives by Metric</h3>
            <select
              value={metricView}
              onChange={(e) => setMetricView(e.target.value)}
              className="text-xs bg-gray-100 rounded-lg px-3 py-1.5 border-0 text-text-secondary focus:outline-none cursor-pointer"
            >
              <option value="roas">ROAS</option>
              <option value="ctr">CTR</option>
              <option value="conversions">Conversions</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topMetricData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={(value) => [
                  metricView === 'roas' ? `${value}x` : metricView === 'ctr' ? `${value}%` : metricView === 'revenue' ? formatCurrency(value) : value,
                  metricView.toUpperCase(),
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {topMetricData.map((entry, i) => (
                  <Cell key={i} fill={getScoreColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard / List */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">
            {TABS.find(t => t.key === activeTab)?.label} ({displayAds.length})
          </h3>
        </div>
        <div className="divide-y divide-border-light">
          {displayAds.map((ad, index) => {
            const rankChange = ad.previousRank ? getRankChange(ad.rank || index + 1, ad.previousRank) : null;
            return (
              <div key={ad.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                {/* Rank */}
                <div className="w-8 text-center">
                  <span className="text-lg font-bold text-text-primary">
                    {activeTab === 'leaderboard' ? `#${ad.rank}` : index + 1}
                  </span>
                </div>

                {/* Rank change arrow */}
                {rankChange && (
                  <div className="w-5">
                    {rankChange.direction === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                    {rankChange.direction === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                    {rankChange.direction === 'same' && <Minus className="w-4 h-4 text-gray-400" />}
                  </div>
                )}

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl shrink-0" style={{ background: ad.thumbnail }} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary truncate">{ad.name}</div>
                  <div className="text-xs text-text-tertiary mt-0.5">
                    {ad.platform} &middot; {ad.format} &middot; {ad.campaign}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <TagBadge type="hook" value={ad.tags.hook} />
                    <TagBadge type="tone" value={ad.tags.tone} />
                  </div>
                </div>

                {/* Scores */}
                <div className="flex items-center gap-3">
                  <ScoreRing score={ad.scores.hookScore} size={36} strokeWidth={3} label="Hook" />
                  <ScoreRing score={ad.scores.watchScore} size={36} strokeWidth={3} label="Watch" />
                  <ScoreRing score={ad.scores.clickScore} size={36} strokeWidth={3} label="Click" />
                  <ScoreRing score={ad.scores.convertScore} size={36} strokeWidth={3} label="Convert" />
                </div>

                {/* Key metrics */}
                <div className="flex items-center gap-6 text-xs">
                  <div className="text-center">
                    <div className="text-text-tertiary">Spend</div>
                    <div className="font-semibold text-text-primary">{formatCurrency(ad.metrics.spend)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-text-tertiary">ROAS</div>
                    <div className="font-semibold text-text-primary">{formatRoas(ad.metrics.roas)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-text-tertiary">CTR</div>
                    <div className="font-semibold text-text-primary">{formatPercent(ad.metrics.ctr)}</div>
                  </div>
                </div>

                {/* Overall score */}
                <ScoreRing score={ad.overallScore} size={48} strokeWidth={4} />

                {/* Status */}
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${getStatusColor(ad.status)}`}>
                  {ad.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
