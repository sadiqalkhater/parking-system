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
  const permits = user.role === 'ADMIN' || user.role === 'MANAGER'
    ? await sql`SELECT p.*, u.name as "userName", u.email as "userEmail", v."plateNumber", v.brand FROM "Permit" p JOIN "User" u ON p."userId" = u.id JOIN "Vehicle" v ON p."vehicleId" = v.id ORDER BY p."createdAt" DESC`
    : await sql`SELECT p.*, u.name as "userName", u.email as "userEmail", v."plateNumber", v.brand FROM "Permit" p JOIN "User" u ON p."userId" = u.id JOIN "Vehicle" v ON p."vehicleId" = v.id WHERE p."userId" = ${user.id} ORDER BY p."createdAt" DESC`
  return NextResponse.json(permits.map(p => ({ ...p, user: { name: p.userName, email: p.userEmail }, vehicle: { plateNumber: p.plateNumber, brand: p.brand } })))
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { vehicleId, type, startDate, endDate, zoneAccess, price, userId } = await req.json()
  const [permit] = await sql`
    INSERT INTO "Permit" (id, "permitNumber", "userId", "vehicleId", type, status, "startDate", "endDate", "zoneAccess", price, "createdAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), ${userId || user.id}, ${vehicleId}, ${type}, 'ACTIVE', ${startDate}, ${endDate}, ${zoneAccess || null}, ${price}, NOW())
    RETURNING *
  `
  return NextResponse.json(permit, { status: 201 })
}
