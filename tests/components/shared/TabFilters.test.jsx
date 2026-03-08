import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TabFilters from '../../../src/components/shared/TabFilters';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active', count: 12 },
  { key: 'paused', label: 'Paused', count: 3 },
];

describe('TabFilters', () => {
  it('renders all tab labels', () => {
    render(<TabFilters tabs={tabs} activeTab="all" onChange={() => {}} />);
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
    expect(screen.getByText('Paused')).toBeDefined();
  });

  it('shows count in parentheses when tab has count property', () => {
    render(<TabFilters tabs={tabs} activeTab="all" onChange={() => {}} />);
    expect(screen.getByText('(12)')).toBeDefined();
    expect(screen.getByText('(3)')).toBeDefined();
  });

  it('calls onChange with correct tab key on click', () => {
    const onChange = vi.fn();
    render(<TabFilters tabs={tabs} activeTab="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('Active'));
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('active tab has bg-white class', () => {
    render(<TabFilters tabs={tabs} activeTab="active" onChange={() => {}} />);
    const activeButton = screen.getByText('Active').closest('button');
    expect(activeButton.className).toContain('bg-white');
  });

  it('inactive tab does not have bg-white class', () => {
    render(<TabFilters tabs={tabs} activeTab="active" onChange={() => {}} />);
    const inactiveButton = screen.getByText('All').closest('button');
    expect(inactiveButton.className).not.toContain('bg-white');
  });
});
