import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggle from '../../../src/components/shared/ViewToggle';

describe('ViewToggle', () => {
  it('renders buttons for each mode', () => {
    render(<ViewToggle mode="list" onChange={() => {}} />);
    expect(screen.getByTitle('List')).toBeDefined();
    expect(screen.getByTitle('Grid')).toBeDefined();
  });

  it('active mode button has bg-white class', () => {
    render(<ViewToggle mode="list" onChange={() => {}} />);
    const activeBtn = screen.getByTitle('List');
    expect(activeBtn.className).toContain('bg-white');
  });

  it('inactive mode button does not have bg-white class', () => {
    render(<ViewToggle mode="list" onChange={() => {}} />);
    const inactiveBtn = screen.getByTitle('Grid');
    expect(inactiveBtn.className).not.toContain('bg-white');
  });

  it('calls onChange with mode key on click', () => {
    const onChange = vi.fn();
    render(<ViewToggle mode="list" onChange={onChange} />);
    fireEvent.click(screen.getByTitle('Grid'));
    expect(onChange).toHaveBeenCalledWith('grid');
  });

  it('default modes are list and grid', () => {
    render(<ViewToggle mode="list" onChange={() => {}} />);
    expect(screen.getByTitle('List')).toBeDefined();
    expect(screen.getByTitle('Grid')).toBeDefined();
  });

  it('supports custom modes', () => {
    render(<ViewToggle mode="list" onChange={() => {}} modes={['list', 'grid', 'expanded']} />);
    expect(screen.getByTitle('List')).toBeDefined();
    expect(screen.getByTitle('Grid')).toBeDefined();
    expect(screen.getByTitle('Expanded')).toBeDefined();
  });
});
