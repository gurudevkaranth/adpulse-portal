import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Download, Eye, Clock, MousePointerClick, ShoppingCart, Megaphone, Activity, Info, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas, getStatusColor } from '../../utils/formatters';
import { generateSparklineData } from '../../data/mockData';
import AdThumbnail from '../shared/AdThumbnail';
import ScoreRing from '../shared/ScoreRing';
import TagBadge from '../shared/TagBadge';
import GradeBadge from '../shared/GradeBadge';
import TabFilters from '../shared/TabFilters';
import ViewToggle from '../shared/ViewToggle';
import Sparkline from '../shared/Sparkline';
import AdDetailPanel from '../shared/AdDetailPanel';
import type { Ad, SparklineDataPoint } from '../../types';

/* ── Local types ─────────────────────────────────── */

interface Filters {
  [key: string]: string;
}

interface CreativesTabProps {
  ads: Ad[];
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

interface AdWithSparkline extends Ad {
  sparkline: SparklineDataPoint[];
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

/* ── Constants ───────────────────────────────────── */

const SORT_OPTIONS = [
  { value: 'overallScore', label: 'Overall Score' },
  { value: 'metrics.roas', label: 'ROAS' },
  { value: 'metrics.spend', label: 'Spend' },
  { value: 'metrics.ctr', label: 'CTR' },
  { value: 'metrics.conversions', label: 'Conversions' },
  { value: 'metrics.cpa', label: 'CPA' },
];

const SCORE_DIMENSIONS = [
  { key: 'hookScore' as const, label: 'Hook', icon: Eye },
  { key: 'watchScore' as const, label: 'Watch', icon: Clock },
  { key: 'clickScore' as const, label: 'Click', icon: MousePointerClick },
  { key: 'convertScore' as const, label: 'Convert', icon: ShoppingCart },
  { key: 'reachScore' as const, label: 'Reach', icon: Megaphone },
  { key: 'signalsScore' as const, label: 'Signals', icon: Activity },
];

const LIST_METRIC_COLUMNS: MetricColumn[] = [
  { key: 'spend', label: 'Spend', defaultVisible: true, tip: 'Total ad spend for the selected period' },
  { key: 'revenue', label: 'Revenue', defaultVisible: true, tip: 'Total revenue attributed to this creative' },
  { key: 'roas', label: 'ROAS', defaultVisible: true, tip: 'Return on Ad Spend — revenue earned per dollar spent' },
  { key: 'ctr', label: 'CTR', defaultVisible: false, tip: 'Click-through rate — % of viewers who clicked' },
  { key: 'conversions', label: 'Conv', defaultVisible: true, tip: 'Total conversions' },
];

const DEFAULT_VISIBLE_LIST = new Set(LIST_METRIC_COLUMNS.filter(c => c.defaultVisible).map(c => c.key));

/* ── Helpers ─────────────────────────────────────── */

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((o: unknown, k: string) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function getBucket(ad: Ad): string {
  if (ad.overallScore >= 80) return 'Winners';
  if (ad.overallScore >= 50) return 'BAU';
  return 'Iteration Needed';
}

/* ── Main component ──────────────────────────────── */

export default function CreativesTab({ ads, filters, onFiltersChange }: CreativesTabProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<string>('grid');
  const [sortBy, setSortBy] = useState<string>('overallScore');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [activeBucket, setActiveBucket] = useState<string>('All');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(DEFAULT_VISIBLE_LIST);
  const [showTrends, setShowTrends] = useState<boolean>(false);

  const allAds: AdWithSparkline[] = useMemo(() => {
    return ads.map(ad => ({ ...ad, sparkline: generateSparklineData(14) }));
  }, [ads]);

  const filteredAds = useMemo(() => {
    let result = [...allAds];
    if (activeBucket !== 'All') result = result.filter(a => getBucket(a) === activeBucket);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.campaign.toLowerCase().includes(q) ||
        a.tags.hook.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = getNestedValue(a as unknown as Record<string, unknown>, sortBy) as number;
      const bVal = getNestedValue(b as unknown as Record<string, unknown>, sortBy) as number;
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [allAds, activeBucket, filters, sortBy, sortDir]);

  const bucketCounts = useMemo(() => ({
    Winners: allAds.filter(a => getBucket(a) === 'Winners').length,
    BAU: allAds.filter(a => getBucket(a) === 'BAU').length,
    'Iteration Needed': allAds.filter(a => getBucket(a) === 'Iteration Needed').length,
    All: allAds.length,
  }), [allAds]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base font-semibold text-text-primary whitespace-nowrap">Creative Performance</h2>
            <InfoTip text="Browse all creatives. Grid cards navigate to detail; list rows open slide-out." />
          </div>
          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-4 h-4 text-text-tertiary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-transparent border-0 text-text-secondary focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                className="text-[10px] text-text-tertiary hover:text-text-primary"
              >
                {sortDir === 'desc' ? 'DESC' : 'ASC'}
              </button>
            </div>

            <ViewToggle mode={viewMode} onChange={setViewMode} />
            <FilterPopover filters={filters} onFiltersChange={onFiltersChange} />

            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors" title="Download">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <TabFilters
            tabs={[
              { key: 'Winners', label: 'Winners', count: bucketCounts.Winners },
              { key: 'BAU', label: 'BAU', count: bucketCounts.BAU },
              { key: 'Iteration Needed', label: 'Iteration Needed', count: bucketCounts['Iteration Needed'] },
              { key: 'All', label: 'All', count: bucketCounts.All },
            ]}
            activeTab={activeBucket}
            onChange={setActiveBucket}
          />
          <span className="text-xs text-text-tertiary">{filteredAds.length} creatives</span>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-4 gap-4">
          {filteredAds.map((ad) => (
            <div
              key={ad.id}
              onClick={() => navigate(`/creatives/${ad.id}`)}
              className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer group"
            >
              <AdThumbnail ad={ad} size="md" />
              <div className="p-4">
                {/* Name, grade & status */}
                <div className="flex items-start gap-2.5 mb-3">
                  <GradeBadge score={ad.overallScore} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-text-primary truncate">{ad.name}</div>
                    <div className="text-[11px] text-text-tertiary truncate">{ad.campaign}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${getStatusColor(ad.status)}`}>
                    {ad.status}
                  </span>
                </div>

                {/* 3 key metrics */}
                <div className="grid grid-cols-3 gap-3 py-3 border-t border-border-light">
                  <div className="text-center">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">Spend</div>
                    <div className="text-sm font-semibold text-text-primary">{formatCurrency(ad.metrics.spend)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">ROAS</div>
                    <div className="text-sm font-semibold text-text-primary">{formatRoas(ad.metrics.roas)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-text-tertiary uppercase tracking-wider mb-0.5">Revenue</div>
                    <div className="text-sm font-semibold text-text-primary">{formatCurrency(ad.metrics.revenue)}</div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  <TagBadge type="hook" value={ad.tags.hook} />
                  <TagBadge type="visual" value={ad.tags.visual} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <h3 className="text-sm font-semibold text-text-primary">Creative Breakdown</h3>
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
              <ColumnPicker columns={LIST_METRIC_COLUMNS} visibleColumns={visibleColumns} onChange={setVisibleColumns} />
              <button className="p-1.5 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Creative</th>
                <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Platform</th>
                <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-center text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    Grade
                    <InfoTip text="Weighted performance grade" />
                  </div>
                </th>
                <th className="text-center text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-2 py-3">
                  <div className="flex items-center justify-center gap-1">
                    Health
                    <InfoTip text="Hook · Watch · Click · Convert · Reach · Signals" />
                  </div>
                </th>
                {LIST_METRIC_COLUMNS.filter(c => visibleColumns.has(c.key)).map(col => (
                  <th key={col.key} className="text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {col.label}
                      <InfoTip text={col.tip} />
                    </div>
                  </th>
                ))}
                {showTrends && (
                  <th className="text-center text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      Trend
                      <InfoTip text="14-day performance trend" />
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAds.map((ad) => (
                <tr
                  key={ad.id}
                  onClick={() => setSelectedAd(ad)}
                  className="border-b border-border-light hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg shrink-0" style={{ background: ad.thumbnail }} />
                      <div>
                        <div className="text-sm font-medium text-text-primary">{ad.name}</div>
                        <div className="text-[11px] text-text-tertiary">{ad.campaign}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{ad.platform}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(ad.status)}`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <GradeBadge score={ad.overallScore} />
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {SCORE_DIMENSIONS.map(dim => (
                        <ScoreRing key={dim.key} score={ad.scores[dim.key]} size={24} strokeWidth={2} />
                      ))}
                    </div>
                  </td>
                  {LIST_METRIC_COLUMNS.filter(c => visibleColumns.has(c.key)).map(col => (
                    <td key={col.key} className="px-4 py-3 text-xs text-right font-medium">
                      {col.key === 'spend' && formatCurrency(ad.metrics.spend)}
                      {col.key === 'revenue' && formatCurrency(ad.metrics.revenue)}
                      {col.key === 'roas' && formatRoas(ad.metrics.roas)}
                      {col.key === 'ctr' && formatPercent(ad.metrics.ctr)}
                      {col.key === 'conversions' && formatNumber(ad.metrics.conversions)}
                    </td>
                  ))}
                  {showTrends && (
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <Sparkline data={ad.sparkline} width={60} height={24} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ad Detail Slide-out Panel */}
      {selectedAd && (
        <AdDetailPanel ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
    </div>
  );
}
