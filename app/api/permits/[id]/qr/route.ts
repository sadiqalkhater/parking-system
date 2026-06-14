import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import QRCode from 'qrcode'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [permit] = await sql`
    SELECT p.*, u.name as "userName", v."plateNumber", v.brand, v.model, v.color
    FROM "Permit" p
    JOIN "User" u ON p."userId" = u.id
    JOIN "Vehicle" v ON p."vehicleId" = v.id
    WHERE p.id = ${id}
  `
  if (!permit) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })

  // QR points to the public permit verification page
  const baseUrl = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'https://parking-system-iota-rust.vercel.app'
  const permitUrl = `${baseUrl}/permit/${id}`

  const qrImage = await QRCode.toDataURL(permitUrl, {
    width: 400,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })

  return NextResponse.json({ qr: qrImage, permit, url: permitUrl })
}
