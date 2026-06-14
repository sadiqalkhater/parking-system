import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { hashPassword } from '@/lib/auth'

function getUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  try { return verifyToken(auth.replace('Bearer ', '')) as { id: string; role: string } }
  catch { return null }
}

export async function GET(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const beneficiaries = await sql`
    SELECT b.*, 
      COUNT(DISTINCT p.id) as "permitCount",
      COUNT(DISTINCT v.id) as "vehicleCount"
    FROM "Beneficiary" b
    LEFT JOIN "Permit" p ON p."beneficiaryId" = b.id
    LEFT JOIN "Vehicle" v ON v."beneficiaryId" = b.id
    GROUP BY b.id
    ORDER BY b."createdAt" DESC
  `
  return NextResponse.json(beneficiaries)
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { name, phone, email, nationalId, department, notes } = await req.json()
  try {
    const [beneficiary] = await sql`
      INSERT INTO "Beneficiary" (id, name, phone, email, "nationalId", department, notes, "createdAt", "createdBy")
      VALUES (gen_random_uuid(), ${name}, ${phone || null}, ${email || null}, ${nationalId || null}, ${department || null}, ${notes || null}, NOW(), ${user.id})
      RETURNING *
    `
    return NextResponse.json(beneficiary, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'حدث خطأ أثناء الإضافة' }, { status: 400 })
  }
}
