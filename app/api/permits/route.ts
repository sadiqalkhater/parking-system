import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
  const permits = await prisma.permit.findMany({
    where: user.role === 'ADMIN' || user.role === 'MANAGER' ? {} : { userId: user.id },
    include: {
      user: { select: { name: true, email: true } },
      vehicle: { select: { plateNumber: true, brand: true, model: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(permits)
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { vehicleId, type, startDate, endDate, zoneAccess, price, userId } = await req.json()
  const permit = await prisma.permit.create({
    data: {
      userId: userId || user.id,
      vehicleId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      zoneAccess,
      price,
    },
    include: {
      user: { select: { name: true, email: true } },
      vehicle: { select: { plateNumber: true, brand: true } },
    },
  })
  return NextResponse.json(permit, { status: 201 })
}
