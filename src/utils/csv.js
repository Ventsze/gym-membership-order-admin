import dayjs from 'dayjs'
import { ORDER_STATUS_META } from '../constants/order'
import { formatMoney } from './format'

function escapeCsv(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

export function exportOrdersToCsv(orders) {
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
    order.orderNo,
    order.memberName,
    order.phone,
    order.years,
    formatMoney(order.amount),
    ORDER_STATUS_META[order.status]?.label ?? order.status,
    order.createdAt,
    order.remark,
  ])

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n')
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
