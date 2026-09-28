import { useCallback, useEffect, useState } from 'react'
import { orderApi } from '../api/orders'

const initialQuery = {
  page: 1,
  pageSize: 10,
  statusGroup: 'all',
  orderNo: '',
  memberName: '',
}

export function useOrderList() {
  const [query, setQuery] = useState(initialQuery)
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await orderApi.list(query)
      setData(result.list)
      setTotal(result.total)
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders, refreshKey])

  const changeTab = (statusGroup) => {
    setQuery((current) => ({ ...current, statusGroup, page: 1 }))
  }

  const search = (values) => {
    setQuery((current) => ({
      ...current,
      ...values,
      orderNo: values.orderNo?.trim() || '',
      memberName: values.memberName?.trim() || '',
      page: 1,
    }))
  }

  const reset = () => {
    setQuery((current) => ({
      ...initialQuery,
      statusGroup: current.statusGroup,
    }))
  }

  const changePage = (page, pageSize) => {
    setQuery((current) => ({ ...current, page, pageSize }))
  }

  const refresh = () => setRefreshKey((key) => key + 1)

  return {
    query,
    data,
    total,
    loading,
    changeTab,
    search,
    reset,
    changePage,
    refresh,
  }
}
