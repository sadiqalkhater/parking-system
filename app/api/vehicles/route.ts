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
  const vehicles = await prisma.vehicle.findMany({
    where: user.role === 'ADMIN' || user.role === 'MANAGER' ? {} : { userId: user.id },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(vehicles)
}

export async function POST(req: NextRequest) {
  const user = getUser(req)
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const { plateNumber, brand, model, color, userId } = await req.json()
  try {
    const vehicle = await prisma.vehicle.create({
      data: { plateNumber, brand, model, color, userId: userId || user.id },
    })
    return NextResponse.json(vehicle, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'رقم اللوحة مستخدم مسبقاً' }, { status: 400 })
  }
}
