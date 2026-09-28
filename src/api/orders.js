import http from './http'

export const orderApi = {
  list(params) {
    return http.get('/orders', { params })
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
