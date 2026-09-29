import dayjs from 'dayjs'
import { calculateFee, ORDER_STATUS } from '../constants/order'

const names = [
  '林晓雅',
  '陈子昂',
  '周雨桐',
  '赵明远',
  '苏静怡',
  '李承泽',
  '王若溪',
  '许博文',
  '顾安然',
  '张嘉诚',
  '陆思妍',
  '沈亦辰',
]

const statuses = [
  ORDER_STATUS.PENDING_REVIEW,
  ORDER_STATUS.PENDING_CARD,
  ORDER_STATUS.PENDING_MAIL,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.EXPIRED,
  ORDER_STATUS.CANCELLED,
]

function createInitialOrders() {
  return Array.from({ length: 36 }, (_, index) => {
    const years = (index % 10) + 1
    return {
      id: String(index + 1),
      orderNo: `GYM${dayjs().subtract(index, 'day').format('YYYYMMDD')}${String(index + 1).padStart(4, '0')}`,
      memberName: names[index % names.length],
      phone: `138${String(10000000 + index * 7919).slice(-8)}`,
      years,
      amount: index === 11 ? null : index === 17 ? 0 : calculateFee(years),
      status: statuses[index % statuses.length],
      remark: index % 4 === 0 ? '偏好晚间训练时段' : '',
      createdAt: dayjs()
        .subtract(index, 'day')
        .hour(9 + (index % 8))
        .minute((index * 7) % 60)
        .format('YYYY-MM-DD HH:mm:ss'),
    }
  })
}

let orders = createInitialOrders()
let orderSequence = 0

export function resetMockOrders() {
  orders = createInitialOrders()
  orderSequence = 0
}

function wait(ms = import.meta.env.MODE === 'test' ? 0 : 260) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function ok(config, data, status = 200) {
  return {
    data: { code: 0, data, message: 'ok' },
    status,
    statusText: 'OK',
    headers: {},
    config,
  }
}

function fail(config, message, status = 400) {
  const error = new Error(message)
  error.config = config
  error.response = {
    data: { code: status, message },
    status,
    statusText: 'Error',
    headers: {},
    config,
  }
  throw error
}

function parseBody(data) {
  if (!data) return {}
  if (typeof data === 'string') return JSON.parse(data)
  return data
}

function isValidYears(years) {
  const value = Number(years)
  return Number.isInteger(value) && value >= 1 && value <= 10
}

function filterOrders(params = {}) {
  const { statusGroup = 'all', orderNo = '', memberName = '' } = params
  return orders
    .filter((order) => {
      if (statusGroup === 'in_progress') {
        return [
          ORDER_STATUS.PENDING_REVIEW,
          ORDER_STATUS.PENDING_CARD,
          ORDER_STATUS.PENDING_MAIL,
        ].includes(order.status)
      }
      return statusGroup === 'all' || order.status === statusGroup
    })
    .filter((order) => !orderNo || order.orderNo === orderNo.trim())
    .filter((order) => !memberName || order.memberName.includes(memberName.trim()))
    .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
}

export async function mockAdapter(config) {
  await wait()
  const method = config.method?.toLowerCase()
  const url = config.url

  if (!config.headers?.Authorization) {
    return fail(config, '登录状态已失效，请重新登录', 401)
  }

  if (url === '/orders' && method === 'get') {
    const filtered = filterOrders(config.params)
    if (config.params?.all === true || config.params?.all === 'true') {
      return ok(config, { list: filtered, total: filtered.length })
    }
    const page = Math.max(Number(config.params?.page) || 1, 1)
    const pageSize = Math.max(Number(config.params?.pageSize) || 10, 1)
    const start = (page - 1) * pageSize
    return ok(config, {
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
    })
  }

  if (url === '/orders' && method === 'post') {
    const body = parseBody(config.data)
    const memberName = String(body.memberName || '').trim()
    const phone = String(body.phone || '').trim()
    if (memberName.length < 2 || memberName.length > 30) {
      return fail(config, '会员姓名长度应为 2～30 个字符')
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return fail(config, '请输入有效的中国大陆手机号')
    }
    if (!isValidYears(body.years)) {
      return fail(config, '购卡年限应为 1～10 的整数')
    }
    if (String(body.remark || '').length > 200) {
      return fail(config, '备注最多 200 字')
    }
    const now = dayjs()
    orderSequence += 1
    const uniqueSuffix = `${now.format('YYYYMMDDHHmmssSSS')}${String(orderSequence).padStart(3, '0')}`
    const newOrder = {
      id: `new-${uniqueSuffix}`,
      orderNo: `GYM${uniqueSuffix}`,
      memberName,
      phone,
      years: Number(body.years),
      amount: calculateFee(body.years),
      status: ORDER_STATUS.PENDING_REVIEW,
      remark: body.remark || '',
      createdAt: now.format('YYYY-MM-DD HH:mm:ss'),
    }
    orders = [newOrder, ...orders]
    return ok(config, newOrder, 201)
  }

  if (url === '/orders/renew' && method === 'post') {
    const { orderIds = [], years } = parseBody(config.data)
    if (!isValidYears(years)) {
      return fail(config, '续卡年限应为 1～10 的整数')
    }
    const targets = orders.filter((order) => orderIds.includes(order.id))
    const invalid = targets.filter((order) => order.status !== ORDER_STATUS.EXPIRED)
    if (!targets.length || targets.length !== orderIds.length) {
      return fail(config, '存在未找到的订单')
    }
    if (invalid.length) {
      return fail(
        config,
        `订单 ${invalid.map((item) => item.orderNo).join('、')} 不可续卡`,
      )
    }
    const renewalFee = calculateFee(years, true)
    orders = orders.map((order) =>
      orderIds.includes(order.id)
        ? {
            ...order,
            years: order.years + Number(years),
            amount: Number(order.amount || 0) + renewalFee,
            status: ORDER_STATUS.PENDING_REVIEW,
          }
        : order,
    )
    return ok(config, { updated: orderIds.length, renewalFee })
  }

  if (url === '/orders/cancel' && method === 'post') {
    const { orderIds = [] } = parseBody(config.data)
    const targets = orders.filter((order) => orderIds.includes(order.id))
    const allowed = [ORDER_STATUS.PENDING_CARD, ORDER_STATUS.PENDING_MAIL]
    const invalid = targets.filter((order) => !allowed.includes(order.status))
    if (!targets.length || targets.length !== orderIds.length) {
      return fail(config, '存在未找到的订单')
    }
    if (invalid.length) {
      return fail(
        config,
        `订单 ${invalid.map((item) => item.orderNo).join('、')} 不可撤单`,
      )
    }
    orders = orders.map((order) =>
      orderIds.includes(order.id)
        ? { ...order, status: ORDER_STATUS.CANCELLED }
        : order,
    )
    return ok(config, { updated: orderIds.length })
  }

  return fail(config, '接口不存在', 404)
}
