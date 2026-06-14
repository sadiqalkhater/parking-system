import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin
  const adminPass = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@parking.com' },
    update: {},
    create: { name: 'مدير النظام', email: 'admin@parking.com', password: adminPass, role: 'ADMIN', phone: '0500000001' },
  })

  // Create regular user
  const userPass = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@parking.com' },
    update: {},
    create: { name: 'أحمد محمد', email: 'user@parking.com', password: userPass, role: 'USER', phone: '0500000002' },
  })

  // Create parking zones
  const zoneA = await prisma.parkingZone.upsert({
    where: { id: 'zone-a' },
    update: {},
    create: {
      id: 'zone-a', name: 'A', description: 'المنطقة الرئيسية', totalSlots: 20, floor: 'الأرضي', type: 'REGULAR',
      slots: { create: Array.from({ length: 20 }, (_, i) => ({ slotNumber: `A-${String(i + 1).padStart(3, '0')}`, status: i < 12 ? 'AVAILABLE' : 'OCCUPIED' })) },
    },
  })

  await prisma.parkingZone.upsert({
    where: { id: 'zone-b' },
    update: {},
    create: {
      id: 'zone-b', name: 'B', description: 'منطقة VIP', totalSlots: 10, floor: 'الأول', type: 'VIP',
      slots: { create: Array.from({ length: 10 }, (_, i) => ({ slotNumber: `B-${String(i + 1).padStart(3, '0')}`, status: 'AVAILABLE' })) },
    },
  })

  // Create vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { plateNumber: 'أ ب ج 1234' },
    update: {},
    create: { plateNumber: 'أ ب ج 1234', brand: 'تويوتا', model: 'كامري', color: 'أبيض', userId: user.id },
  })

  // Create permit
  await prisma.permit.create({
    data: {
      userId: user.id, vehicleId: vehicle.id, type: 'MONTHLY',
      startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      price: 300, status: 'ACTIVE', zoneAccess: 'A',
    },
  })

  console.log('✅ Seed data created successfully')
  console.log('👤 Admin:', admin.email, '/ admin123')
  console.log('👤 User:', user.email, '/ user123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
