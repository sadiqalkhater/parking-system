import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [permit] = await sql`SELECT * FROM "Permit" WHERE id = ${id}`
  if (!permit) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })
  return NextResponse.json({
    ...permit,
    userName: permit.beneficiaryName,
    userPhone: permit.beneficiaryPhone,
    brand: permit.vehicleBrand,
    model: permit.vehicleModel,
    color: permit.vehicleColor,
  })
}
