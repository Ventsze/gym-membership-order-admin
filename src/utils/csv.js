import dayjs from 'dayjs'
import { ORDER_STATUS_META } from '../constants/order'
import { formatMoney } from './format'

export function escapeCsv(value, protectFormula = false) {
  const text = String(value ?? '')
  const safeText = protectFormula && /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

export function createOrdersCsv(orders) {
  const headers = [
    '订单号',
    '会员姓名',
    '联系手机号',
    '购卡年限',
    '订单金额（元）',
    '状态',
    '创建时间',
    '备注',
  ]
  const rows = orders.map((order) => [
    escapeCsv(order.orderNo, true),
    escapeCsv(order.memberName, true),
    escapeCsv(order.phone, true),
    escapeCsv(order.years),
    escapeCsv(formatMoney(order.amount)),
    escapeCsv(ORDER_STATUS_META[order.status]?.label ?? order.status, true),
    escapeCsv(order.createdAt),
    escapeCsv(order.remark, true),
  ])

  return [headers.map((value) => escapeCsv(value)), ...rows]
    .map((row) => row.join(','))
    .join('\r\n')
}

export function exportOrdersToCsv(orders) {
  const csv = createOrdersCsv(orders)
  const blob = new Blob([`\uFEFF${csv}`], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `会员订单_${dayjs().format('YYYYMMDD_HHmmss')}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
