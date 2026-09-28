import axios from 'axios'
import { useAuthStore, TOKEN_KEY } from '../stores/authStore'
import { mockAdapter } from './mockService'

const http = axios.create({
  baseURL: '/api',
  timeout: 8000,
  adapter: mockAdapter,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    const status = error.response?.status
    const errorMessage =
      error.response?.data?.message || error.message || '请求失败，请稍后重试'

    if (status === 401) {
      useAuthStore.getState().logout()
      window.dispatchEvent(new CustomEvent('app:http-error', { detail: errorMessage }))
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    } else {
      window.dispatchEvent(new CustomEvent('app:http-error', { detail: errorMessage }))
    }
    return Promise.reject(error)
  },
)

export default http
