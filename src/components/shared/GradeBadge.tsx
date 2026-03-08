import type { Grade } from '../../types';

const GRADE_COLORS: Record<Grade, string> = {
  A: 'bg-green-500',
  B: 'bg-blue-500',
  C: 'bg-amber-500',
  D: 'bg-red-500',
};

const SIZES: Record<string, string> = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-7 h-7 text-xs',
  lg: 'w-8 h-8 text-sm',
};

export function scoreToGrade(score: number): Grade {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  return 'D';
}

interface GradeBadgeProps {
  score?: number;
  grade?: Grade;
  size?: 'sm' | 'md' | 'lg';
}

export default function GradeBadge({ score, grade, size = 'md' }: GradeBadgeProps) {
  const g = grade || scoreToGrade(score || 0);
  return (
    <div className={`${SIZES[size]} ${GRADE_COLORS[g]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {g}
    </div>
  );
}
