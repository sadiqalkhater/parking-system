import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const zones = await prisma.parkingZone.findMany({
    include: {
      slots: { include: { reservations: { where: { status: { in: ['PENDING', 'CONFIRMED'] } } } } },
    },
  })
  return NextResponse.json(zones)
}

export async function POST(req: NextRequest) {
  const { name, description, totalSlots, floor, type } = await req.json()
  const zone = await prisma.parkingZone.create({
    data: {
      name, description, totalSlots, floor, type,
      slots: {
        create: Array.from({ length: totalSlots }, (_, i) => ({
          slotNumber: `${name}-${String(i + 1).padStart(3, '0')}`,
          status: 'AVAILABLE',
        })),
      },
    },
    include: { slots: true },
  })
  return NextResponse.json(zone, { status: 201 })
}
