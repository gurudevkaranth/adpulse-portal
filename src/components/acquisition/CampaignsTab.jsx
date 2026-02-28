import { useState, useMemo } from 'react';
import { Download, Info } from 'lucide-react';
import { formatCurrency, formatPercent, formatNumber, formatRoas } from '../../utils/formatters';
import { generateSparklineData } from '../../data/mockData';
import ExpandableDataTable from '../shared/ExpandableDataTable';
import AdDetailPanel from '../shared/AdDetailPanel';
import GradeBadge from '../shared/GradeBadge';
import GradeLegend from '../shared/GradeLegend';
import TabFilters from '../shared/TabFilters';
import ScoreRing from '../shared/ScoreRing';
import Sparkline from '../shared/Sparkline';

function getRowBucket(row) {
  const g = row.grades?.overall || row.grade;
  if (g === 'A') return 'winners';
  if (g === 'B') return 'bau';
  return 'iteration';
}

function getColumns(sparklines) {
  return [
    {
      key: 'name', label: 'Campaign / Ad Name', sortable: true,
      render: (v, row) => {
        if (row.type === 'campaign' || row.type === 'adSet') return v;
        // Leaf ad rows — show thumbnail + platform info
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
      render: (_, row) => row.grades ? <GradeBadge grade={row.grades.overall} /> : <GradeBadge score={row.overallScore} />,
    },
    {
      key: 'health', label: 'Health', align: 'center',
      render: (_, row) => {
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
    {
      key: 'metrics.spend', label: 'Spend', align: 'right', sortable: true,
      render: (v) => <span className="text-text-primary">{formatCurrency(v || 0)}</span>,
    },
    {
      key: 'metrics.revenue', label: 'Revenue', align: 'right', sortable: true,
      render: (v) => <span className="text-text-primary">{formatCurrency(v || 0)}</span>,
    },
    {
      key: 'metrics.roas', label: 'ROAS', align: 'right', sortable: true,
      render: (v) => <span className="font-semibold text-text-primary">{formatRoas(v || 0)}</span>,
    },
    {
      key: 'metrics.ctr', label: 'CTR', align: 'right',
      render: (v, row) => <span className="text-text-primary">{formatPercent(v || row.metrics?.ctr || 0)}</span>,
    },
    {
      key: 'metrics.cpa', label: 'CPA', align: 'right',
      render: (_, row) => {
        const m = row.metrics;
        if (!m) return '—';
        const cpa = m.cpa || (m.conversions > 0 ? m.spend / m.conversions : 0);
        return <span className="text-text-primary">{formatCurrency(cpa)}</span>;
      },
    },
    {
      key: 'metrics.conversions', label: 'Conv', align: 'right',
      render: (v) => <span className="text-text-primary">{formatNumber(v || 0)}</span>,
    },
    {
      key: 'sparkline', label: 'Trend', align: 'center',
      render: (_, row) => {
        if (!row.sparklineData && !sparklines[row.id]) return null;
        const data = row.sparklineData || sparklines[row.id];
        const trend = row.status === 'Scaling' ? 'positive' : row.status === 'Declining' ? 'negative' : 'neutral';
        return <Sparkline data={data} trend={trend} width={60} height={22} />;
      },
    },
  ];
}

export default function CampaignsTab({ data }) {
  const [activeBucket, setActiveBucket] = useState('all');
  const [selectedAd, setSelectedAd] = useState(null);

  const filteredData = activeBucket === 'all' ? data : data.filter(row => getRowBucket(row) === activeBucket);

  const bucketCounts = useMemo(() => {
    const counts = { winners: 0, bau: 0, iteration: 0 };
    data.forEach(row => { counts[getRowBucket(row)]++; });
    return counts;
  }, [data]);

  // Generate sparklines for leaf ad rows
  const sparklines = useMemo(() => {
    const map = {};
    data.forEach(camp => {
      map[camp.id] = generateSparklineData(14);
      (camp.children || []).forEach(adSet => {
        map[adSet.id] = generateSparklineData(14);
        (adSet.children || []).forEach(ad => {
          if (!ad.sparklineData) map[ad.id] = generateSparklineData(14);
        });
      });
    });
    return map;
  }, [data]);

  const columns = useMemo(() => getColumns(sparklines), [sparklines]);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            Campaign Performance Analysis
            <Info className="w-4 h-4 text-text-tertiary" />
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">{filteredData.length} campaigns</p>
        </div>
        <GradeLegend />
      </div>

      <div className="flex items-center justify-between">
        <TabFilters
          tabs={[
            { key: 'winners', label: 'Winners', count: bucketCounts.winners },
            { key: 'bau', label: 'BAU', count: bucketCounts.bau },
            { key: 'iteration', label: 'Iteration Needed', count: bucketCounts.iteration },
            { key: 'all', label: 'All', count: data.length },
          ]}
          activeTab={activeBucket}
          onChange={setActiveBucket}
        />
        <button className="p-2 hover:bg-gray-100 rounded-lg text-text-tertiary hover:text-text-primary transition-colors">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <ExpandableDataTable
        columns={columns}
        data={filteredData}
        onRowClick={(row) => { if (!row.children) setSelectedAd(row); }}
      />

      {selectedAd && <AdDetailPanel ad={selectedAd} onClose={() => setSelectedAd(null)} />}
    </>
  );
}
