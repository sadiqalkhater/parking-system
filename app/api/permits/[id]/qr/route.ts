import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import QRCode from 'qrcode'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [permit] = await sql`SELECT * FROM "Permit" WHERE id = ${id}`
  if (!permit) return NextResponse.json({ error: 'التصريح غير موجود' }, { status: 404 })
  const baseUrl = req.headers.get('origin') || 'https://parking-system-iota-rust.vercel.app'
  const permitUrl = `${baseUrl}/permit/${id}`
  const qrImage = await QRCode.toDataURL(permitUrl, { width: 400, margin: 2, color: { dark: '#1e293b', light: '#ffffff' }, errorCorrectionLevel: 'H' })
  return NextResponse.json({ qr: qrImage, permit, url: permitUrl })
}
