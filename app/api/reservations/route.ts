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
  const reservations = await prisma.reservation.findMany({
    where: user.role === 'ADMIN' || user.role === 'MANAGER' ? {} : { userId: user.id },
    include: {
      user: { select: { name: true, email: true } },
      vehicle: { select: { plateNumber: true, brand: true, model: true } },
      slot: { include: { zone: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reservations)
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { vehicleId, slotId, startTime, endTime, totalPrice } = await req.json()

  // Check for conflicts
  const conflict = await prisma.reservation.findFirst({
    where: {
      slotId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        { startTime: { lte: new Date(startTime) }, endTime: { gte: new Date(startTime) } },
        { startTime: { lte: new Date(endTime) }, endTime: { gte: new Date(endTime) } },
      ],
    },
  })
  if (conflict) return NextResponse.json({ error: 'الموقف محجوز في هذا الوقت' }, { status: 400 })

  const reservation = await prisma.reservation.create({
    data: {
      userId: user.id,
      vehicleId,
      slotId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalPrice,
      status: 'CONFIRMED',
    },
    include: {
      slot: { include: { zone: true } },
      vehicle: { select: { plateNumber: true } },
    },
  })
  return NextResponse.json(reservation, { status: 201 })
}
