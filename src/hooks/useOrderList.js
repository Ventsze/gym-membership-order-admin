import { useEffect, useRef, useState } from 'react'
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
  const requestSequence = useRef(0)

  useEffect(() => {
    const requestId = ++requestSequence.current
    const controller = new AbortController()
    setLoading(true)
    orderApi
      .list(query, { signal: controller.signal })
      .then((result) => {
        if (requestId !== requestSequence.current) return
        setData(result.list)
        setTotal(result.total)
      })
      .catch(() => {
        // 错误提示由 Axios 响应拦截器统一处理；取消请求无需额外反馈。
      })
      .finally(() => {
        if (requestId === requestSequence.current) setLoading(false)
      })

    return () => controller.abort()
  }, [query, refreshKey])

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
