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
  const rows = user.role === 'ADMIN' || user.role === 'MANAGER'
    ? await sql`SELECT r.*, u.name as "userName", v."plateNumber", v.brand, v.model, ps."slotNumber", pz.name as "zoneName" FROM "Reservation" r JOIN "User" u ON r."userId"=u.id JOIN "Vehicle" v ON r."vehicleId"=v.id JOIN "ParkingSlot" ps ON r."slotId"=ps.id JOIN "ParkingZone" pz ON ps."zoneId"=pz.id ORDER BY r."createdAt" DESC`
    : await sql`SELECT r.*, u.name as "userName", v."plateNumber", v.brand, v.model, ps."slotNumber", pz.name as "zoneName" FROM "Reservation" r JOIN "User" u ON r."userId"=u.id JOIN "Vehicle" v ON r."vehicleId"=v.id JOIN "ParkingSlot" ps ON r."slotId"=ps.id JOIN "ParkingZone" pz ON ps."zoneId"=pz.id WHERE r."userId"=${user.id} ORDER BY r."createdAt" DESC`
  return NextResponse.json(rows.map(r => ({ ...r, user: { name: r.userName }, vehicle: { plateNumber: r.plateNumber, brand: r.brand, model: r.model }, slot: { slotNumber: r.slotNumber, zone: { name: r.zoneName } } })))
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { vehicleId, slotId, startTime, endTime, totalPrice } = await req.json()
  const [conflict] = await sql`SELECT id FROM "Reservation" WHERE "slotId"=${slotId} AND status IN ('PENDING','CONFIRMED') AND ("startTime" <= ${startTime} AND "endTime" >= ${startTime})`
  if (conflict) return NextResponse.json({ error: 'الموقف محجوز في هذا الوقت' }, { status: 400 })
  const [reservation] = await sql`
    INSERT INTO "Reservation" (id, "userId", "vehicleId", "slotId", "startTime", "endTime", status, "totalPrice", "createdAt")
    VALUES (gen_random_uuid(), ${user.id}, ${vehicleId}, ${slotId}, ${startTime}, ${endTime}, 'CONFIRMED', ${totalPrice}, NOW())
    RETURNING *
  `
  return NextResponse.json(reservation, { status: 201 })
}
