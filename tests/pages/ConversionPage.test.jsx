import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ConversionPage from '../../src/pages/ConversionPage'

describe('ConversionPage', () => {
  function renderPage() {
    return render(
      <MemoryRouter>
        <ConversionPage />
      </MemoryRouter>
    )
  }

  it('renders "Conversion Analysis" heading', () => {
    renderPage()
    expect(screen.getByText('Conversion Analysis')).toBeInTheDocument()
  })

  it('renders "Coming Soon" text', () => {
    renderPage()
    expect(screen.getByText('Coming Soon')).toBeInTheDocument()
  })

  it('renders description text about funnel visualization', () => {
    renderPage()
    expect(
      screen.getByText(/funnel visualization, drop-off analysis, and optimization recommendations/)
    ).toBeInTheDocument()
  })
})
