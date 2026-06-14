import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    // Users table (system operators)
    await sql`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'USER',
        phone TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `

    // Beneficiaries table (permit holders)
    await sql`
      CREATE TABLE IF NOT EXISTS "Beneficiary" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        "nationalId" TEXT,
        department TEXT,
        notes TEXT,
        status TEXT DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "createdBy" TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "Vehicle" (
        id TEXT PRIMARY KEY,
        "plateNumber" TEXT UNIQUE NOT NULL,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        color TEXT NOT NULL,
        "userId" TEXT REFERENCES "User"(id),
        "beneficiaryId" TEXT REFERENCES "Beneficiary"(id),
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "ParkingZone" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "totalSlots" INT NOT NULL,
        floor TEXT,
        type TEXT NOT NULL DEFAULT 'REGULAR'
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "ParkingSlot" (
        id TEXT PRIMARY KEY,
        "slotNumber" TEXT NOT NULL,
        "zoneId" TEXT NOT NULL REFERENCES "ParkingZone"(id),
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        UNIQUE("slotNumber", "zoneId")
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "Permit" (
        id TEXT PRIMARY KEY,
        "permitNumber" TEXT UNIQUE NOT NULL,
        "userId" TEXT REFERENCES "User"(id),
        "beneficiaryId" TEXT REFERENCES "Beneficiary"(id),
        "vehicleId" TEXT NOT NULL REFERENCES "Vehicle"(id),
        type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "zoneAccess" TEXT,
        price FLOAT NOT NULL,
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "renewedFrom" TEXT
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "Reservation" (
        id TEXT PRIMARY KEY,
        "userId" TEXT REFERENCES "User"(id),
        "vehicleId" TEXT NOT NULL REFERENCES "Vehicle"(id),
        "slotId" TEXT NOT NULL REFERENCES "ParkingSlot"(id),
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        "totalPrice" FLOAT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS "AccessLog" (
        id TEXT PRIMARY KEY,
        "vehicleId" TEXT NOT NULL REFERENCES "Vehicle"(id),
        "slotId" TEXT REFERENCES "ParkingSlot"(id),
        "entryTime" TIMESTAMP DEFAULT NOW(),
        "exitTime" TIMESTAMP,
        method TEXT DEFAULT 'MANUAL'
      )
    `

    // Seed admin user
    const [admin] = await sql`SELECT id FROM "User" WHERE email='admin@parking.com'`
    if (!admin) {
      const pass = await hashPassword('admin123')
      await sql`INSERT INTO "User" (id,name,email,password,role,"createdAt","updatedAt") VALUES (gen_random_uuid(),'مدير النظام','admin@parking.com',${pass},'ADMIN',NOW(),NOW())`
      const userPass = await hashPassword('user123')
      await sql`INSERT INTO "User" (id,name,email,password,role,"createdAt","updatedAt") VALUES (gen_random_uuid(),'مشغّل النظام','user@parking.com',${userPass},'USER',NOW(),NOW())`
    }

    return NextResponse.json({ message: 'تم تهيئة قاعدة البيانات بنجاح ✅' })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
