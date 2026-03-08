import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GradeLegend from '../../../src/components/shared/GradeLegend';

describe('GradeLegend', () => {
  it('renders all 4 grade letters', () => {
    render(<GradeLegend />);
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
    expect(screen.getByText('C')).toBeDefined();
    expect(screen.getByText('D')).toBeDefined();
  });

  it('shows "Performance Grades:" label', () => {
    render(<GradeLegend />);
    expect(screen.getByText('Performance Grades:')).toBeDefined();
  });
});
