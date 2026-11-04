import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { hashPassword, getAuthUser, hasRole, type Role } from '@/lib/auth'

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'USER']

// Account creation is an admin action (used by /dashboard/users). There is no public sign-up,
// so callers must be an authenticated ADMIN; the requested role is validated against a whitelist.
export async function POST(req: NextRequest) {
  const caller = getAuthUser(req)
  if (!hasRole(caller, ['ADMIN'])) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: caller ? 403 : 401 })
  }
  try {
    const { name, email, password, phone, role } = await req.json()
    if (!name || !email || !password || String(password).length < 8) {
      return NextResponse.json({ error: 'البيانات غير مكتملة (كلمة المرور 8 أحرف على الأقل)' }, { status: 400 })
    }
    const safeRole: Role = ROLES.includes(role) ? role : 'USER'
    const [exists] = await sql`SELECT id FROM "User" WHERE email = ${email}`
    if (exists) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, { status: 400 })
    const hashed = await hashPassword(password)
    const [user] = await sql`
      INSERT INTO "User" (id, name, email, password, phone, role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${email}, ${hashed}, ${phone || null}, ${safeRole}, NOW(), NOW())
      RETURNING id, name, email, role, phone, "createdAt"
    `
    // Do not return a token: the admin creating the account must stay logged in as themselves.
    return NextResponse.json({ user }, { status: 201 })
  } catch (e) {
    console.error('register failed', e)
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
