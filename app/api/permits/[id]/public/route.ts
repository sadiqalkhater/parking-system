import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

// Public endpoint behind the permit QR code. It must only expose what a gate guard needs to
// verify a permit — never national ID, phone, email, price or internal IDs.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [permit] = await sql`
    SELECT id, "permitNumber", type, status, "startDate", "endDate", "zoneAccess",
           "beneficiaryName", "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor"
    FROM "Permit" WHERE id = ${id}
  `
  if (!permit) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })
  return NextResponse.json(
    {
      id: permit.id,
      permitNumber: permit.permitNumber,
      type: permit.type,
      status: permit.status,
      startDate: permit.startDate,
      endDate: permit.endDate,
      zoneAccess: permit.zoneAccess,
      userName: permit.beneficiaryName,
      plateNumber: permit.plateNumber,
      brand: permit.vehicleBrand,
      model: permit.vehicleModel,
      color: permit.vehicleColor,
    },
    { headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } },
  )
}
