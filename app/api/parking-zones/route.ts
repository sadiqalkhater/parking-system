import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const zones = await sql`SELECT * FROM "ParkingZone" ORDER BY name`
  const slots = await sql`SELECT * FROM "ParkingSlot" ORDER BY "slotNumber"`
  return NextResponse.json(zones.map(z => ({ ...z, slots: slots.filter(s => s.zoneId === z.id) })))
}

export async function POST(req: NextRequest) {
  const { name, description, totalSlots, floor, type } = await req.json()
  const [zone] = await sql`
    INSERT INTO "ParkingZone" (id, name, description, "totalSlots", floor, type)
    VALUES (gen_random_uuid(), ${name}, ${description || null}, ${totalSlots}, ${floor || null}, ${type})
    RETURNING *
  `
  const slotInserts = Array.from({ length: totalSlots }, (_, i) =>
    sql`INSERT INTO "ParkingSlot" (id, "slotNumber", "zoneId", status) VALUES (gen_random_uuid(), ${`${name}-${String(i + 1).padStart(3, '0')}`}, ${zone.id}, 'AVAILABLE')`
  )
  await Promise.all(slotInserts)
  return NextResponse.json(zone, { status: 201 })
}
