import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from './Badge'

describe('Badge', () => {
  it('renders the mapped Arabic label for a known status', () => {
    render(<Badge status="ACTIVE" />)
    expect(screen.getByText('نشط')).toBeInTheDocument()
  })

  it('renders a custom label when provided', () => {
    render(<Badge status="ACTIVE" label="Custom" />)
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('falls back to the raw status text when unknown', () => {
    render(<Badge status="UNKNOWN_STATUS" />)
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument()
  })
})
