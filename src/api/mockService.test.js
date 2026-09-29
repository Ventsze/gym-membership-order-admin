import { beforeEach, describe, expect, it } from 'vitest'
import { ORDER_STATUS } from '../constants/order'
import { mockAdapter, resetMockOrders } from './mockService'

function request(method, url, { data, params } = {}) {
  return mockAdapter({
    method,
    url,
    data: data ? JSON.stringify(data) : undefined,
    params,
    headers: { Authorization: 'Bearer test-token' },
  }).then((response) => response.data.data)
}

describe('mock order service', () => {
  beforeEach(() => resetMockOrders())

  it('supports pagination and status filtering over all initial records', async () => {
    const firstPage = await request('get', '/orders', {
      params: { page: 1, pageSize: 10, statusGroup: 'all' },
    })
    const inProgress = await request('get', '/orders', {
      params: { statusGroup: 'in_progress', all: true },
    })

    expect(firstPage.total).toBe(36)
    expect(firstPage.list).toHaveLength(10)
    expect(inProgress.total).toBe(18)
    expect(inProgress.list.every((order) => order.status.startsWith('pending_'))).toBe(
      true,
    )
  })

  it('creates unique orders and validates write payloads', async () => {
    const payload = {
      memberName: '测试会员',
      phone: '13800138000',
      years: 3,
      remark: '',
    }
    const first = await request('post', '/orders', { data: payload })
    const second = await request('post', '/orders', { data: payload })

    expect(first.orderNo).not.toBe(second.orderNo)
    expect(first.status).toBe(ORDER_STATUS.PENDING_REVIEW)
    await expect(
      request('post', '/orders', { data: { ...payload, years: 11 } }),
    ).rejects.toThrow('购卡年限应为 1～10 的整数')
  })

  it('renews an expired order and persists the result', async () => {
    const expired = await request('get', '/orders', {
      params: { statusGroup: ORDER_STATUS.EXPIRED, all: true },
    })
    const target = expired.list[0]

    await request('post', '/orders/renew', {
      data: { orderIds: [target.id], years: 5 },
    })
    const updated = await request('get', '/orders', {
      params: { orderNo: target.orderNo, all: true },
    })

    expect(updated.list[0]).toMatchObject({
      years: target.years + 5,
      amount: Number(target.amount || 0) + 4800,
      status: ORDER_STATUS.PENDING_REVIEW,
    })
  })

  it('rejects invalid renewals and cancels eligible orders', async () => {
    const all = await request('get', '/orders', { params: { all: true } })
    const pendingReview = all.list.find(
      (order) => order.status === ORDER_STATUS.PENDING_REVIEW,
    )
    const pendingCard = all.list.find(
      (order) => order.status === ORDER_STATUS.PENDING_CARD,
    )

    await expect(
      request('post', '/orders/renew', {
        data: { orderIds: [pendingReview.id], years: 2 },
      }),
    ).rejects.toThrow('不可续卡')

    await request('post', '/orders/cancel', {
      data: { orderIds: [pendingCard.id] },
    })
    const updated = await request('get', '/orders', {
      params: { orderNo: pendingCard.orderNo, all: true },
    })
    expect(updated.list[0].status).toBe(ORDER_STATUS.CANCELLED)
  })

  it('requires authentication', async () => {
    await expect(
      mockAdapter({ method: 'get', url: '/orders', headers: {} }),
    ).rejects.toMatchObject({ response: { status: 401 } })
  })
})
