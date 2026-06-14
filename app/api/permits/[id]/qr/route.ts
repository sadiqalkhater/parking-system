import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import QRCode from 'qrcode'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [permit] = await sql`
    SELECT p.*, u.name as "userName", v."plateNumber", v.brand
    FROM "Permit" p 
    JOIN "User" u ON p."userId" = u.id 
    JOIN "Vehicle" v ON p."vehicleId" = v.id
    WHERE p.id = ${id}
  `
  if (!permit) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })

  const qrData = JSON.stringify({
    permitId: permit.id,
    permitNumber: permit.permitNumber,
    plateNumber: permit.plateNumber,
    userName: permit.userName,
    type: permit.type,
    status: permit.status,
    startDate: permit.startDate,
    endDate: permit.endDate,
  })

  const qrImage = await QRCode.toDataURL(qrData, {
    width: 300,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
  })

  return NextResponse.json({ qr: qrImage, permit })
}
