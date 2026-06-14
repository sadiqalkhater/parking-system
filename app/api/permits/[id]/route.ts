import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  try { return verifyToken(auth.replace('Bearer ', '')) as { id: string; role: string } }
  catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await params
  const [permit] = await sql`
    SELECT p.*, u.name as "userName", u.email as "userEmail", u.phone,
           v."plateNumber", v.brand, v.model, v.color
    FROM "Permit" p 
    JOIN "User" u ON p."userId" = u.id 
    JOIN "Vehicle" v ON p."vehicleId" = v.id
    WHERE p.id = ${id}
  `
  if (!permit) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })
  return NextResponse.json(permit)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { id } = await params
  const { status } = await req.json()
  const [permit] = await sql`
    UPDATE "Permit" SET status = ${status} WHERE id = ${id} RETURNING *
  `
  return NextResponse.json(permit)
}
