import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  try { return verifyToken(auth.replace('Bearer ', '')) as { id: string; role: string } }
  catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const vehicles = user.role === 'ADMIN' || user.role === 'MANAGER'
    ? await sql`SELECT v.*, u.name as "userName", u.email as "userEmail" FROM "Vehicle" v JOIN "User" u ON v."userId" = u.id ORDER BY v."createdAt" DESC`
    : await sql`SELECT v.*, u.name as "userName", u.email as "userEmail" FROM "Vehicle" v JOIN "User" u ON v."userId" = u.id WHERE v."userId" = ${user.id} ORDER BY v."createdAt" DESC`
  return NextResponse.json(vehicles.map(v => ({ ...v, user: { name: v.userName, email: v.userEmail } })))
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { plateNumber, brand, model, color, userId } = await req.json()
  try {
    const [vehicle] = await sql`
      INSERT INTO "Vehicle" (id, "plateNumber", brand, model, color, "userId", "createdAt")
      VALUES (gen_random_uuid(), ${plateNumber}, ${brand}, ${model}, ${color}, ${userId || user.id}, NOW())
      RETURNING *
    `
    return NextResponse.json(vehicle, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'رقم اللوحة مستخدم مسبقاً' }, { status: 400 })
  }
}
