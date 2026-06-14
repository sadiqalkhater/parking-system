import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 })

    const valid = await verifyPassword(password, user.password)
    if (!valid) return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 401 })

    const token = generateToken({ id: user.id, email: user.email, role: user.role })
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ token, user: userWithoutPassword })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
