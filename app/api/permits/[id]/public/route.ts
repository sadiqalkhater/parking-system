import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [permit] = await sql`
    SELECT p.id, p."permitNumber", p.type, p.status, p."startDate", p."endDate", 
           p."zoneAccess", p.price,
           u.name as "userName", u.email as "userEmail", u.phone,
           v."plateNumber", v.brand, v.model, v.color
    FROM "Permit" p
    JOIN "User" u ON p."userId" = u.id
    JOIN "Vehicle" v ON p."vehicleId" = v.id
    WHERE p.id = ${id}
  `
  if (!permit) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })
  return NextResponse.json(permit)
}
