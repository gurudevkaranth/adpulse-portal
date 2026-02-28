import { Link } from 'react-router-dom';
import { X, ExternalLink } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent, formatRoas, getStatusColor, timeAgo } from '../../utils/formatters';
import GradeBadge from './GradeBadge';
import ScoreRing from './ScoreRing';
import TagBadge from './TagBadge';

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  );
}

function KeyValueRow({ label, value, children }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border-light last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      {children || <span className="text-sm font-medium text-text-primary">{value}</span>}
    </div>
  );
}

export default function AdDetailPanel({ ad, onClose }) {
  if (!ad) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[400px] bg-white border-l border-border z-50 overflow-y-auto shadow-xl slide-panel">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white z-10">
          <div className="min-w-0 flex-1 mr-3">
            <h3 className="text-sm font-semibold text-text-primary truncate">{ad.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(ad.status)}`}>
                {ad.status}
              </span>
              <span className="text-[10px] text-text-tertiary">{ad.platform} &middot; {ad.format}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>

        {/* Preview */}
        <div className="w-full aspect-video relative" style={{ background: ad.thumbnail }}>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white font-medium">
            {ad.format}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(ad.tags || {}).map(([type, value]) => (
              <TagBadge key={type} type={type} value={value} />
            ))}
          </div>

          {/* Quick Scores */}
          <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 rounded-lg">
            {[
              { label: 'Hook', score: ad.scores?.hookScore },
              { label: 'Watch', score: ad.scores?.watchScore },
              { label: 'Click', score: ad.scores?.clickScore },
              { label: 'Conv', score: ad.scores?.convertScore },
              { label: 'Reach', score: ad.scores?.reachScore },
              { label: 'Signals', score: ad.scores?.signalsScore },
            ].map(s => (
              <div key={s.label} className="text-center">
                <ScoreRing score={s.score || 0} size={32} strokeWidth={3} />
                <div className="text-[9px] text-text-tertiary mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Basic Information */}
          <Section title="Basic Information">
            <KeyValueRow label="Ad Name" value={ad.name} />
            <KeyValueRow label="Campaign" value={ad.campaign} />
            <KeyValueRow label="Ad Set" value={ad.adSet} />
            <KeyValueRow label="Platform" value={ad.platform} />
            <KeyValueRow label="Format" value={ad.format} />
            <KeyValueRow label="Objective" value={ad.objective} />
          </Section>

          {/* Engagement */}
          <Section title="Engagement">
            <KeyValueRow label="Impressions" value={formatNumber(ad.metrics?.impressions || 0)} />
            <KeyValueRow label="Clicks" value={formatNumber(ad.metrics?.clicks || 0)} />
            <KeyValueRow label="CTR" value={formatPercent(ad.metrics?.ctr || 0)} />
            <KeyValueRow label="Thumbstop Rate" value={formatPercent(ad.metrics?.thumbstopRate || 0)} />
            {ad.metrics?.avgWatchTime && (
              <KeyValueRow label="Avg Watch Time" value={`${ad.metrics.avgWatchTime}s`} />
            )}
          </Section>

          {/* Costs & Revenue */}
          <Section title="Costs & Revenue">
            <KeyValueRow label="Spend" value={formatCurrency(ad.metrics?.spend || 0)} />
            <KeyValueRow label="Revenue" value={formatCurrency(ad.metrics?.revenue || 0)} />
            <KeyValueRow label="Platform ROAS" value={formatRoas(ad.metrics?.roas || 0)} />
            <KeyValueRow label="CPA" value={formatCurrency(ad.metrics?.cpa || 0)} />
            <KeyValueRow label="CPM" value={formatCurrency(ad.metrics?.cpm || 0)} />
            <KeyValueRow label="Conversions" value={formatNumber(ad.metrics?.conversions || 0)} />
          </Section>

          {/* Grades */}
          <Section title="Grades">
            <div className="grid grid-cols-4 gap-4 py-2">
              {[
                { label: 'Overall', score: ad.overallScore },
                { label: 'CTR', score: ad.scores?.clickScore },
                { label: 'CVR', score: ad.scores?.convertScore },
                { label: 'Hook', score: ad.scores?.hookScore },
              ].map(g => (
                <div key={g.label} className="text-center">
                  <GradeBadge score={g.score || 0} size="lg" />
                  <div className="text-[10px] text-text-tertiary mt-1.5">{g.label}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border sticky bottom-0 bg-white">
          <Link
            to={`/creatives/${ad.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            onClick={onClose}
          >
            View Full Analysis
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
