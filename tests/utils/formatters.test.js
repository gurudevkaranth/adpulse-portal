import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRoas,
  timeAgo,
  getScoreColorClass,
  getStatusColor,
  getStatusDot,
  getRankChange,
  scoreToGrade,
  formatByType,
  gradeToScore,
} from '../../src/utils/formatters.js';

describe('formatCurrency', () => {
  it('formats millions with $M suffix', () => {
    expect(formatCurrency(1200000)).toBe('$1.2M');
  });

  it('formats thousands with $K suffix', () => {
    expect(formatCurrency(1200)).toBe('$1.2K');
  });

  it('formats small values with two decimals', () => {
    expect(formatCurrency(1.23)).toBe('$1.23');
  });

  it('formats exactly 1000 as $1.0K', () => {
    expect(formatCurrency(1000)).toBe('$1.0K');
  });

  it('formats exactly 1000000 as $1.0M', () => {
    expect(formatCurrency(1000000)).toBe('$1.0M');
  });
});

describe('formatNumber', () => {
  it('formats millions with M suffix', () => {
    expect(formatNumber(1200000)).toBe('1.2M');
  });

  it('formats thousands with K suffix', () => {
    expect(formatNumber(1200)).toBe('1.2K');
  });

  it('formats small values with locale string', () => {
    expect(formatNumber(999)).toBe('999');
  });
});

describe('formatPercent', () => {
  it('formats normal values with two decimals and % sign', () => {
    expect(formatPercent(12.34)).toBe('12.34%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });
});

describe('formatRoas', () => {
  it('formats normal values with two decimals and x suffix', () => {
    expect(formatRoas(2.45)).toBe('2.45x');
  });

  it('formats zero', () => {
    expect(formatRoas(0)).toBe('0.00x');
  });
});

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for less than 60 seconds ago', () => {
    expect(timeAgo('2026-03-08T11:59:30Z')).toBe('just now');
  });

  it('returns minutes ago', () => {
    expect(timeAgo('2026-03-08T11:55:00Z')).toBe('5m ago');
  });

  it('returns hours ago', () => {
    expect(timeAgo('2026-03-08T10:00:00Z')).toBe('2h ago');
  });

  it('returns "yesterday" for 1 day ago', () => {
    expect(timeAgo('2026-03-07T12:00:00Z')).toBe('yesterday');
  });

  it('returns days ago for 2-6 days', () => {
    expect(timeAgo('2026-03-05T12:00:00Z')).toBe('3d ago');
  });

  it('returns weeks ago for 7+ days', () => {
    expect(timeAgo('2026-02-22T12:00:00Z')).toBe('2w ago');
  });
});

describe('getScoreColorClass', () => {
  it('returns green for score >= 80', () => {
    expect(getScoreColorClass(80)).toBe('text-green-600 bg-green-50');
    expect(getScoreColorClass(95)).toBe('text-green-600 bg-green-50');
  });

  it('returns lime for score >= 60 and < 80', () => {
    expect(getScoreColorClass(60)).toBe('text-lime-600 bg-lime-50');
    expect(getScoreColorClass(79)).toBe('text-lime-600 bg-lime-50');
  });

  it('returns amber for score >= 40 and < 60', () => {
    expect(getScoreColorClass(40)).toBe('text-amber-600 bg-amber-50');
    expect(getScoreColorClass(59)).toBe('text-amber-600 bg-amber-50');
  });

  it('returns red for score < 40', () => {
    expect(getScoreColorClass(39)).toBe('text-red-600 bg-red-50');
    expect(getScoreColorClass(0)).toBe('text-red-600 bg-red-50');
  });
});

describe('getStatusColor', () => {
  it('returns correct class for Active', () => {
    expect(getStatusColor('Active')).toBe('bg-blue-100 text-blue-700');
  });

  it('returns correct class for Scaling', () => {
    expect(getStatusColor('Scaling')).toBe('bg-green-100 text-green-700');
  });

  it('returns correct class for Declining', () => {
    expect(getStatusColor('Declining')).toBe('bg-red-100 text-red-700');
  });

  it('returns correct class for Paused', () => {
    expect(getStatusColor('Paused')).toBe('bg-gray-100 text-gray-600');
  });

  it('returns correct class for Testing', () => {
    expect(getStatusColor('Testing')).toBe('bg-purple-100 text-purple-700');
  });

  it('returns fallback for unknown status', () => {
    expect(getStatusColor('Unknown')).toBe('bg-gray-100 text-gray-600');
  });
});

describe('getStatusDot', () => {
  it('returns correct class for Active', () => {
    expect(getStatusDot('Active')).toBe('bg-blue-500');
  });

  it('returns correct class for Scaling', () => {
    expect(getStatusDot('Scaling')).toBe('bg-green-500');
  });

  it('returns correct class for Declining', () => {
    expect(getStatusDot('Declining')).toBe('bg-red-500');
  });

  it('returns correct class for Paused', () => {
    expect(getStatusDot('Paused')).toBe('bg-gray-400');
  });

  it('returns correct class for Testing', () => {
    expect(getStatusDot('Testing')).toBe('bg-purple-500');
  });

  it('returns fallback for unknown status', () => {
    expect(getStatusDot('Unknown')).toBe('bg-gray-400');
  });
});

describe('getRankChange', () => {
  it('returns up when previous rank is higher (lower number)', () => {
    const result = getRankChange(3, 5);
    expect(result).toEqual({ direction: 'up', value: 2 });
  });

  it('returns down when previous rank is lower (higher number)', () => {
    const result = getRankChange(5, 3);
    expect(result).toEqual({ direction: 'down', value: 2 });
  });

  it('returns same when ranks are equal', () => {
    const result = getRankChange(3, 3);
    expect(result).toEqual({ direction: 'same', value: 0 });
  });
});

describe('scoreToGrade', () => {
  it('returns A for score >= 80', () => {
    expect(scoreToGrade(80)).toBe('A');
    expect(scoreToGrade(100)).toBe('A');
  });

  it('returns B for score >= 60 and < 80', () => {
    expect(scoreToGrade(60)).toBe('B');
    expect(scoreToGrade(79)).toBe('B');
  });

  it('returns C for score >= 40 and < 60', () => {
    expect(scoreToGrade(40)).toBe('C');
    expect(scoreToGrade(59)).toBe('C');
  });

  it('returns D for score < 40', () => {
    expect(scoreToGrade(39)).toBe('D');
    expect(scoreToGrade(0)).toBe('D');
  });
});

describe('formatByType', () => {
  it('formats currency type', () => {
    expect(formatByType(1200, 'currency')).toBe('$1.2K');
  });

  it('formats percent type', () => {
    expect(formatByType(12.34, 'percent')).toBe('12.34%');
  });

  it('formats roas type', () => {
    expect(formatByType(2.45, 'roas')).toBe('2.45x');
  });

  it('formats number type', () => {
    expect(formatByType(1200, 'number')).toBe('1.2K');
  });

  it('falls back to String() for unknown type', () => {
    expect(formatByType(42, 'unknown')).toBe('42');
  });
});

describe('gradeToScore', () => {
  it('returns 90 for grade A', () => {
    expect(gradeToScore('A')).toBe(90);
  });

  it('returns 70 for grade B', () => {
    expect(gradeToScore('B')).toBe(70);
  });

  it('returns 50 for grade C', () => {
    expect(gradeToScore('C')).toBe(50);
  });

  it('returns 30 for grade D', () => {
    expect(gradeToScore('D')).toBe(30);
  });

  it('returns 50 for unknown grade', () => {
    expect(gradeToScore('X')).toBe(50);
  });
});
