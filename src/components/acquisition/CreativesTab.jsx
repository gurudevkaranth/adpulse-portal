import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, Download, Eye, Clock, MousePointerClick, ShoppingCart, Megaphone, Activity } from 'lucide-react';
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

const SORT_OPTIONS = [
  { value: 'overallScore', label: 'Overall Score' },
  { value: 'metrics.roas', label: 'ROAS' },
  { value: 'metrics.spend', label: 'Spend' },
  { value: 'metrics.ctr', label: 'CTR' },
  { value: 'metrics.conversions', label: 'Conversions' },
  { value: 'metrics.cpa', label: 'CPA' },
];

const FORMAT_FILTERS = ['All', 'Video', 'Image', 'Carousel', 'UGC', 'Story'];

const SCORE_DIMENSIONS = [
  { key: 'hookScore', label: 'Hook', icon: Eye },
  { key: 'watchScore', label: 'Watch', icon: Clock },
  { key: 'clickScore', label: 'Click', icon: MousePointerClick },
  { key: 'convertScore', label: 'Convert', icon: ShoppingCart },
  { key: 'reachScore', label: 'Reach', icon: Megaphone },
  { key: 'signalsScore', label: 'Signals', icon: Activity },
];

function getNestedValue(obj, path) {
  return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

function getBucket(ad) {
  if (ad.overallScore >= 80) return 'Winners';
  if (ad.overallScore >= 50) return 'BAU';
  return 'Iteration Needed';
}

export default function CreativesTab({ ads, filters }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('overallScore');
  const [sortDir, setSortDir] = useState('desc');
  const [activeBucket, setActiveBucket] = useState('All');
  const [formatFilter, setFormatFilter] = useState('All');
  const [selectedAd, setSelectedAd] = useState(null);

  const allAds = useMemo(() => {
    return ads.map(ad => ({ ...ad, sparkline: generateSparklineData(14) }));
  }, [ads]);

  const filteredAds = useMemo(() => {
    let result = [...allAds];
    if (activeBucket !== 'All') result = result.filter(a => getBucket(a) === activeBucket);
    if (formatFilter !== 'All') result = result.filter(a => a.format === formatFilter);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.campaign.toLowerCase().includes(q) ||
        a.tags.hook.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = getNestedValue(a, sortBy);
      const bVal = getNestedValue(b, sortBy);
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return result;
  }, [allAds, activeBucket, formatFilter, filters, sortBy, sortDir]);

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

                {/* 6-element Health score rings */}
                <div className="grid grid-cols-6 gap-1 py-3 border-y border-border-light">
                  {SCORE_DIMENSIONS.map(dim => (
                    <ScoreRing key={dim.key} score={ad.scores[dim.key]} size={36} strokeWidth={3} label={dim.label} />
                  ))}
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-x-3 gap-y-1 mt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Spend</span>
                    <span className="font-medium text-text-primary">{formatCurrency(ad.metrics.spend)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Revenue</span>
                    <span className="font-medium text-text-primary">{formatCurrency(ad.metrics.revenue)}</span>
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
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Conv</span>
                    <span className="font-medium text-text-primary">{formatNumber(ad.metrics.conversions)}</span>
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
                <th className="text-center text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-2 py-3">Health</th>
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
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {SCORE_DIMENSIONS.map(dim => (
                        <ScoreRing key={dim.key} score={ad.scores[dim.key]} size={24} strokeWidth={2} />
                      ))}
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
