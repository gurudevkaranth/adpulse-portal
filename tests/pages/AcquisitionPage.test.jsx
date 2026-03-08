import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../helpers/renderWithRouter'
import AcquisitionPage from '../../src/pages/AcquisitionPage'

describe('AcquisitionPage', () => {
  const defaultContext = {
    filters: {},
    setFilters: () => {},
    activeSubTab: undefined,
  }

  function renderPage(overrides = {}) {
    return renderWithRouter(AcquisitionPage, {
      context: { ...defaultContext, ...overrides },
    })
  }

  it('renders without crashing with default (no activeSubTab)', () => {
    renderPage()
    // Default renders ChannelsTab — look for "Channel Performance Analysis" heading
    expect(screen.getByText(/Channel Performance Analysis/)).toBeInTheDocument()
  })

  it('renders without crashing with activeSubTab="channels"', () => {
    renderPage({ activeSubTab: 'channels' })
    expect(screen.getByText(/Channel Performance Analysis/)).toBeInTheDocument()
  })

  it('renders without crashing with activeSubTab="creatives"', () => {
    renderPage({ activeSubTab: 'creatives' })
    // CreativesTab should render something — just verify no crash
    expect(document.body).toBeTruthy()
  })

  it('renders without crashing with activeSubTab="campaigns"', () => {
    renderPage({ activeSubTab: 'campaigns' })
    expect(document.body).toBeTruthy()
  })

  it('renders without crashing with activeSubTab="adSets"', () => {
    renderPage({ activeSubTab: 'adSets' })
    expect(document.body).toBeTruthy()
  })

  it('renders without crashing with activeSubTab="landingPages"', () => {
    renderPage({ activeSubTab: 'landingPages' })
    expect(document.body).toBeTruthy()
  })

  it('renders without crashing with activeSubTab="topPerformers"', () => {
    renderPage({ activeSubTab: 'topPerformers' })
    expect(document.body).toBeTruthy()
  })

  it('renders without crashing with activeSubTab="comparative"', () => {
    renderPage({ activeSubTab: 'comparative' })
    expect(document.body).toBeTruthy()
  })
})
