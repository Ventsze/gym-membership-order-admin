import { App as AntApp, ConfigProvider } from 'antd'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { useAuthStore } from './stores/authStore'

function renderApp(path) {
  return render(
    <ConfigProvider>
      <AntApp>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      </AntApp>
    </ConfigProvider>,
  )
}

describe('application routes', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ token: null, username: '' })
  })

  it('redirects a guest from a protected route to login', async () => {
    renderApp('/orders/new')
    expect(await screen.findByRole('heading', { name: '系统登录' })).toBeInTheDocument()
  })

  it('shows the 404 page for an unknown route', async () => {
    renderApp('/missing-page')
    expect(await screen.findByText('页面走丢了')).toBeInTheDocument()
  })
})
