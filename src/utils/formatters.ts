import type { Grade, MetricFormat, RankChange, RankDirection } from '../types';

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatRoas(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function getScoreColorClass(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-lime-600 bg-lime-50';
  if (score >= 40) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    Active: 'bg-blue-100 text-blue-700',
    Scaling: 'bg-green-100 text-green-700',
    Declining: 'bg-red-100 text-red-700',
    Paused: 'bg-gray-100 text-gray-600',
    Testing: 'bg-purple-100 text-purple-700',
  };
  return map[status] || 'bg-gray-100 text-gray-600';
}

export function getStatusDot(status: string): string {
  const map: Record<string, string> = {
    Active: 'bg-blue-500',
    Scaling: 'bg-green-500',
    Declining: 'bg-red-500',
    Paused: 'bg-gray-400',
    Testing: 'bg-purple-500',
  };
  return map[status] || 'bg-gray-400';
}

export function getRankChange(current: number, previous: number): RankChange {
  const diff = previous - current;
  if (diff > 0) return { direction: 'up', value: diff };
  if (diff < 0) return { direction: 'down', value: Math.abs(diff) };
  return { direction: 'same', value: 0 };
}

export function scoreToGrade(score: number): Grade {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

export function formatByType(value: number, format: MetricFormat): string {
  switch (format) {
    case 'currency': return formatCurrency(value);
    case 'percent': return formatPercent(value);
    case 'roas': return formatRoas(value);
    case 'number': return formatNumber(value);
    default: return String(value);
  }
}

export function gradeToScore(grade: Grade): number {
  const map: Record<Grade, number> = { A: 90, B: 70, C: 50, D: 30 };
  return map[grade] || 50;
}
