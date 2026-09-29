import { describe, expect, it } from 'vitest'
import { formatMoney, formatPhone } from './format'

describe('formatMoney', () => {
  it.each([
    [12000, '12,000.00'],
    [0, '0.00'],
    ['1200.5', '1,200.50'],
    [null, '--'],
    [undefined, '--'],
    ['', '--'],
    ['not-a-number', '--'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatMoney(input)).toBe(expected)
  })
})

describe('formatPhone', () => {
  it('groups a valid mobile number', () => {
    expect(formatPhone('13800138000')).toBe('138 0013 8000')
  })

  it('keeps non-standard values readable', () => {
    expect(formatPhone('123')).toBe('123')
    expect(formatPhone(null)).toBe('--')
  })
})
