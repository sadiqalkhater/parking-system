import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, role } = await req.json()
    const [exists] = await sql`SELECT id FROM "User" WHERE email = ${email}`
    if (exists) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, { status: 400 })
    const hashed = await hashPassword(password)
    const [user] = await sql`
      INSERT INTO "User" (id, name, email, password, phone, role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${email}, ${hashed}, ${phone || null}, ${role || 'USER'}, NOW(), NOW())
      RETURNING id, name, email, role, phone, "createdAt"
    `
    const token = generateToken({ id: user.id, email: user.email, role: user.role })
    return NextResponse.json({ token, user }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
