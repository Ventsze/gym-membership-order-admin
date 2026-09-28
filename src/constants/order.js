export const ORDER_STATUS = {
  PENDING_REVIEW: 'pending_review',
  PENDING_CARD: 'pending_card',
  PENDING_MAIL: 'pending_mail',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_META = {
  [ORDER_STATUS.PENDING_REVIEW]: { label: '待审核', color: 'gold' },
  [ORDER_STATUS.PENDING_CARD]: { label: '待制卡', color: 'processing' },
  [ORDER_STATUS.PENDING_MAIL]: { label: '待寄卡', color: 'cyan' },
  [ORDER_STATUS.COMPLETED]: { label: '已完成', color: 'success' },
  [ORDER_STATUS.EXPIRED]: { label: '已到期', color: 'default' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', color: 'error' },
}

export const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'in_progress', label: '进行中' },
  { key: ORDER_STATUS.EXPIRED, label: '已到期' },
  { key: ORDER_STATUS.COMPLETED, label: '已完成' },
  { key: ORDER_STATUS.CANCELLED, label: '已取消' },
]

export const RENEWABLE_STATUS = ORDER_STATUS.EXPIRED
export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING_CARD,
  ORDER_STATUS.PENDING_MAIL,
]
export const EXPORTABLE_STATUSES = [ORDER_STATUS.EXPIRED, ORDER_STATUS.COMPLETED]

export const ANNUAL_FEE = 1200
export const LONG_TERM_DISCOUNT = 0.8

export function calculateFee(years, withDiscount = false) {
  const safeYears = Number(years) || 0
  const discount = withDiscount && safeYears >= 5 ? LONG_TERM_DISCOUNT : 1
  return safeYears * ANNUAL_FEE * discount
}
