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
  const permits = await sql`
    SELECT p.*, u.name as "createdByName"
    FROM "Permit" p
    LEFT JOIN "User" u ON p."createdBy" = u.id
    ORDER BY p."createdAt" DESC
  `
  return NextResponse.json(permits.map(p => ({
    ...p,
    userName: p.beneficiaryName,
    userPhone: p.beneficiaryPhone,
    vehicleBrand: p.vehicleBrand,
    vehicleModel: p.vehicleModel,
    vehicleColor: p.vehicleColor,
  })))
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const { beneficiaryName, beneficiaryPhone, beneficiaryId, department,
    plateNumber, vehicleBrand, vehicleModel, vehicleColor,
    type, startDate, endDate, price, zoneId, slotId } = await req.json()

  if (!beneficiaryName?.trim()) return NextResponse.json({ error: 'اسم المستفيد مطلوب' }, { status: 400 })
  if (!plateNumber?.trim()) return NextResponse.json({ error: 'رقم اللوحة مطلوب' }, { status: 400 })
  if (!startDate || !endDate) return NextResponse.json({ error: 'تواريخ التصريح مطلوبة' }, { status: 400 })
  if (!price || price <= 0) return NextResponse.json({ error: 'الرسوم مطلوبة' }, { status: 400 })

  let parkingSlot = null
  let zoneAccess = null
  let resolvedZoneId = zoneId || null
  let resolvedSlotId = slotId || null

  if (slotId) {
    const [slot] = await sql`
      SELECT ps."slotNumber", ps.status, pz.name as "zoneName", pz.id as "zoneId"
      FROM "ParkingSlot" ps JOIN "ParkingZone" pz ON ps."zoneId"=pz.id
      WHERE ps.id = ${slotId}
    `
    if (!slot) return NextResponse.json({ error: 'الموقف غير موجود' }, { status: 400 })
    if (slot.status === 'OCCUPIED') return NextResponse.json({ error: 'هذا الموقف مشغول' }, { status: 400 })
    parkingSlot = `${slot.zoneName}-${slot.slotNumber}`
    zoneAccess = slot.zoneName
    resolvedZoneId = slot.zoneId
    await sql`UPDATE "ParkingSlot" SET status='RESERVED' WHERE id=${slotId}`
  } else if (zoneId) {
    const [zone] = await sql`SELECT name FROM "ParkingZone" WHERE id=${zoneId}`
    if (zone) zoneAccess = zone.name
  }

  const permitNumber = `P-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`

  const [permit] = await sql`
    INSERT INTO "Permit" (
      "permitNumber", "createdBy",
      "beneficiaryName", "beneficiaryPhone", "beneficiaryNationalId", department,
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price,
      "zoneId", "slotId", "zoneAccess", "parkingSlot"
    ) VALUES (
      ${permitNumber}, ${user.id},
      ${beneficiaryName.trim()}, ${beneficiaryPhone||null}, ${beneficiaryId||null}, ${department||null},
      ${plateNumber.trim()}, ${vehicleBrand||null}, ${vehicleModel||null}, ${vehicleColor||null},
      ${type}, 'ACTIVE', ${startDate}, ${endDate}, ${price},
      ${resolvedZoneId}, ${resolvedSlotId}, ${zoneAccess}, ${parkingSlot}
    ) RETURNING *
  `
  return NextResponse.json(permit, { status: 201 })
}
