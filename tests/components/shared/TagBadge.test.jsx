import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TagBadge from '../../../src/components/shared/TagBadge';

describe('TagBadge', () => {
  it('renders the value text', () => {
    render(<TagBadge type="hook" value="Question" />);
    expect(screen.getByText('Question')).toBeDefined();
  });

  it('uses purple classes for hook type', () => {
    render(<TagBadge type="hook" value="Hook Tag" />);
    const el = screen.getByText('Hook Tag');
    expect(el.className).toContain('bg-purple-50');
    expect(el.className).toContain('text-purple-700');
    expect(el.className).toContain('border-purple-200');
  });

  it('uses blue classes for cta type', () => {
    render(<TagBadge type="cta" value="CTA Tag" />);
    const el = screen.getByText('CTA Tag');
    expect(el.className).toContain('bg-blue-50');
    expect(el.className).toContain('text-blue-700');
    expect(el.className).toContain('border-blue-200');
  });

  it('uses amber classes for tone type', () => {
    render(<TagBadge type="tone" value="Tone Tag" />);
    const el = screen.getByText('Tone Tag');
    expect(el.className).toContain('bg-amber-50');
    expect(el.className).toContain('text-amber-700');
    expect(el.className).toContain('border-amber-200');
  });

  it('uses teal classes for visual type', () => {
    render(<TagBadge type="visual" value="Visual Tag" />);
    const el = screen.getByText('Visual Tag');
    expect(el.className).toContain('bg-teal-50');
    expect(el.className).toContain('text-teal-700');
    expect(el.className).toContain('border-teal-200');
  });

  it('falls back to gray for unknown type', () => {
    render(<TagBadge type="unknown" value="Other" />);
    const el = screen.getByText('Other');
    expect(el.className).toContain('bg-gray-50');
    expect(el.className).toContain('text-gray-600');
    expect(el.className).toContain('border-gray-200');
  });
});
