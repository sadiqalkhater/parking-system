import { describe, expect, it } from 'vitest'
import { formatCurrency, getStatusColor } from './utils'

describe('formatCurrency', () => {
  it('formats a number as SAR currency', () => {
    expect(formatCurrency(100)).toContain('ر.س')
  })
})

describe('getStatusColor', () => {
  it('returns the known color classes for a known status', () => {
    expect(getStatusColor('ACTIVE')).toBe('bg-green-100 text-green-800')
    expect(getStatusColor('EXPIRED')).toBe('bg-red-100 text-red-800')
  })

  it('falls back to the default classes for an unknown status', () => {
    expect(getStatusColor('SOMETHING_UNKNOWN')).toBe('bg-gray-100 text-gray-800')
  })
})
