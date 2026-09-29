import { describe, expect, it } from 'vitest'
import { calculateFee } from './order'

describe('calculateFee', () => {
  it('calculates the standard annual fee', () => {
    expect(calculateFee(4, true)).toBe(4800)
  })

  it('applies the 20% discount from five years', () => {
    expect(calculateFee(5, true)).toBe(4800)
    expect(calculateFee(10, true)).toBe(9600)
  })

  it('does not discount a new membership order', () => {
    expect(calculateFee(5)).toBe(6000)
  })

  it('handles missing years safely', () => {
    expect(calculateFee(undefined, true)).toBe(0)
  })
})
