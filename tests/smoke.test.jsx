import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('Test runner smoke test', () => {
  it('vitest runs correctly', () => {
    expect(1 + 1).toBe(2)
  })

  it('jsdom environment works', () => {
    expect(document).toBeDefined()
    expect(window).toBeDefined()
  })

  it('React Testing Library renders components', () => {
    function Hello() {
      return <h1>Hello, Vitest!</h1>
    }
    render(<Hello />)
    expect(screen.getByText('Hello, Vitest!')).toBeInTheDocument()
  })
})
