import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiCard from '../../../src/components/shared/KpiCard';

function MockIcon(props) {
  return <svg data-testid="mock-icon" {...props} />;
}

describe('KpiCard', () => {
  it('renders title and value text', () => {
    render(<KpiCard title="Revenue" value="$1,234" icon={MockIcon} />);
    expect(screen.getByText('$1,234')).toBeDefined();
    expect(screen.getByText('Revenue')).toBeDefined();
  });

  it('renders the icon', () => {
    render(<KpiCard title="Revenue" value="$1,234" icon={MockIcon} />);
    expect(screen.getByTestId('mock-icon')).toBeDefined();
  });

  it('shows positive change with + prefix and green color', () => {
    render(<KpiCard title="Revenue" value="$1,234" change={12.5} icon={MockIcon} />);
    const changeEl = screen.getByText('+12.5%');
    expect(changeEl.closest('div').className).toContain('text-green-700');
    expect(changeEl.closest('div').className).toContain('bg-green-50');
  });

  it('shows negative change with red color', () => {
    render(<KpiCard title="Revenue" value="$1,234" change={-8.3} icon={MockIcon} />);
    const changeEl = screen.getByText('-8.3%');
    expect(changeEl.closest('div').className).toContain('text-red-700');
    expect(changeEl.closest('div').className).toContain('bg-red-50');
  });

  it('hides change indicator when change is undefined', () => {
    const { container } = render(<KpiCard title="Revenue" value="$1,234" icon={MockIcon} />);
    expect(container.querySelector('.bg-green-50')).toBeNull();
    expect(container.querySelector('.bg-red-50')).toBeNull();
  });
});
