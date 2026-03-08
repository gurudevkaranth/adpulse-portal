import { useState, useMemo, useRef, useEffect } from 'react';
import { Download, Info, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber, formatRoas } from '../../utils/formatters';
import { generateSparklineData } from '../../data/mockData';
import ExpandableDataTable from '../shared/ExpandableDataTable';
import AdDetailPanel from '../shared/AdDetailPanel';
import GradeBadge from '../shared/GradeBadge';
import GradeLegend from '../shared/GradeLegend';
import TabFilters from '../shared/TabFilters';
import ScoreRing from '../shared/ScoreRing';
import Sparkline from '../shared/Sparkline';
import type { Ad, Campaign, Grade, SparklineDataPoint } from '../../types';

/* ── Local types ─────────────────────────────────── */

interface Filters {
  [key: string]: string;
}

interface AdSetsTabProps {
  campaigns: Campaign[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

interface FilterConfig {
  key: string;
  label: string;
  options: string[];
}

interface MetricColumn {
  key: string;
  label: string;
  defaultVisible: boolean;
  tip: string;
}

interface TableRow {
  id: string;
  name: string;
  type?: string;
  children?: TableRow[];
  thumbnail?: string;
  platform?: string;
  format?: string;
  grades?: { overall: Grade };
  grade?: Grade;
  overallScore?: number;
  scores?: {
    hookScore: number;
    watchScore: number;
    clickScore: number;
    convertScore: number;
    reachScore: number;
    signalsScore: number;
  };
  metrics?: Record<string, number>;
  status?: string;
  sparklineData?: SparklineDataPoint[];
  [key: string]: unknown;
}

/* ── Small UI helpers ────────────────────────────── */

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

interface ColumnPickerProps {
  columns: MetricColumn[];
  visibleColumns: Set<string>;
  onChange: (columns: Set<string>) => void;
}

function ColumnPicker({ columns, visibleColumns, onChange }: ColumnPickerProps) {
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
          {columns.map(col => (
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

/* ── Filter Popover ──────────────────────────────── */

const FILTER_CONFIGS: FilterConfig[] = [
  { key: 'attribution', label: 'Attribution Model', options: ['Platform data-driven', 'Last Click', 'First Click', 'Linear', 'Time Decay'] },
  { key: 'channels', label: 'Channels', options: ['All Channels', 'Paid Ads', 'Organic', 'Email Marketing', 'Direct', 'Referrals'] },
  { key: 'creativeTypes', label: 'Creative Types', options: ['All Creative Types', 'Video', 'Image', 'UGC', 'Carousel', 'Story'] },
  { key: 'status', label: 'Status', options: ['All Status', 'Active', 'Paused', 'Scaling', 'Declining', 'Testing'] },
];

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
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-white hover:bg-gray-50 text-xs text-text-secondary transition-colors"
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

/* ── Column definitions ──────────────────────────── */

const METRIC_COLUMNS: MetricColumn[] = [
  { key: 'metrics.spend', label: 'Spend', defaultVisible: true, tip: 'Total ad spend for the selected period' },
  { key: 'metrics.revenue', label: 'Revenue', defaultVisible: true, tip: 'Total revenue attributed to this ad set' },
  { key: 'metrics.roas', label: 'ROAS', defaultVisible: true, tip: 'Return on Ad Spend — revenue earned per dollar spent' },
  { key: 'metrics.ctr', label: 'CTR', defaultVisible: false, tip: 'Click-through rate — % of viewers who clicked' },
  { key: 'metrics.cpa', label: 'CPA', defaultVisible: true, tip: 'Cost per acquisition — cost per conversion' },
  { key: 'metrics.conversions', label: 'Conv', defaultVisible: true, tip: 'Total conversions' },
];

const DEFAULT_VISIBLE = new Set(METRIC_COLUMNS.filter(c => c.defaultVisible).map(c => c.key));

/* ── Helpers ──────────────────────────────────────── */

function getRowBucket(row: TableRow): string {
  const g = row.grades?.overall || row.grade;
  if (g === 'A') return 'winners';
  if (g === 'B') return 'bau';
  return 'iteration';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildColumns(sparklines: Record<string, SparklineDataPoint[]>, showTrends: boolean, visibleColumns: Set<string>): any[] {
  const cols: any[] = [
    {
      key: 'name', label: 'Ad Set / Ad Name', sortable: true,
      render: (v: string, row: TableRow) => {
        if (row.type === 'adSet') return v;
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: row.thumbnail }} />
            <div className="min-w-0">
              <div className="text-sm font-medium text-text-primary truncate">{v}</div>
              <div className="text-[10px] text-text-tertiary">{row.platform} &middot; {row.format}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'grades.overall', label: 'Grade', align: 'center', info: 'Weighted performance grade',
      render: (_: unknown, row: TableRow) => row.grades ? <GradeBadge grade={row.grades.overall} /> : <GradeBadge score={row.overallScore} />,
    },
    {
      key: 'health', label: 'Health', align: 'center', info: 'Hook · Watch · Click · Convert · Reach · Signals',
      render: (_: unknown, row: TableRow) => {
        if (!row.scores) return null;
        return (
          <div className="flex items-center justify-center gap-0.5">
            <ScoreRing score={row.scores.hookScore} size={22} strokeWidth={2} />
            <ScoreRing score={row.scores.watchScore} size={22} strokeWidth={2} />
            <ScoreRing score={row.scores.clickScore} size={22} strokeWidth={2} />
            <ScoreRing score={row.scores.convertScore} size={22} strokeWidth={2} />
            <ScoreRing score={row.scores.reachScore} size={22} strokeWidth={2} />
            <ScoreRing score={row.scores.signalsScore} size={22} strokeWidth={2} />
          </div>
        );
      },
    },
  ];

  METRIC_COLUMNS.forEach(mc => {
    if (!visibleColumns.has(mc.key)) return;
    const col: any = { key: mc.key, label: mc.label, align: 'right', info: mc.tip };
    switch (mc.key) {
      case 'metrics.spend':
        col.sortable = true;
        col.render = (v: number) => <span className="text-text-primary">{formatCurrency(v || 0)}</span>;
        break;
      case 'metrics.revenue':
        col.sortable = true;
        col.render = (v: number) => <span className="text-text-primary">{formatCurrency(v || 0)}</span>;
        break;
      case 'metrics.roas':
        col.sortable = true;
        col.render = (v: number) => <span className="font-semibold text-text-primary">{formatRoas(v || 0)}</span>;
        break;
      case 'metrics.ctr':
        col.render = (v: number, row: TableRow) => <span className="text-text-primary">{formatPercent(v || row.metrics?.ctr || 0)}</span>;
        break;
      case 'metrics.cpa':
        col.render = (_: unknown, row: TableRow) => {
          const m = row.metrics;
          if (!m) return '—';
          const cpa = m.cpa || (m.conversions > 0 ? m.spend / m.conversions : 0);
          return <span className="text-text-primary">{formatCurrency(cpa)}</span>;
        };
        break;
      case 'metrics.conversions':
        col.render = (v: number) => <span className="text-text-primary">{formatNumber(v || 0)}</span>;
        break;
    }
    cols.push(col);
  });

  if (showTrends) {
    cols.push({
      key: 'sparkline', label: 'Trend', align: 'center', info: '14-day performance trend',
      render: (_: unknown, row: TableRow) => {
        if (!row.sparklineData && !sparklines[row.id]) return null;
        const data = row.sparklineData || sparklines[row.id];
        const trend = row.status === 'Scaling' ? 'positive' : row.status === 'Declining' ? 'negative' : 'neutral';
        return <Sparkline data={data} trend={trend} width={60} height={22} />;
      },
    });
  }

  return cols;
}

/* ── Main component ──────────────────────────────── */

export default function AdSetsTab({ campaigns, filters, onFiltersChange }: AdSetsTabProps) {
  const [activeBucket, setActiveBucket] = useState<string>('all');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(DEFAULT_VISIBLE);
  const [showTrends, setShowTrends] = useState<boolean>(false);

  const adSets = useMemo(() => campaigns.flatMap(c => c.children || []), [campaigns]);
  const filteredData = activeBucket === 'all' ? adSets : adSets.filter(row => getRowBucket(row as unknown as TableRow) === activeBucket);

  const bucketCounts = useMemo(() => {
    const counts: Record<string, number> = { winners: 0, bau: 0, iteration: 0 };
    adSets.forEach(row => { counts[getRowBucket(row as unknown as TableRow)]++; });
    return counts;
  }, [adSets]);

  const sparklines = useMemo(() => {
    const map: Record<string, SparklineDataPoint[]> = {};
    adSets.forEach(adSet => {
      map[adSet.id] = generateSparklineData(14);
      (adSet.children || []).forEach(ad => {
        if (!(ad as unknown as TableRow).sparklineData) map[ad.id] = generateSparklineData(14);
      });
    });
    return map;
  }, [adSets]);

  const columns = useMemo(() => buildColumns(sparklines, showTrends, visibleColumns), [sparklines, showTrends, visibleColumns]);

  return (
    <>
      <div className="bg-white rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              Ad Set Performance Analysis
              <InfoTip text="Drill into ad set → ad performance. Click any row to expand." />
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">{filteredData.length} ad sets</p>
          </div>
          <div className="flex items-center gap-2">
            <GradeLegend />
            <FilterPopover filters={filters} onFiltersChange={onFiltersChange} />
          </div>
        </div>

        <TabFilters
          tabs={[
            { key: 'winners', label: 'Winners', count: bucketCounts.winners },
            { key: 'bau', label: 'BAU', count: bucketCounts.bau },
            { key: 'iteration', label: 'Iteration Needed', count: bucketCounts.iteration },
            { key: 'all', label: 'All', count: adSets.length },
          ]}
          activeTab={activeBucket}
          onChange={setActiveBucket}
        />
      </div>

      <ExpandableDataTable
        columns={columns}
        data={filteredData as any}
        onRowClick={(row) => { if (!(row as any).children) setSelectedAd(row as unknown as Ad); }}
        title="Ad Set Breakdown"
        headerRight={
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
            <ColumnPicker columns={METRIC_COLUMNS} visibleColumns={visibleColumns} onChange={setVisibleColumns} />
          </div>
        }
      />

      {selectedAd && <AdDetailPanel ad={selectedAd} onClose={() => setSelectedAd(null)} />}
    </>
  );
}
