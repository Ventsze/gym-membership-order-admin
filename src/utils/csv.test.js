import { describe, expect, it } from 'vitest'
import { ORDER_STATUS } from '../constants/order'
import { createOrdersCsv, escapeCsv } from './csv'

describe('CSV serialization', () => {
  it('escapes quotes and spreadsheet formulas', () => {
    expect(escapeCsv('a"b')).toBe('"a""b"')
    expect(escapeCsv('=2+2', true)).toBe('"\'=2+2"')
    expect(escapeCsv('  @SUM(A1)', true)).toBe('"\'  @SUM(A1)"')
  })

  it('creates a finance-friendly row with formatted amount', () => {
    const csv = createOrdersCsv([
      {
        orderNo: 'GYM001',
        memberName: '=HYPERLINK("bad")',
        phone: '13800138000',
        years: 5,
        amount: 12000,
        status: ORDER_STATUS.COMPLETED,
        createdAt: '2026-09-29 10:00:00',
        remark: '正常备注',
      },
    ])

    expect(csv).toContain('"12,000.00"')
    expect(csv).toContain('"已完成"')
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"')
    expect(csv.split('\r\n')).toHaveLength(2)
  })
})
