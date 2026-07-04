import { describe, expect, it } from 'vitest'
import { generateToken, hashPassword, verifyPassword, verifyToken } from './auth'

describe('password hashing', () => {
  it('hashes a password and verifies it correctly', async () => {
    const hashed = await hashPassword('my-secret-password')
    expect(hashed).not.toBe('my-secret-password')
    await expect(verifyPassword('my-secret-password', hashed)).resolves.toBe(true)
  })

  it('rejects an incorrect password', async () => {
    const hashed = await hashPassword('my-secret-password')
    await expect(verifyPassword('wrong-password', hashed)).resolves.toBe(false)
  })
})

describe('jwt tokens', () => {
  it('generates a token that can be verified back to the original payload', () => {
    const token = generateToken({ userId: '123', role: 'ADMIN' })
    const decoded = verifyToken(token) as { userId: string; role: string }
    expect(decoded.userId).toBe('123')
    expect(decoded.role).toBe('ADMIN')
  })

  it('throws when verifying an invalid token', () => {
    expect(() => verifyToken('not-a-valid-token')).toThrow()
  })
})
