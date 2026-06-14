import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const user = verifyToken(auth.replace('Bearer ', '')) as { role: string }
    if (!['ADMIN','MANAGER'].includes(user.role)) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    const users = await sql`SELECT id, name, email, role, phone, "createdAt" FROM "User" ORDER BY "createdAt" DESC`
    return NextResponse.json(users)
  } catch { return NextResponse.json({ error: 'غير مصرح' }, { status: 401 }) }
}
