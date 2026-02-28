import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { GitCompareArrows, Layers, MessageSquare, Eye, TrendingUp } from 'lucide-react';
import { generateComparativeData, generateAds, getScoreColor } from '../data/mockData';
import { formatCurrency, formatNumber, formatPercent, formatRoas } from '../utils/formatters';

const VIEW_MODES = [
  { key: 'format', label: 'By Format', icon: Layers },
  { key: 'hook', label: 'By Hook Type', icon: MessageSquare },
];

const METRICS = [
  { key: 'roas', label: 'ROAS' },
  { key: 'ctr', label: 'CTR (%)' },
  { key: 'cpa', label: 'CPA ($)' },
  { key: 'conversionRate', label: 'Conv Rate (%)' },
  { key: 'hookScore', label: 'Hook Score' },
];

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4', '#84cc16', '#e879f9', '#fb923c', '#6366f1'];

export default function Comparative() {
  const { filters } = useOutletContext();
  const [viewMode, setViewMode] = useState('format');
  const [selectedMetric, setSelectedMetric] = useState('roas');

  const comparativeData = useMemo(() => generateComparativeData(), []);
  const allAds = useMemo(() => generateAds(30), []);

  const filteredData = comparativeData.filter(d => d.type === viewMode);

  // Radar data
  const radarData = useMemo(() => {
    return filteredData.map(item => ({
      name: item.label,
      ROAS: Math.min(100, (item.roas / 5) * 100),
      CTR: Math.min(100, (item.ctr / 5) * 100),
      'Hook Score': item.hookScore,
      'Conv Rate': Math.min(100, (item.conversionRate / 8) * 100),
      Spend: Math.min(100, (item.spend / 40000) * 100),
    }));
  }, [filteredData]);

  // Scatter data (spend vs ROAS)
  const scatterData = useMemo(() => {
    return allAds.map(ad => ({
      x: ad.metrics.spend,
      y: ad.metrics.roas,
      z: ad.overallScore,
      name: ad.name,
      format: ad.format,
      platform: ad.platform,
    }));
  }, [allAds]);

  // Platform comparison
  const platformComparison = useMemo(() => {
    const platforms = {};
    allAds.forEach(ad => {
      if (!platforms[ad.platform]) {
        platforms[ad.platform] = { platform: ad.platform, ads: 0, totalSpend: 0, totalRevenue: 0, totalConversions: 0, scores: [] };
      }
      const p = platforms[ad.platform];
      p.ads++;
      p.totalSpend += ad.metrics.spend;
      p.totalRevenue += ad.metrics.revenue;
      p.totalConversions += ad.metrics.conversions;
      p.scores.push(ad.overallScore);
    });
    return Object.values(platforms).map(p => ({
      ...p,
      avgScore: Math.round(p.scores.reduce((s, v) => s + v, 0) / p.scores.length),
      roas: Math.round((p.totalRevenue / p.totalSpend) * 100) / 100,
      cpa: Math.round((p.totalSpend / Math.max(p.totalConversions, 1)) * 100) / 100,
    }));
  }, [allAds]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Comparative Analysis</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Compare performance across creative categories, formats, and platforms
        </p>
      </div>

      {/* View mode tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-border p-1">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === mode.key
                ? 'bg-primary-50 text-primary-700'
                : 'text-text-secondary hover:bg-gray-50'
            }`}
          >
            <mode.icon className="w-4 h-4" />
            {mode.label}
          </button>
        ))}
      </div>

      {/* Comparison Bar Chart */}
      <div className="bg-white rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">
            {viewMode === 'format' ? 'Format' : 'Hook Type'} Comparison
          </h3>
          <div className="flex items-center gap-2">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedMetric === m.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value) => {
                if (selectedMetric === 'roas') return [`${value}x`, 'ROAS'];
                if (selectedMetric === 'ctr' || selectedMetric === 'conversionRate') return [`${value}%`, selectedMetric];
                if (selectedMetric === 'cpa') return [`$${value}`, 'CPA'];
                return [value, selectedMetric];
              }}
            />
            <Bar dataKey={selectedMetric} radius={[6, 6, 0, 0]}>
              {filteredData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar + Table row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Radar Chart */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Multi-Metric Radar</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={[
              { metric: 'ROAS', ...Object.fromEntries(radarData.map(r => [r.name, r.ROAS])) },
              { metric: 'CTR', ...Object.fromEntries(radarData.map(r => [r.name, r.CTR])) },
              { metric: 'Hook', ...Object.fromEntries(radarData.map(r => [r.name, r['Hook Score']])) },
              { metric: 'Conv', ...Object.fromEntries(radarData.map(r => [r.name, r['Conv Rate']])) },
              { metric: 'Spend', ...Object.fromEntries(radarData.map(r => [r.name, r.Spend])) },
            ]}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              {radarData.map((item, i) => (
                <Radar
                  key={item.name}
                  name={item.name}
                  dataKey={item.name}
                  stroke={CHART_COLORS[i]}
                  fill={CHART_COLORS[i]}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              ))}
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Detailed Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-medium text-text-tertiary">Category</th>
                  <th className="text-right py-2 px-2 font-medium text-text-tertiary">Ads</th>
                  <th className="text-right py-2 px-2 font-medium text-text-tertiary">Spend</th>
                  <th className="text-right py-2 px-2 font-medium text-text-tertiary">Revenue</th>
                  <th className="text-right py-2 px-2 font-medium text-text-tertiary">ROAS</th>
                  <th className="text-right py-2 px-2 font-medium text-text-tertiary">CTR</th>
                  <th className="text-right py-2 px-2 font-medium text-text-tertiary">CPA</th>
                  <th className="text-right py-2 pl-2 font-medium text-text-tertiary">Hook</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <tr key={item.label} className="border-b border-border-light hover:bg-gray-50">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                        <span className="font-medium text-text-primary">{item.label}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-text-secondary">{item.adCount}</td>
                    <td className="py-2.5 px-2 text-right font-medium">{formatCurrency(item.spend)}</td>
                    <td className="py-2.5 px-2 text-right font-medium">{formatCurrency(item.revenue)}</td>
                    <td className="py-2.5 px-2 text-right font-medium">{formatRoas(item.roas)}</td>
                    <td className="py-2.5 px-2 text-right font-medium">{formatPercent(item.ctr)}</td>
                    <td className="py-2.5 px-2 text-right font-medium">{formatCurrency(item.cpa)}</td>
                    <td className="py-2.5 pl-2 text-right">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-white"
                        style={{ background: getScoreColor(item.hookScore) }}
                      >
                        {item.hookScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Spend vs ROAS Scatter */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-1">Spend vs ROAS</h3>
        <p className="text-xs text-text-tertiary mb-4">Bubble size represents overall creative score</p>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="x"
              type="number"
              name="Spend"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <YAxis
              dataKey="y"
              type="number"
              name="ROAS"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}x`}
            />
            <ZAxis dataKey="z" range={[40, 400]} name="Score" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value, name) => {
                if (name === 'Spend') return [formatCurrency(value), name];
                if (name === 'ROAS') return [`${value}x`, name];
                return [value, name];
              }}
              labelFormatter={() => ''}
            />
            <Scatter data={scatterData} fill="#3b82f6" fillOpacity={0.6}>
              {scatterData.map((entry, i) => (
                <Cell key={i} fill={getScoreColor(entry.z)} fillOpacity={0.7} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Comparison */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Platform Comparison</h3>
        <div className="grid grid-cols-4 gap-4">
          {platformComparison.map((p) => (
            <div key={p.platform} className="border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="text-sm font-semibold text-text-primary mb-3">{p.platform}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-tertiary">Creatives</span>
                  <span className="font-medium">{p.ads}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-tertiary">Spend</span>
                  <span className="font-medium">{formatCurrency(p.totalSpend)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-tertiary">Revenue</span>
                  <span className="font-medium">{formatCurrency(p.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-tertiary">ROAS</span>
                  <span className="font-bold text-primary-600">{formatRoas(p.roas)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-tertiary">CPA</span>
                  <span className="font-medium">{formatCurrency(p.cpa)}</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-text-tertiary">Avg Score</span>
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold text-white"
                    style={{ background: getScoreColor(p.avgScore) }}
                  >
                    {p.avgScore}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
