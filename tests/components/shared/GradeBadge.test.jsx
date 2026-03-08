import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GradeBadge, { scoreToGrade } from '../../../src/components/shared/GradeBadge';

describe('scoreToGrade', () => {
  it('returns A for scores >= 80', () => {
    expect(scoreToGrade(85)).toBe('A');
    expect(scoreToGrade(80)).toBe('A');
    expect(scoreToGrade(100)).toBe('A');
  });

  it('returns B for scores >= 60 and < 80', () => {
    expect(scoreToGrade(65)).toBe('B');
    expect(scoreToGrade(60)).toBe('B');
    expect(scoreToGrade(79)).toBe('B');
  });

  it('returns C for scores >= 40 and < 60', () => {
    expect(scoreToGrade(45)).toBe('C');
    expect(scoreToGrade(40)).toBe('C');
    expect(scoreToGrade(59)).toBe('C');
  });

  it('returns D for scores < 40', () => {
    expect(scoreToGrade(25)).toBe('D');
    expect(scoreToGrade(0)).toBe('D');
    expect(scoreToGrade(39)).toBe('D');
  });
});

describe('GradeBadge', () => {
  it('renders grade letter when grade prop is passed directly', () => {
    render(<GradeBadge grade="A" />);
    expect(screen.getByText('A')).toBeDefined();
  });

  it('converts score to grade using scoreToGrade', () => {
    const { rerender } = render(<GradeBadge score={85} />);
    expect(screen.getByText('A')).toBeDefined();

    rerender(<GradeBadge score={65} />);
    expect(screen.getByText('B')).toBeDefined();

    rerender(<GradeBadge score={45} />);
    expect(screen.getByText('C')).toBeDefined();

    rerender(<GradeBadge score={25} />);
    expect(screen.getByText('D')).toBeDefined();
  });

  it('defaults to D when no score or grade provided', () => {
    render(<GradeBadge />);
    expect(screen.getByText('D')).toBeDefined();
  });
});
