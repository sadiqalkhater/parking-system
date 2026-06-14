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

  // Cancel old permit
  await sql`UPDATE "Permit" SET status = 'CANCELLED' WHERE id = ${permitId}`

  // Issue new permit
  const [newPermit] = await sql`
    INSERT INTO "Permit" (id, "permitNumber", "userId", "beneficiaryId", "vehicleId", type, status, "startDate", "endDate", "zoneAccess", price, "renewedFrom", "createdAt")
    VALUES (gen_random_uuid(), gen_random_uuid(), ${original.userId}, ${original.beneficiaryId}, ${original.vehicleId}, ${original.type}, 'ACTIVE', ${startDate}, ${endDate}, ${original.zoneAccess}, ${price || original.price}, ${permitId}, NOW())
    RETURNING *
  `
  return NextResponse.json(newPermit, { status: 201 })
}
