import http from './http'

export const orderApi = {
  list(params, config = {}) {
    return http.get('/orders', { ...config, params })
  },
  create(payload) {
    return http.post('/orders', payload)
  },
  renew(payload) {
    return http.post('/orders/renew', payload)
  },
  cancel(payload) {
    return http.post('/orders/cancel', payload)
  },
}
