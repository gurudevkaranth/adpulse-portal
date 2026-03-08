import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../helpers/renderWithRouter'
import Dashboard from '../../src/pages/Dashboard'

describe('Dashboard', () => {
  function renderPage() {
    return renderWithRouter(Dashboard, {
      context: { filters: {} },
    })
  }

  it('renders "Creative Dashboard" heading', () => {
    renderPage()
    expect(screen.getByText('Creative Dashboard')).toBeInTheDocument()
  })

  it('renders "Performance overview" text', () => {
    renderPage()
    expect(screen.getByText(/Performance overview/)).toBeInTheDocument()
  })

  it('renders metric cards with "Set target" buttons', () => {
    renderPage()
    const targets = screen.getAllByText('Set target')
    expect(targets.length).toBeGreaterThan(0)
  })

  it('renders "Revenue & Spend Trend" section heading', () => {
    renderPage()
    expect(screen.getByText('Revenue & Spend Trend')).toBeInTheDocument()
  })

  it('renders "Platform Breakdown" section heading', () => {
    renderPage()
    expect(screen.getByText('Platform Breakdown')).toBeInTheDocument()
  })

  it('renders "Performance Shifts" section heading', () => {
    renderPage()
    expect(screen.getByText('Performance Shifts')).toBeInTheDocument()
  })

  it('renders "Weekly Leaderboard" section heading', () => {
    renderPage()
    expect(screen.getByText('Weekly Leaderboard')).toBeInTheDocument()
  })

  it('renders "Creative Funnel Performance" section heading', () => {
    renderPage()
    expect(screen.getByText('Creative Funnel Performance')).toBeInTheDocument()
  })
})
