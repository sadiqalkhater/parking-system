import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalUsers, totalVehicles, totalPermits, activePermits, totalReservations, todayReservations, totalSlots, occupiedSlots] = await Promise.all([
    prisma.user.count(),
    prisma.vehicle.count(),
    prisma.permit.count(),
    prisma.permit.count({ where: { status: 'ACTIVE' } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { startTime: { gte: new Date(new Date().setHours(0,0,0,0)) }, status: 'CONFIRMED' } }),
    prisma.parkingSlot.count(),
    prisma.parkingSlot.count({ where: { status: 'OCCUPIED' } }),
  ])

  const recentReservations = await prisma.reservation.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } },
      vehicle: { select: { plateNumber: true } },
      slot: { include: { zone: { select: { name: true } } } },
    },
  })

  return NextResponse.json({
    stats: { totalUsers, totalVehicles, totalPermits, activePermits, totalReservations, todayReservations, totalSlots, occupiedSlots, availableSlots: totalSlots - occupiedSlots },
    recentReservations,
  })
}
