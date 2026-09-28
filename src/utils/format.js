export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return '--'
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '--'
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatPhone(phone) {
  if (!phone || phone.length !== 11) return phone || '--'
  return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`
}
