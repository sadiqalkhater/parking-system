import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  try { return verifyToken(auth.replace('Bearer ', '')) as { id: string; role: string } }
  catch { return null }
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { permitId, startDate, endDate, price } = await req.json()
  const [original] = await sql`SELECT * FROM "Permit" WHERE id = ${permitId}`
  if (!original) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })
  await sql`UPDATE "Permit" SET status='CANCELLED' WHERE id=${permitId}`
  if (original.slotId) await sql`UPDATE "ParkingSlot" SET status='AVAILABLE' WHERE id=${original.slotId}`
  const permitNumber = `P-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`
  const [newPermit] = await sql`
    INSERT INTO "Permit" (
      "permitNumber", "createdBy", "beneficiaryName", "beneficiaryPhone", "beneficiaryNationalId", department,
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price, "zoneId", "slotId", "zoneAccess", "parkingSlot", "renewedFrom"
    ) VALUES (
      ${permitNumber}, ${user.id}, ${original.beneficiaryName}, ${original.beneficiaryPhone},
      ${original.beneficiaryNationalId}, ${original.department},
      ${original.plateNumber}, ${original.vehicleBrand}, ${original.vehicleModel}, ${original.vehicleColor},
      ${original.type}, 'ACTIVE', ${startDate}, ${endDate}, ${price||original.price},
      ${original.zoneId}, ${original.slotId}, ${original.zoneAccess}, ${original.parkingSlot}, ${permitId}
    ) RETURNING *
  `
  return NextResponse.json(newPermit, { status: 201 })
}
