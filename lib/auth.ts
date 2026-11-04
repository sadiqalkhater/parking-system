import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'

export type Role = 'ADMIN' | 'MANAGER' | 'USER'
export type AuthUser = { id: string; email?: string; role: Role }

// No hard-coded fallback: a missing secret must fail closed, never sign/verify with a known value.
function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || ['secret', 'your-jwt-secret'].includes(secret)) {
    throw new Error('JWT_SECRET is not set (or still uses a placeholder value)')
  }
  return secret
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: object) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  return jwt.verify(token, getSecret())
}

/** Returns the authenticated user from the `Authorization: Bearer` header, or null. */
export function getAuthUser(req: NextRequest): AuthUser | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try {
    const user = verifyToken(auth.slice(7)) as AuthUser
    return user?.id && user?.role ? user : null
  } catch {
    return null
  }
}

export function hasRole(user: AuthUser | null, roles: Role[]): user is AuthUser {
  return !!user && roles.includes(user.role)
}
