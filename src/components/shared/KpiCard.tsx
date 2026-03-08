import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export default function KpiCard({ title, value, change, changeLabel, icon: Icon, iconColor = 'bg-primary-100 text-primary-600' }: KpiCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{change}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-xs text-text-tertiary">{changeLabel || title}</div>
    </div>
  );
}
