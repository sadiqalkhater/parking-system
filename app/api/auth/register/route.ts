import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone, role } = await req.json()
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'البريد الإلكتروني مستخدم مسبقاً' }, { status: 400 })

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone, role: role || 'USER' },
    })
    const token = generateToken({ id: user.id, email: user.email, role: user.role })
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({ token, user: userWithoutPassword }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 })
  }
}
