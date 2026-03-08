import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Info, Download, BarChart3, TrendingUp, TrendingDown, ChevronDown, ChevronRight,
  CircleDot, DollarSign, CreditCard, ShoppingCart, Target, Eye,
  SlidersHorizontal, X, ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine,
} from 'recharts';
import { formatCurrency, formatPercent, formatNumber, formatRoas } from '../../utils/formatters';
import { generateSparklineData } from '../../data/mockData';
import Sparkline from '../shared/Sparkline';
import type { ChannelChartData, MetricFormat, SparklineDataPoint } from '../../types';

/* ── Local types ─────────────────────────────────────────── */

interface Filters {
  [key: string]: string;
}

interface ChannelsTabProps {
  channelChart: ChannelChartData;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

interface MetricOption {
  key: string;
  label: string;
  Icon: LucideIcon;
  format: MetricFormat;
}

interface FilterConfig {
  key: string;
  label: string;
  options: string[];
}

interface TableColumn {
  key: string;
  label: string;
  format: MetricFormat;
  defaultVisible: boolean;
  tip: string;
}

interface ChannelSourceMetrics {
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  orders: number;
  cac: number;
  clicks: number;
  impressions: number;
  conversionRate: number;
}

interface ChannelSource {
  name: string;
  metrics: ChannelSourceMetrics;
  changes: Record<string, number>;
  sparklines: Record<string, SparklineDataPoint[]>;
}

interface ChannelRow {
  category: string;
  metrics: ChannelSourceMetrics;
  changes: Record<string, number>;
  sparklines: Record<string, SparklineDataPoint[]>;
  sources: ChannelSource[];
}

interface BarDataItem {
  channel: string;
  revenue: number;
  pct: string;
  color: string;
}

interface ScatterDataItem {
  channel: string;
  spend: number;
  revenue: number;
  orders: number;
  color: string;
}

interface SidebarDataItem {
  channel: string;
  value: number;
  colorIndex: number;
}

interface MetricAggregate {
  current: number;
  change: number;
  currentSpend?: number;
  roas?: number;
}

/* ── Constants ────────────────────────────────────────────── */

const CHANNEL_COLORS = ['#ef4444', '#f97316', '#64748b', '#3b82f6', '#22c55e', '#8b5cf6'];

const METRIC_OPTIONS: MetricOption[] = [
  { key: 'revenue', label: 'Revenue', Icon: DollarSign, format: 'currency' },
  { key: 'spend', label: 'Spend', Icon: CreditCard, format: 'currency' },
  { key: 'revenueVsSpend', label: 'Revenue vs Spend', Icon: ArrowLeftRight, format: 'currency' },
  { key: 'orders', label: 'Orders', Icon: ShoppingCart, format: 'number' },
  { key: 'ctr', label: 'CTR %', Icon: Target, format: 'percent' },
  { key: 'conversionRate', label: 'Conversion %', Icon: TrendingUp, format: 'percent' },
  { key: 'cac', label: 'CAC', Icon: DollarSign, format: 'currency' },
  { key: 'clicks', label: 'Clicks', Icon: CircleDot, format: 'number' },
  { key: 'impressions', label: 'Impressions', Icon: Eye, format: 'number' },
];

const ADDITIVE_METRICS = new Set(['revenue', 'spend', 'orders', 'clicks', 'impressions']);

const FILTER_CONFIGS: FilterConfig[] = [
  { key: 'attribution', label: 'Attribution Model', options: ['Platform data-driven', 'Last Click', 'First Click', 'Linear', 'Time Decay'] },
  { key: 'channels', label: 'Channels', options: ['All Channels', 'Paid Ads', 'Organic', 'Email Marketing', 'Direct', 'Referrals'] },
  { key: 'creativeTypes', label: 'Creative Types', options: ['All Creative Types', 'Video', 'Image', 'UGC', 'Carousel', 'Story'] },
  { key: 'status', label: 'Status', options: ['All Status', 'Active', 'Paused', 'Scaling', 'Declining', 'Testing'] },
];

const ALL_TABLE_COLUMNS: TableColumn[] = [
  { key: 'spend', label: 'SPEND', format: 'currency', defaultVisible: true, tip: 'Total ad spend for the selected period' },
  { key: 'revenue', label: 'REVENUE', format: 'currency', defaultVisible: true, tip: 'Total revenue attributed to this channel' },
  { key: 'roas', label: 'ROAS', format: 'roas', defaultVisible: true, tip: 'Return on Ad Spend — revenue earned per dollar spent' },
  { key: 'ctr', label: 'CTR %', format: 'percent', defaultVisible: false, tip: 'Click-through rate — % of viewers who clicked' },
  { key: 'orders', label: 'ORDERS', format: 'number', defaultVisible: true, tip: 'Total orders attributed to this channel' },
  { key: 'cac', label: 'CAC', format: 'currency', defaultVisible: true, tip: 'Customer Acquisition Cost — cost per new customer' },
  { key: 'clicks', label: 'CLICKS', format: 'number', defaultVisible: false, tip: 'Total ad clicks' },
  { key: 'impressions', label: 'VIEWS', format: 'number', defaultVisible: false, tip: 'Total times ads were shown' },
  { key: 'conversionRate', label: 'CONV %', format: 'percent', defaultVisible: false, tip: '% of clicks that resulted in an order' },
];

const DEFAULT_VISIBLE_COLUMNS = new Set(ALL_TABLE_COLUMNS.filter(c => c.defaultVisible).map(c => c.key));

const BREAKEVEN_ROAS = 3.0;
const PROAS_TARGET = 4.0;

const TOOLTIPS: Record<string, string> = {
  title: 'Overview of all your marketing channel performance',
  performance: 'Track how your marketing spend and returns change over time',
  distribution: 'See how each channel contributes to your totals',
  breakdown: 'Detailed per-channel and per-source metrics with trends',
};

/* ── Helpers ─────────────────────────────────────────────── */

function rand(min: number, max: number): number { return Math.random() * (max - min) + min; }

function formatMetricValue(value: number | null | undefined, format: string): string {
  if (value === 0 || value == null) return '–';
  switch (format) {
    case 'currency': return formatCurrency(value);
    case 'roas': return formatRoas(value);
    case 'percent': return formatPercent(value);
    case 'number': return formatNumber(value);
    default: return String(value);
  }
}

function generateChannelTableData(): ChannelRow[] {
  const channels = [
    {
      category: 'Paid Ads',
      sources: [
        { name: 'Google Ads', spend: 4490, revenue: 32600, roas: 7.26, ctr: 2.03, orders: 325, cac: 13.81, clicks: 3200, impressions: 157600, conversionRate: 10.16 },
        { name: 'Facebook Ads', spend: 4540, revenue: 8960, roas: 1.97, ctr: 2.13, orders: 172, cac: 26.39, clicks: 2800, impressions: 131500, conversionRate: 6.14 },
      ],
    },
    {
      category: 'Marketplaces',
      sources: [
        { name: 'Amazon', spend: 2100, revenue: 28500, roas: 13.57, ctr: 3.80, orders: 480, cac: 4.38, clicks: 8400, impressions: 210000, conversionRate: 5.71 },
        { name: 'Walmart', spend: 1800, revenue: 10910, roas: 6.06, ctr: 3.16, orders: 174, cac: 10.34, clicks: 3100, impressions: 98000, conversionRate: 5.61 },
      ],
    },
    {
      category: 'Direct',
      sources: [
        { name: 'Website', spend: 850, revenue: 6200, roas: 7.29, ctr: 4.67, orders: 72, cac: 11.81, clicks: 2100, impressions: 45000, conversionRate: 3.43 },
        { name: 'App', spend: 320, revenue: 2060, roas: 6.44, ctr: 5.67, orders: 25, cac: 12.80, clicks: 680, impressions: 12000, conversionRate: 3.68 },
      ],
    },
    {
      category: 'Email Marketing',
      sources: [
        { name: 'Klaviyo', spend: 420, revenue: 9800, roas: 23.33, ctr: 6.77, orders: 85, cac: 4.94, clicks: 4200, impressions: 62000, conversionRate: 2.02 },
        { name: 'Campaigns', spend: 180, revenue: 3870, roas: 21.50, ctr: 6.43, orders: 34, cac: 5.29, clicks: 1800, impressions: 28000, conversionRate: 1.89 },
      ],
    },
    {
      category: 'Referrals',
      sources: [
        { name: 'Affiliate', spend: 1200, revenue: 4200, roas: 3.50, ctr: 4.00, orders: 48, cac: 25.00, clicks: 1400, impressions: 35000, conversionRate: 3.43 },
        { name: 'Influencers', spend: 900, revenue: 1750, roas: 1.94, ctr: 3.64, orders: 22, cac: 40.91, clicks: 800, impressions: 22000, conversionRate: 2.75 },
      ],
    },
    {
      category: 'Unattributed',
      sources: [
        { name: 'Other', spend: 130, revenue: 1330, roas: 10.23, ctr: 4.94, orders: 15, cac: 8.67, clicks: 420, impressions: 8500, conversionRate: 3.57 },
      ],
    },
  ];

  function addSparkAndChange(row: Record<string, unknown>) {
    const changes: Record<string, number> = {};
    const sparklines: Record<string, SparklineDataPoint[]> = {};
    ALL_TABLE_COLUMNS.forEach(col => {
      changes[col.key] = parseFloat((rand(-35, 45)).toFixed(2));
      sparklines[col.key] = generateSparklineData(14);
    });
    return { ...row, changes, sparklines };
  }

  return channels.map(ch => {
    const agg = ch.sources.reduce(
      (acc, s) => ({
        spend: acc.spend + s.spend, revenue: acc.revenue + s.revenue,
        orders: acc.orders + s.orders, clicks: acc.clicks + s.clicks,
        impressions: acc.impressions + s.impressions,
      }),
      { spend: 0, revenue: 0, orders: 0, clicks: 0, impressions: 0 }
    );
    const weightedCtr = agg.impressions > 0
      ? ch.sources.reduce((s, src) => s + src.ctr * src.impressions, 0) / agg.impressions
      : 0;

    return addSparkAndChange({
      category: ch.category,
      metrics: {
        spend: agg.spend,
        revenue: agg.revenue,
        roas: agg.spend > 0 ? parseFloat((agg.revenue / agg.spend).toFixed(2)) : 0,
        ctr: parseFloat(weightedCtr.toFixed(2)),
        orders: agg.orders,
        cac: agg.orders > 0 && agg.spend > 0 ? parseFloat((agg.spend / agg.orders).toFixed(2)) : 0,
        clicks: agg.clicks,
        impressions: agg.impressions,
        conversionRate: agg.clicks > 0 ? parseFloat((agg.orders / agg.clicks * 100).toFixed(2)) : 0,
      },
      sources: ch.sources.map(s => addSparkAndChange({ name: s.name, metrics: { ...s } })),
    }) as ChannelRow;
  });
}

/* ── Tooltip components ──────────────────────────────────── */

interface RechartsTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number; payload: Record<string, unknown> }>;
  label?: string;
}

function AreaTooltip({ active, payload, label }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border p-2.5 text-xs">
      <div className="font-medium text-text-primary mb-1">{label}</div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="font-medium text-text-primary">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

function BarTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as unknown as BarDataItem;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border p-2.5 text-xs">
      <div className="font-medium text-text-primary mb-0.5">{d.channel}</div>
      <div className="text-text-secondary">{formatCurrency(d.revenue)} &middot; {d.pct}%</div>
    </div>
  );
}

function ScatterTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as unknown as ScatterDataItem;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-border p-2.5 text-xs min-w-[140px]">
      <div className="font-medium text-text-primary mb-1">{d.channel}</div>
      <div className="space-y-0.5 text-text-secondary">
        <div>Spend: <span className="text-text-primary font-medium">{formatCurrency(d.spend)}</span></div>
        <div>Revenue: <span className="text-text-primary font-medium">{formatCurrency(d.revenue)}</span></div>
        <div>ROAS: <span className="text-text-primary font-medium">{d.spend > 0 ? formatRoas(d.revenue / d.spend) : '–'}</span></div>
      </div>
    </div>
  );
}

/* ── Small UI components ─────────────────────────────────── */

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState<boolean>(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <Info className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-2.5 py-2 bg-gray-900 text-white text-[11px] leading-relaxed rounded-lg shadow-lg z-[60] pointer-events-none text-center">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
}

interface MetricCellProps {
  value: number;
  change: number;
  sparklineData: SparklineDataPoint[];
  format: string;
  showTrends: boolean;
}

function MetricCell({ value, change, sparklineData, format, showTrends }: MetricCellProps) {
  if (value === 0 && format !== 'number') {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm text-text-tertiary">–</span>
        <span className="text-[11px] text-text-tertiary">–</span>
      </div>
    );
  }
  const isPos = change > 0;
  const isNeg = change < 0;
  return (
    <div className="flex flex-col items-end gap-0">
      <span className="text-sm font-medium text-text-primary leading-tight">{formatMetricValue(value, format)}</span>
      {showTrends && <Sparkline data={sparklineData} trend={isPos ? 'positive' : isNeg ? 'negative' : 'neutral'} width={56} height={20} />}
      <span className={`text-[11px] font-medium leading-tight ${isPos ? 'text-green-600' : isNeg ? 'text-red-500' : 'text-text-tertiary'}`}>
        {isPos ? '+' : ''}{change.toFixed(1)}%
      </span>
    </div>
  );
}

/* ── MetricDropdown (Lucide icons) ───────────────────────── */

interface MetricDropdownProps {
  value: string;
  onChange: (key: string) => void;
}

function MetricDropdown({ value, onChange }: MetricDropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = METRIC_OPTIONS.find(o => o.key === value) || METRIC_OPTIONS[0];
  const SelectedIcon = selected.Icon;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-gray-50 text-sm font-medium text-text-primary transition-colors"
      >
        <SelectedIcon className="w-3.5 h-3.5 text-text-secondary" />
        <span>{selected.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-tertiary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl border border-border shadow-xl z-50 py-1 max-h-64 overflow-auto">
          {METRIC_OPTIONS.map(opt => {
            const OptIcon = opt.Icon;
            return (
              <button
                key={opt.key}
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface-secondary transition-colors ${
                  opt.key === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-text-primary'
                }`}
              >
                <OptIcon className={`w-3.5 h-3.5 ${opt.key === value ? 'text-primary-600' : 'text-text-tertiary'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── FilterPopover ───────────────────────────────────────── */

interface FilterPopoverProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

function FilterPopover({ filters, onFiltersChange }: FilterPopoverProps) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeCount = FILTER_CONFIGS.filter(c => {
    const val = filters?.[c.key];
    return val && val !== c.options[0];
  }).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white hover:bg-gray-50 text-sm text-text-primary transition-colors"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-text-tertiary" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="ml-0.5 min-w-[18px] h-[18px] bg-primary-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center px-1">{activeCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-72 bg-white rounded-xl border border-border shadow-xl z-50 p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-text-primary">Filters</span>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button onClick={() => onFiltersChange?.({})} className="text-[11px] text-primary-600 hover:text-primary-700 font-medium">
                  Reset all
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-0.5 hover:bg-gray-100 rounded text-text-tertiary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {FILTER_CONFIGS.map(config => (
            <div key={config.key}>
              <label className="text-[10px] text-text-tertiary font-medium uppercase tracking-wider block mb-1">
                {config.label}
              </label>
              <div className="relative">
                <select
                  value={filters?.[config.key] || config.options[0]}
                  onChange={(e) => onFiltersChange?.({ ...filters, [config.key]: e.target.value })}
                  className="appearance-none w-full border border-border rounded-lg px-2.5 py-1.5 pr-7 text-sm bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
                >
                  {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── ColumnPicker ────────────────────────────────────────── */

interface ColumnPickerProps {
  visibleColumns: Set<string>;
  onChange: (columns: Set<string>) => void;
}

function ColumnPicker({ visibleColumns, onChange }: ColumnPickerProps) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-gray-50 text-xs text-text-secondary transition-colors"
      >
        <SlidersHorizontal className="w-3 h-3" />
        <span>Columns</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl border border-border shadow-xl z-50 py-1.5">
          <div className="px-3 pb-1.5 text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Show columns</div>
          {ALL_TABLE_COLUMNS.map(col => (
            <label key={col.key} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-surface-secondary cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={visibleColumns.has(col.key)}
                onChange={() => {
                  const next = new Set(visibleColumns);
                  next.has(col.key) ? next.delete(col.key) : next.add(col.key);
                  onChange(next);
                }}
                className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500/20"
              />
              <span className="text-text-primary text-xs">{col.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Custom scatter dot ──────────────────────────────────── */

interface RoasDotProps {
  cx?: number;
  cy?: number;
  payload?: ScatterDataItem;
}

function RoasDot(props: RoasDotProps) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  const roas = payload.spend > 0 ? payload.revenue / payload.spend : 0;
  let fill: string;
  if (roas < BREAKEVEN_ROAS) fill = '#ef4444';
  else if (roas < PROAS_TARGET) fill = '#eab308';
  else fill = '#22c55e';
  const r = Math.max(6, Math.min(16, payload.orders / 30));
  return <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={0.8} stroke={fill} strokeWidth={1.5} strokeOpacity={0.4} />;
}

/* ── Main component ──────────────────────────────────────── */

export default function ChannelsTab({ channelChart, filters, onFiltersChange }: ChannelsTabProps) {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'scatter'>('area');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set(['Paid Ads']));
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(DEFAULT_VISIBLE_COLUMNS);
  const [showTrends, setShowTrends] = useState<boolean>(false);

  const channelTotals = useMemo(() => {
    return channelChart.channels.map((ch, i) => {
      const revenue = channelChart.data.reduce((s, d) => s + (Number(d[ch]) || 0), 0);
      return { channel: ch, revenue, colorIndex: i };
    });
  }, [channelChart]);

  const grandTotal = useMemo(() => channelTotals.reduce((s, c) => s + c.revenue, 0), [channelTotals]);

  const barData: BarDataItem[] = useMemo(() => {
    return [...channelTotals]
      .sort((a, b) => b.revenue - a.revenue)
      .map(c => ({ channel: c.channel, revenue: c.revenue, pct: ((c.revenue / grandTotal) * 100).toFixed(1), color: CHANNEL_COLORS[c.colorIndex] }));
  }, [channelTotals, grandTotal]);

  const channelTableData = useMemo(() => generateChannelTableData(), []);

  const metricAggregates = useMemo((): Record<string, MetricAggregate> => {
    const tr = channelTableData.reduce((s, c) => s + c.metrics.revenue, 0);
    const ts = channelTableData.reduce((s, c) => s + c.metrics.spend, 0);
    const to = channelTableData.reduce((s, c) => s + c.metrics.orders, 0);
    const tc = channelTableData.reduce((s, c) => s + c.metrics.clicks, 0);
    const ti = channelTableData.reduce((s, c) => s + c.metrics.impressions, 0);
    return {
      revenue: { current: tr, change: parseFloat((rand(-25, 15)).toFixed(1)) },
      spend: { current: ts, change: parseFloat((rand(-20, 10)).toFixed(1)) },
      revenueVsSpend: { current: tr, currentSpend: ts, change: parseFloat((rand(-15, 20)).toFixed(1)), roas: ts > 0 ? tr / ts : 0 },
      orders: { current: to, change: parseFloat((rand(-30, 20)).toFixed(1)) },
      ctr: { current: ti > 0 ? tc / ti * 100 : 0, change: parseFloat((rand(-8, 5)).toFixed(1)) },
      conversionRate: { current: tc > 0 ? to / tc * 100 : 0, change: parseFloat((rand(-10, 8)).toFixed(1)) },
      cac: { current: to > 0 ? ts / to : 0, change: parseFloat((rand(-15, 12)).toFixed(1)) },
      clicks: { current: tc, change: parseFloat((rand(-20, 15)).toFixed(1)) },
      impressions: { current: ti, change: parseFloat((rand(-15, 20)).toFixed(1)) },
    };
  }, [channelTableData]);

  const selectedMetricData = metricAggregates[selectedMetric] || metricAggregates.revenue;
  const selectedMetricOpt = METRIC_OPTIONS.find(o => o.key === selectedMetric) || METRIC_OPTIONS[0];

  // Sidebar distribution — synced with selected metric
  const sidebarMetricKey = selectedMetric === 'revenueVsSpend' ? 'roas' : selectedMetric;
  const sidebarData: SidebarDataItem[] = useMemo(() => {
    return channelTableData.map((ch, i) => ({
      channel: ch.category,
      value: ch.metrics[sidebarMetricKey as keyof ChannelSourceMetrics] || 0,
      colorIndex: i,
    })).sort((a, b) => b.value - a.value);
  }, [channelTableData, sidebarMetricKey]);

  const sidebarTotal = useMemo(() => {
    if (ADDITIVE_METRICS.has(sidebarMetricKey)) {
      return sidebarData.reduce((s, d) => s + d.value, 0);
    }
    const tr = channelTableData.reduce((s, c) => s + c.metrics.revenue, 0);
    const ts = channelTableData.reduce((s, c) => s + c.metrics.spend, 0);
    const to = channelTableData.reduce((s, c) => s + c.metrics.orders, 0);
    const tc = channelTableData.reduce((s, c) => s + c.metrics.clicks, 0);
    const ti = channelTableData.reduce((s, c) => s + c.metrics.impressions, 0);
    switch (sidebarMetricKey) {
      case 'roas': return ts > 0 ? tr / ts : 0;
      case 'ctr': return ti > 0 ? tc / ti * 100 : 0;
      case 'cac': return to > 0 ? ts / to : 0;
      case 'conversionRate': return tc > 0 ? to / tc * 100 : 0;
      default: return 0;
    }
  }, [sidebarData, channelTableData, sidebarMetricKey]);

  const scatterData: ScatterDataItem[] = useMemo(() => {
    const points: ScatterDataItem[] = [];
    channelTableData.forEach((ch, ci) => {
      ch.sources.forEach(src => {
        points.push({
          channel: `${src.name} (${ch.category})`,
          spend: src.metrics.spend, revenue: src.metrics.revenue,
          orders: src.metrics.orders, color: CHANNEL_COLORS[ci % CHANNEL_COLORS.length],
        });
      });
    });
    return points;
  }, [channelTableData]);

  const maxSpend = useMemo(() => Math.max(...scatterData.map(d => d.spend), 1), [scatterData]);

  const toggleChannel = (category: string) => {
    setExpandedChannels(prev => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  const activeColumns = ALL_TABLE_COLUMNS.filter(c => visibleColumns.has(c.key));
  const isAdditive = ADDITIVE_METRICS.has(sidebarMetricKey);
  const sidebarLabel = selectedMetric === 'revenueVsSpend' ? 'ROAS' : selectedMetricOpt.label;
  const sidebarFormat = selectedMetric === 'revenueVsSpend' ? 'roas' : selectedMetricOpt.format;

  return (
    <div className="space-y-3">
      {/* ── Header: title + filter popover ── */}
      <div className="bg-white rounded-xl border border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              Channel Performance Analysis
              <InfoTip text={TOOLTIPS.title} />
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {formatCurrency(grandTotal)} total revenue across {channelChart.channels.length} channels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FilterPopover filters={filters} onFiltersChange={onFiltersChange} />
            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Main chart card */}
        <div className="col-span-2 bg-white rounded-xl border border-border p-4">
          {/* Title row */}
          <div className="flex items-center justify-between mb-2 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary whitespace-nowrap">Performance Analysis</h3>
              <InfoTip text={TOOLTIPS.performance} />
              <div className="w-px h-4 bg-border-light shrink-0" />
              <MetricDropdown value={selectedMetric} onChange={(key) => {
                setSelectedMetric(key);
                if (key === 'revenueVsSpend') setChartType('scatter');
              }} />
            </div>
            <div className="flex items-center bg-surface-tertiary rounded-lg p-0.5 shrink-0">
              <button onClick={() => setChartType('area')} title="Trend over time"
                className={`p-1.5 rounded-md text-xs transition-colors ${chartType === 'area' ? 'bg-white shadow-sm text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                <TrendingUp className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setChartType('bar')} title="Compare channels"
                className={`p-1.5 rounded-md text-xs transition-colors ${chartType === 'bar' ? 'bg-white shadow-sm text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                <BarChart3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setChartType('scatter')} title="Spend vs Revenue"
                className={`p-1.5 rounded-md text-xs transition-colors ${chartType === 'scatter' ? 'bg-white shadow-sm text-text-primary' : 'text-text-tertiary hover:text-text-secondary'}`}>
                <CircleDot className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* KPI strip — prominent mini-cards */}
          {selectedMetric === 'revenueVsSpend' ? (
            <div className="flex items-stretch gap-3 mb-3">
              <div className="flex-1 bg-surface-secondary/60 rounded-lg px-3 py-2">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Total Revenue</div>
                <div className="text-xl font-bold text-text-primary mt-0.5 leading-tight">
                  {formatCurrency(selectedMetricData.current)}
                </div>
              </div>
              <div className="flex-1 bg-surface-secondary/60 rounded-lg px-3 py-2">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Total Spend</div>
                <div className="text-xl font-bold text-text-primary mt-0.5 leading-tight">
                  {formatCurrency(selectedMetricData.currentSpend ?? 0)}
                </div>
              </div>
              <div className="flex-1 bg-surface-secondary/60 rounded-lg px-3 py-2">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Overall ROAS</div>
                <div className="text-xl font-bold text-text-primary mt-0.5 leading-tight">
                  {formatRoas(selectedMetricData.roas ?? 0)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-stretch gap-3 mb-3">
              <div className="flex-1 bg-surface-secondary/60 rounded-lg px-3 py-2">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Current {selectedMetricOpt.label}</div>
                <div className="text-xl font-bold text-text-primary mt-0.5 leading-tight">
                  {formatMetricValue(selectedMetricData.current, selectedMetricOpt.format)}
                </div>
              </div>
              <div className="flex-1 bg-surface-secondary/60 rounded-lg px-3 py-2">
                <div className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">Change</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {selectedMetricData.change < 0 ? (
                    <>
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <span className="text-xl font-bold text-red-500 leading-tight">{Math.abs(selectedMetricData.change).toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="text-xl font-bold text-green-600 leading-tight">{selectedMetricData.change.toFixed(1)}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Area chart */}
          {chartType === 'area' && (
            <div>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={channelChart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<AreaTooltip />} />
                  {channelChart.channels.map((ch, i) => (
                    <Area key={ch} type="monotone" dataKey={ch} stackId="1" stroke={CHANNEL_COLORS[i]} fill={CHANNEL_COLORS[i]} fillOpacity={0.3} strokeWidth={1.5} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {channelChart.channels.map((ch, i) => (
                  <div key={ch} className="flex items-center gap-1 text-[11px] text-text-secondary">
                    <span className="w-2 h-2 rounded-full" style={{ background: CHANNEL_COLORS[i] }} />
                    {ch}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bar chart */}
          {chartType === 'bar' && (
            <div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="channel" tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 6, 6, 0]}>
                    {barData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {barData.map(d => (
                  <div key={d.channel} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-text-secondary">{d.channel}</span>
                    <span className="font-medium text-text-primary">{formatCurrency(d.revenue)}</span>
                    <span className="text-text-tertiary">({d.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scatter chart */}
          {chartType === 'scatter' && (
            <div>
              <div className="flex items-center gap-4 text-[11px] text-text-secondary mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 border-t-2 border-dashed border-slate-400" />
                  Break-even ({BREAKEVEN_ROAS}x)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 border-t-2 border-dashed border-blue-500" />
                  Target ({PROAS_TARGET}x)
                </span>
                <span className="flex items-center gap-2 ml-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{`<${BREAKEVEN_ROAS}x`}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />{`${BREAKEVEN_ROAS}-${PROAS_TARGET}x`}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />{`>${PROAS_TARGET}x`}</span>
                </span>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" dataKey="spend" name="Spend" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                    label={{ value: 'Total Spend', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis type="number" dataKey="revenue" name="Revenue" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                    label={{ value: 'Total Revenue', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#94a3b8' }} />
                  <ZAxis range={[60, 200]} />
                  <Tooltip content={<ScatterTooltip />} />
                  <ReferenceLine segment={[{ x: 0, y: 0 }, { x: maxSpend * 1.2, y: maxSpend * 1.2 * BREAKEVEN_ROAS }]} stroke="#94a3b8" strokeWidth={2} strokeDasharray="8 4" />
                  <ReferenceLine segment={[{ x: 0, y: 0 }, { x: maxSpend * 1.2, y: maxSpend * 1.2 * PROAS_TARGET }]} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 3" />
                  <Scatter data={scatterData} shape={<RoasDot />} />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-text-tertiary mt-1.5 italic">
                Dots above the grey line hit break-even ({BREAKEVEN_ROAS}x ROAS). Above the blue line means you're beating your {PROAS_TARGET}x target.
              </p>
            </div>
          )}
        </div>

        {/* Distribution sidebar — synced to selected metric */}
        <div className="bg-white rounded-xl border border-border p-4 flex flex-col">
          <div className="flex items-center gap-1.5 mb-3">
            <h3 className="text-sm font-semibold text-text-primary">{sidebarLabel} by Channel</h3>
            <InfoTip text={TOOLTIPS.distribution} />
          </div>
          <div className="space-y-2.5 flex-1">
            {sidebarData.map((item) => {
              const pct = isAdditive && sidebarTotal > 0
                ? ((item.value / sidebarTotal) * 100).toFixed(0)
                : null;
              return (
                <div key={item.channel} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: CHANNEL_COLORS[item.colorIndex] }} />
                    <span className="text-xs text-text-primary">{item.channel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-text-secondary">{formatMetricValue(item.value, sidebarFormat)}</span>
                    {pct !== null && <span className="font-semibold text-text-primary w-7 text-right">{pct}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border-light">
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary font-semibold">
              {isAdditive ? `Total ${sidebarLabel}` : `Avg ${sidebarLabel}`}
            </div>
            <div className="text-lg font-bold text-text-primary mt-0.5">
              {formatMetricValue(sidebarTotal, sidebarFormat)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Channel Breakdown Table ── */}
      <div className="bg-white rounded-xl border border-border">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-primary">Channel Breakdown</h3>
            <InfoTip text={TOOLTIPS.breakdown} />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showTrends}
                onChange={() => setShowTrends(!showTrends)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500/20"
              />
              Show trends
            </label>
            <ColumnPicker visibleColumns={visibleColumns} onChange={setVisibleColumns} />
            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-border-light">
                <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary w-36">Category</th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary w-28">Source</th>
                {activeColumns.map(col => (
                  <th key={col.key} className="text-right px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                    <div className="flex items-center justify-end gap-1">
                      {col.label}
                      <InfoTip text={col.tip} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            {channelTableData.map((channel) => {
              const isExpanded = expandedChannels.has(channel.category);
              return (
                <tbody key={channel.category}>
                  <tr
                    className="border-b border-border-light hover:bg-surface-secondary/50 cursor-pointer transition-colors"
                    onClick={() => toggleChannel(channel.category)}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {channel.sources.length > 0 ? (
                          isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                            : <ChevronRight className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                        ) : <span className="w-3.5" />}
                        <span className="font-medium text-text-primary text-sm">{channel.category}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-text-tertiary text-xs">–</td>
                    {activeColumns.map(col => (
                      <td key={col.key} className="px-3 py-1.5">
                        <MetricCell
                          value={channel.metrics[col.key as keyof ChannelSourceMetrics]}
                          change={channel.changes[col.key]}
                          sparklineData={channel.sparklines[col.key]}
                          format={col.format}
                          showTrends={showTrends}
                        />
                      </td>
                    ))}
                  </tr>
                  {isExpanded && channel.sources.map((source) => (
                    <tr key={source.name} className="border-b border-border-light bg-surface-secondary/30 hover:bg-surface-secondary/60 transition-colors">
                      <td className="px-4 py-2.5"><div className="pl-5" /></td>
                      <td className="px-3 py-2.5 font-medium text-text-primary text-sm">{source.name}</td>
                      {activeColumns.map(col => (
                        <td key={col.key} className="px-3 py-1.5">
                          <MetricCell
                            value={source.metrics[col.key as keyof ChannelSourceMetrics]}
                            change={source.changes[col.key]}
                            sparklineData={source.sparklines[col.key]}
                            format={col.format}
                            showTrends={showTrends}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
}
