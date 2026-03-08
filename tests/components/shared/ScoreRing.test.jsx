import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreRing from '../../../src/components/shared/ScoreRing';

describe('ScoreRing', () => {
  it('renders the score number text', () => {
    render(<ScoreRing score={75} />);
    expect(screen.getByText('75')).toBeDefined();
  });

  it('renders SVG with circles', () => {
    const { container } = render(<ScoreRing score={75} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const circles = svg.querySelectorAll('circle');
    expect(circles.length).toBe(2);
  });

  it('renders label when label prop is provided', () => {
    render(<ScoreRing score={75} label="Hook" />);
    expect(screen.getByText('Hook')).toBeDefined();
  });

  it('does not render label when not provided', () => {
    const { container } = render(<ScoreRing score={75} />);
    const labels = container.querySelectorAll('.uppercase');
    expect(labels.length).toBe(0);
  });
});
