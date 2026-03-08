import { useMemo, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ArrowUpDown, Download } from 'lucide-react';
import { generateAds, generateSparklineData } from '../data/mockData';
import { formatCurrency, formatNumber, formatPercent, formatRoas, getStatusColor, scoreToGrade } from '../utils/formatters';
import AdThumbnail from '../components/shared/AdThumbnail';
import ScoreRing from '../components/shared/ScoreRing';
import TagBadge from '../components/shared/TagBadge';
import GradeBadge from '../components/shared/GradeBadge';
import TabFilters from '../components/shared/TabFilters';
import ViewToggle from '../components/shared/ViewToggle';
import Sparkline from '../components/shared/Sparkline';
import AdDetailPanel from '../components/shared/AdDetailPanel';
import type { Ad, SparklineDataPoint } from '../types';

interface OutletContext {
  filters: Record<string, string>;
  setFilters: (filters: Record<string, string>) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

interface AdWithSparkline extends Ad {
  sparkline: SparklineDataPoint[];
}

const SORT_OPTIONS = [
  { value: 'overallScore', label: 'Overall Score' },
  { value: 'metrics.roas', label: 'ROAS' },
  { value: 'metrics.spend', label: 'Spend' },
  { value: 'metrics.ctr', label: 'CTR' },
  { value: 'metrics.conversions', label: 'Conversions' },
  { value: 'metrics.cpa', label: 'CPA' },
];

const FORMAT_FILTERS = ['All', 'Video', 'Image', 'Carousel', 'UGC', 'Story'];

function getNestedValue(obj: Record<string, unknown>, path: string): number {
  return path.split('.').reduce((o: any, k: string) => (o ? o[k] : undefined), obj) as number;
}

function getBucket(ad: Ad): string {
  if (ad.overallScore >= 80) return 'Winners';
  if (ad.overallScore >= 50) return 'BAU';
  return 'Iteration Needed';
}

export default function CreativeLibrary() {
  const { filters } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<string>('grid');
  const [sortBy, setSortBy] = useState<string>('overallScore');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [activeBucket, setActiveBucket] = useState<string>('All');
  const [formatFilter, setFormatFilter] = useState<string>('All');
  const [selectedAd, setSelectedAd] = useState<AdWithSparkline | null>(null);

  const allAds = useMemo((): AdWithSparkline[] => {
    const ads = generateAds(30) as Ad[];
    return ads.map(ad => ({ ...ad, sparkline: generateSparklineData(14) as SparklineDataPoint[] }));
  }, []);

  const filteredAds = useMemo(() => {
    let result = [...allAds];
    if (activeBucket !== 'All') result = result.filter(a => getBucket(a) === activeBucket);
    if (formatFilter !== 'All') result = result.filter(a => a.format === formatFilter);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.campaign.toLowerCase().includes(q) ||
        a.tags.hook.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = getNestedValue(a as unknown as Record<string, unknown>, sortBy);
      const bVal = getNestedValue(b as unknown as Record<string, unknown>, sortBy);
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [allAds, activeBucket, formatFilter, filters, sortBy, sortDir]);

  // Compute bucket counts from full list (before bucket filter)
  const bucketCounts = useMemo(() => {
    let base = [...allAds];
    if (formatFilter !== 'All') base = base.filter(a => a.format === formatFilter);
    return {
      Winners: base.filter(a => getBucket(a) === 'Winners').length,
      BAU: base.filter(a => getBucket(a) === 'BAU').length,
      'Iteration Needed': base.filter(a => getBucket(a) === 'Iteration Needed').length,
      All: base.length,
    };
  }, [allAds, formatFilter]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
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
          <div className="flex items-center gap-3">
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

            <button className="p-2 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors" title="Download">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Format filter pills */}
        <div className="flex items-center gap-1">
          {FORMAT_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFormatFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                formatFilter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
          <span className="ml-2 text-xs text-text-tertiary">{filteredAds.length} creatives</span>
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
                {/* Name & status */}
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-text-primary truncate">{ad.name}</div>
                    <div className="text-[11px] text-text-tertiary truncate">{ad.campaign}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2 ${getStatusColor(ad.status)}`}>
                    {ad.status}
                  </span>
                </div>

                {/* Score rings */}
                <div className="flex items-center justify-between py-3 border-y border-border-light">
                  <ScoreRing score={ad.scores.hookScore} size={40} strokeWidth={3} label="Hook" />
                  <ScoreRing score={ad.scores.watchScore} size={40} strokeWidth={3} label="Watch" />
                  <ScoreRing score={ad.scores.clickScore} size={40} strokeWidth={3} label="Click" />
                  <ScoreRing score={ad.scores.convertScore} size={40} strokeWidth={3} label="Convert" />
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Spend</span>
                    <span className="font-medium text-text-primary">{formatCurrency(ad.metrics.spend)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">ROAS</span>
                    <span className="font-medium text-text-primary">{formatRoas(ad.metrics.roas)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">CTR</span>
                    <span className="font-medium text-text-primary">{formatPercent(ad.metrics.ctr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">CPA</span>
                    <span className="font-medium text-text-primary">{formatCurrency(ad.metrics.cpa)}</span>
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Creative</th>
                <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Platform</th>
                <th className="text-left text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-center text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Grade</th>
                <th className="text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Spend</th>
                <th className="text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Revenue</th>
                <th className="text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">ROAS</th>
                <th className="text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">CTR</th>
                <th className="text-center text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Trend</th>
                <th className="text-right text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-4 py-3">Conv</th>
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
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatCurrency(ad.metrics.spend)}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatCurrency(ad.metrics.revenue)}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatRoas(ad.metrics.roas)}</td>
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatPercent(ad.metrics.ctr)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <Sparkline data={ad.sparkline} width={60} height={24} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-right font-medium">{formatNumber(ad.metrics.conversions)}</td>
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
