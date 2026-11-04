import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAuthUser, hasRole } from '@/lib/auth'

export async function GET(req: NextRequest) {
  if (!getAuthUser(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const zones = await sql`SELECT * FROM "ParkingZone" ORDER BY name`
  const slots = await sql`SELECT * FROM "ParkingSlot" ORDER BY "slotNumber"`
  return NextResponse.json(zones.map(z => ({ ...z, slots: slots.filter(s => s.zoneId === z.id) })))
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req)
  if (!hasRole(user, ['ADMIN', 'MANAGER'])) return NextResponse.json({ error: 'غير مصرح' }, { status: user ? 403 : 401 })
  const { name, description, totalSlots, floor, type } = await req.json()
  const [zone] = await sql`
    INSERT INTO "ParkingZone" (name, description, "totalSlots", floor, type)
    VALUES (${name}, ${description||null}, ${totalSlots}, ${floor||null}, ${type||'REGULAR'})
    RETURNING *
  `
  for (let i = 1; i <= totalSlots; i++) {
    await sql`INSERT INTO "ParkingSlot" ("slotNumber", "zoneId", status) VALUES (${`${name}-${String(i).padStart(3,'0')}`}, ${zone.id}, 'AVAILABLE')`
  }
  return NextResponse.json(zone, { status: 201 })
}
