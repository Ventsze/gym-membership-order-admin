import { Tag } from 'antd'
import { ORDER_STATUS_META } from '../constants/order'

export function StatusTag({ status }) {
  const meta = ORDER_STATUS_META[status] || { label: status, color: 'default' }
  return (
    <Tag className="status-tag" color={meta.color}>
      {meta.label}
    </Tag>
  )
}
