import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, Outlet } from 'react-router-dom'

function LayoutWithContext({ context, children }) {
  return <Outlet context={context} />
}

export function renderWithRouter(Component, { context = {}, initialEntries = ['/'] } = {}) {
  function WrappedLayout() {
    return <Outlet context={context} />
  }

  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route element={<WrappedLayout />}>
          <Route path="*" element={<Component />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}
