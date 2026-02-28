import { Info, PlusCircle, TrendingUp, TrendingDown } from 'lucide-react';
import GradeBadge from './GradeBadge';
import Sparkline from './Sparkline';
import { formatCurrency, formatNumber, formatPercent, formatRoas } from '../../utils/formatters';

function formatByType(value, format) {
  switch (format) {
    case 'currency': return formatCurrency(value);
    case 'percent': return formatPercent(value);
    case 'roas': return formatRoas(value);
    case 'number': return formatNumber(value);
    default: return String(Math.round(value * 100) / 100);
  }
}

export default function MetricCard({ title, value, prevValue, change, sparklineData, grade, format }) {
  const formattedValue = formatByType(value, format);
  const formattedPrev = formatByType(prevValue, format);
  const trend = change >= 0 ? 'positive' : 'negative';
  const TrendIcon = change >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="bg-white rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-medium text-text-primary">{title}</h4>
          <Info className="w-3.5 h-3.5 text-text-tertiary" />
        </div>
        <div className="flex items-center gap-2">
          {grade && <GradeBadge grade={grade} size="sm" />}
          <button className="text-[10px] text-primary-500 font-medium flex items-center gap-0.5 hover:text-primary-700 transition-colors">
            <PlusCircle className="w-3 h-3" />
            Set target
          </button>
        </div>
      </div>

      {/* Value + Change */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-xl font-bold text-text-primary">{formattedValue}</span>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendIcon className="w-3 h-3" />
          {change >= 0 ? '+' : ''}{change?.toFixed(2)}%
        </span>
      </div>
      <div className="text-[10px] text-text-tertiary mt-0.5">Was {formattedPrev}</div>

      {/* Sparkline */}
      {sparklineData && (
        <div className="mt-3">
          <Sparkline data={sparklineData} trend={trend} width="100%" height={36} />
        </div>
      )}
    </div>
  );
}
