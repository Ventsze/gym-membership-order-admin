import { App as AntApp, ConfigProvider } from 'antd'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetMockOrders } from '../api/mockService'
import { TOKEN_KEY } from '../stores/authStore'
import { OrdersPage } from './OrdersPage'

function renderPage() {
  return render(
    <ConfigProvider>
      <AntApp>
        <MemoryRouter>
          <OrdersPage />
        </MemoryRouter>
      </AntApp>
    </ConfigProvider>,
  )
}

describe('OrdersPage', () => {
  beforeEach(() => {
    resetMockOrders()
    localStorage.setItem(TOKEN_KEY, 'test-token')
  })

  it('filters expired orders and previews the five-year discounted renewal fee', async () => {
    renderPage()

    expect(await screen.findByText('共 36 笔订单')).toBeInTheDocument()
    fireEvent.click(document.querySelector('[role="tab"][id$="-expired"]'))
    expect(await screen.findByText('共 6 笔订单')).toBeInTheDocument()

    fireEvent.click(screen.getAllByText('续卡')[0].closest('button'))
    const yearsInput = document.querySelector('.ant-modal input[role="spinbutton"]')
    fireEvent.change(yearsInput, { target: { value: '5' } })

    expect(await screen.findByText('¥ 4,800.00')).toBeInTheDocument()
    expect(screen.getByText('单次续卡满 5 年，已自动应用 8 折优惠')).toBeInTheDocument()
  }, 15000)
})
