import { NextResponse } from 'next/server'
import { initDB } from '@/lib/init-db'
import { hashPassword } from '@/lib/auth'
import sql from '@/lib/db'

export async function GET() {
  try {
    await initDB()
    const [admin] = await sql`SELECT id FROM "User" WHERE email='admin@parking.com'`
    if (!admin) {
      const pass = await hashPassword('admin123')
      await sql`INSERT INTO "User" (id,name,email,password,role,"createdAt","updatedAt") VALUES (gen_random_uuid(),'مدير النظام','admin@parking.com',${pass},'ADMIN',NOW(),NOW())`
      const userPass = await hashPassword('user123')
      await sql`INSERT INTO "User" (id,name,email,password,role,"createdAt","updatedAt") VALUES (gen_random_uuid(),'أحمد محمد','user@parking.com',${userPass},'USER',NOW(),NOW())`
    }
    return NextResponse.json({ message: 'تم تهيئة قاعدة البيانات بنجاح ✅' })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
