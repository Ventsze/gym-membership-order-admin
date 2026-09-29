import { App as AntApp, ConfigProvider } from 'antd'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { resetMockOrders } from '../api/mockService'
import { TOKEN_KEY } from '../stores/authStore'
import { NewOrderPage } from './NewOrderPage'

function renderPage() {
  return render(
    <ConfigProvider>
      <AntApp>
        <MemoryRouter initialEntries={['/orders/new']}>
          <Routes>
            <Route path="/orders/new" element={<NewOrderPage />} />
            <Route path="/orders" element={<div>订单列表目标页</div>} />
          </Routes>
        </MemoryRouter>
      </AntApp>
    </ConfigProvider>,
  )
}

describe('NewOrderPage', () => {
  beforeEach(() => {
    resetMockOrders()
    localStorage.setItem(TOKEN_KEY, 'test-token')
  })

  it('calculates the fee, creates an order and returns to the list', async () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('请输入会员姓名'), {
      target: { value: '测试会员' },
    })
    fireEvent.change(screen.getByPlaceholderText('11 位手机号'), {
      target: { value: '13800138000' },
    })
    fireEvent.change(screen.getByRole('spinbutton', { name: '购卡年限' }), {
      target: { value: '3' },
    })

    expect(screen.getAllByDisplayValue('¥ 3,600.00')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '创建订单' }))

    expect(await screen.findByText('订单列表目标页')).toBeInTheDocument()
  })

  it('shows validation feedback for invalid member data', async () => {
    renderPage()

    fireEvent.change(screen.getByPlaceholderText('请输入会员姓名'), {
      target: { value: '测' },
    })
    fireEvent.change(screen.getByPlaceholderText('11 位手机号'), {
      target: { value: '123' },
    })
    fireEvent.click(screen.getByRole('button', { name: '创建订单' }))

    expect(await screen.findByText('姓名长度应为 2～30 个字符')).toBeInTheDocument()
    expect(screen.getByText('请输入有效的中国大陆手机号')).toBeInTheDocument()
  })
})
