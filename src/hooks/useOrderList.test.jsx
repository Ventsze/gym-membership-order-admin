import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { orderApi } from '../api/orders'
import { useOrderList } from './useOrderList'

vi.mock('../api/orders', () => ({
  orderApi: { list: vi.fn() },
}))

describe('useOrderList', () => {
  beforeEach(() => orderApi.list.mockReset())

  it('keeps the newest query result when responses arrive out of order', async () => {
    orderApi.list
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ list: [{ id: 'stale-result' }], total: 1 }), 60),
          ),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ list: [{ id: 'new-result' }], total: 1 }), 5),
          ),
      )
    const { result } = renderHook(() => useOrderList())

    await waitFor(() => expect(orderApi.list).toHaveBeenCalledTimes(1))
    act(() => result.current.changeTab('expired'))
    await waitFor(() => expect(orderApi.list).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'new-result' }]))
    await new Promise((resolve) => setTimeout(resolve, 80))
    expect(result.current.data).toEqual([{ id: 'new-result' }])
  })

  it('resets to page one when searching', async () => {
    orderApi.list.mockResolvedValue({ list: [], total: 0 })
    const { result } = renderHook(() => useOrderList())
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.changePage(3, 20))
    await waitFor(() => expect(result.current.query.page).toBe(3))
    act(() => result.current.search({ orderNo: '  GYM001  ', memberName: ' 林 ' }))

    expect(result.current.query).toMatchObject({
      page: 1,
      pageSize: 20,
      orderNo: 'GYM001',
      memberName: '林',
    })
  })
})
