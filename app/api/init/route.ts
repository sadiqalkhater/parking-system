import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function GET() {
  try {
    // Drop old tables and recreate clean
    await sql`DROP TABLE IF EXISTS "PermitV2" CASCADE`
    await sql`DROP TABLE IF EXISTS "Permit" CASCADE`
    await sql`DROP TABLE IF EXISTS "Beneficiary" CASCADE`
    await sql`DROP TABLE IF EXISTS "AccessLog" CASCADE`
    await sql`DROP TABLE IF EXISTS "Reservation" CASCADE`
    await sql`DROP TABLE IF EXISTS "Vehicle" CASCADE`
    await sql`DROP TABLE IF EXISTS "ParkingSlot" CASCADE`
    await sql`DROP TABLE IF EXISTS "ParkingZone" CASCADE`
    await sql`DROP TABLE IF EXISTS "User" CASCADE`

    // Users (system operators)
    await sql`CREATE TABLE "User" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN','MANAGER','USER')),
      phone TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )`

    // Parking Zones
    await sql`CREATE TABLE "ParkingZone" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      description TEXT,
      "totalSlots" INT NOT NULL DEFAULT 0,
      floor TEXT,
      type TEXT NOT NULL DEFAULT 'REGULAR' CHECK (type IN ('REGULAR','VIP','DISABLED','LARGE')),
      "createdAt" TIMESTAMP DEFAULT NOW()
    )`

    // Parking Slots
    await sql`CREATE TABLE "ParkingSlot" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "slotNumber" TEXT NOT NULL,
      "zoneId" TEXT NOT NULL REFERENCES "ParkingZone"(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','OCCUPIED','RESERVED','MAINTENANCE')),
      UNIQUE("slotNumber", "zoneId")
    )`

    // Permits (unified - includes beneficiary + vehicle + slot)
    await sql`CREATE TABLE "Permit" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "permitNumber" TEXT UNIQUE NOT NULL DEFAULT CONCAT('P-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD((FLOOR(RANDOM()*9999))::text, 4, '0')),
      "createdBy" TEXT REFERENCES "User"(id),
      
      -- Beneficiary info
      "beneficiaryName" TEXT NOT NULL,
      "beneficiaryPhone" TEXT,
      "beneficiaryNationalId" TEXT,
      department TEXT,
      
      -- Vehicle info  
      "plateNumber" TEXT NOT NULL,
      "vehicleBrand" TEXT,
      "vehicleModel" TEXT,
      "vehicleColor" TEXT,
      
      -- Permit details
      type TEXT NOT NULL CHECK (type IN ('DAILY','MONTHLY','YEARLY','VISITOR')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','SUSPENDED','CANCELLED')),
      "startDate" DATE NOT NULL,
      "endDate" DATE NOT NULL,
      price FLOAT NOT NULL DEFAULT 0,
      
      -- Parking location
      "zoneId" TEXT REFERENCES "ParkingZone"(id),
      "slotId" TEXT REFERENCES "ParkingSlot"(id),
      "zoneAccess" TEXT,
      "parkingSlot" TEXT,
      
      notes TEXT,
      "renewedFrom" TEXT REFERENCES "Permit"(id),
      "createdAt" TIMESTAMP DEFAULT NOW()
    )`

    // Access Logs
    await sql`CREATE TABLE "AccessLog" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "permitId" TEXT REFERENCES "Permit"(id),
      "plateNumber" TEXT NOT NULL,
      "slotId" TEXT REFERENCES "ParkingSlot"(id),
      action TEXT NOT NULL CHECK (action IN ('ENTRY','EXIT')),
      method TEXT DEFAULT 'MANUAL',
      notes TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "createdBy" TEXT REFERENCES "User"(id)
    )`

    // =====================
    // SEED DATA
    // =====================

    // Create users
    const adminPass = await hashPassword('admin123')
    const managerPass = await hashPassword('manager123')
    const userPass = await hashPassword('user123')

    const [admin] = await sql`
      INSERT INTO "User" (name, email, password, role, phone)
      VALUES ('مدير النظام', 'admin@parking.com', ${adminPass}, 'ADMIN', '0500000001')
      RETURNING id
    `
    const [manager] = await sql`
      INSERT INTO "User" (name, email, password, role, phone)
      VALUES ('أحمد الزهراني', 'manager@parking.com', ${managerPass}, 'MANAGER', '0500000002')
      RETURNING id
    `
    const [user1] = await sql`
      INSERT INTO "User" (name, email, password, role, phone)
      VALUES ('محمد العتيبي', 'user@parking.com', ${userPass}, 'USER', '0500000003')
      RETURNING id
    `

    // Create parking zones
    const [zoneA] = await sql`
      INSERT INTO "ParkingZone" (name, description, "totalSlots", floor, type)
      VALUES ('A', 'المنطقة الرئيسية - الطابق الأرضي', 20, 'الأرضي', 'REGULAR')
      RETURNING id
    `
    const [zoneB] = await sql`
      INSERT INTO "ParkingZone" (name, description, "totalSlots", floor, type)
      VALUES ('B', 'منطقة VIP - الطابق الأول', 10, 'الأول', 'VIP')
      RETURNING id
    `
    const [zoneC] = await sql`
      INSERT INTO "ParkingZone" (name, description, "totalSlots", floor, type)
      VALUES ('C', 'منطقة ذوي الاحتياجات الخاصة', 5, 'الأرضي', 'DISABLED')
      RETURNING id
    `

    // Create slots for zone A
    for (let i = 1; i <= 20; i++) {
      const status = i <= 14 ? 'AVAILABLE' : i <= 17 ? 'OCCUPIED' : 'RESERVED'
      await sql`INSERT INTO "ParkingSlot" ("slotNumber", "zoneId", status) VALUES (${`A-${String(i).padStart(3,'0')}`}, ${zoneA.id}, ${status})`
    }
    // Create slots for zone B
    for (let i = 1; i <= 10; i++) {
      const status = i <= 7 ? 'AVAILABLE' : 'OCCUPIED'
      await sql`INSERT INTO "ParkingSlot" ("slotNumber", "zoneId", status) VALUES (${`B-${String(i).padStart(3,'0')}`}, ${zoneB.id}, ${status})`
    }
    // Create slots for zone C
    for (let i = 1; i <= 5; i++) {
      await sql`INSERT INTO "ParkingSlot" ("slotNumber", "zoneId", status) VALUES (${`C-${String(i).padStart(3,'0')}`}, ${zoneC.id}, 'AVAILABLE')`
    }

    // Get some slots for permits
    const [slotA1] = await sql`SELECT id FROM "ParkingSlot" WHERE "slotNumber"='A-001' AND "zoneId"=${zoneA.id}`
    const [slotA2] = await sql`SELECT id FROM "ParkingSlot" WHERE "slotNumber"='A-002' AND "zoneId"=${zoneA.id}`
    const [slotA3] = await sql`SELECT id FROM "ParkingSlot" WHERE "slotNumber"='A-003' AND "zoneId"=${zoneA.id}`
    const [slotB1] = await sql`SELECT id FROM "ParkingSlot" WHERE "slotNumber"='B-001' AND "zoneId"=${zoneB.id}`
    const [slotB2] = await sql`SELECT id FROM "ParkingSlot" WHERE "slotNumber"='B-002' AND "zoneId"=${zoneB.id}`

    // Create sample permits
    await sql`INSERT INTO "Permit" (
      "permitNumber", "createdBy", "beneficiaryName", "beneficiaryPhone", "beneficiaryNationalId", department,
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price, "zoneId", "slotId", "zoneAccess", "parkingSlot"
    ) VALUES (
      'P-20260601-0001', ${admin.id}, 'خالد بن سعد الشمري', '0501234567', '1023456789', 'الإدارة العامة',
      'أ ب ج 1234', 'تويوتا', 'كامري', 'أبيض',
      'MONTHLY', 'ACTIVE', '2026-06-01', '2026-06-30', 300,
      ${zoneA.id}, ${slotA1.id}, 'A', 'A-001'
    )`

    await sql`INSERT INTO "Permit" (
      "permitNumber", "createdBy", "beneficiaryName", "beneficiaryPhone", "beneficiaryNationalId", department,
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price, "zoneId", "slotId", "zoneAccess", "parkingSlot"
    ) VALUES (
      'P-20260601-0002', ${admin.id}, 'سارة أحمد العمري', '0507654321', '1098765432', 'الموارد البشرية',
      'د هـ و 5678', 'هوندا', 'سيفيك', 'فضي',
      'YEARLY', 'ACTIVE', '2026-01-01', '2026-12-31', 2000,
      ${zoneB.id}, ${slotB1.id}, 'B', 'B-001'
    )`

    await sql`INSERT INTO "Permit" (
      "permitNumber", "createdBy", "beneficiaryName", "beneficiaryPhone", "beneficiaryNationalId", department,
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price, "zoneId", "slotId", "zoneAccess", "parkingSlot"
    ) VALUES (
      'P-20260601-0003', ${manager.id}, 'محمد عبدالله القحطاني', '0512345678', '1087654321', 'تقنية المعلومات',
      'ز ح ط 9012', 'نيسان', 'باترول', 'أسود',
      'MONTHLY', 'ACTIVE', '2026-06-01', '2026-06-30', 300,
      ${zoneA.id}, ${slotA2.id}, 'A', 'A-002'
    )`

    await sql`INSERT INTO "Permit" (
      "permitNumber", "createdBy", "beneficiaryName", "beneficiaryPhone",
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price, "zoneId", "slotId", "zoneAccess", "parkingSlot"
    ) VALUES (
      'P-20260601-0004', ${manager.id}, 'فاطمة سعد الدوسري', '0523456789',
      'ي ك ل 3456', 'لكزس', 'ES350', 'بيج',
      'MONTHLY', 'ACTIVE', '2026-06-01', '2026-06-30', 500,
      ${zoneB.id}, ${slotB2.id}, 'B', 'B-002'
    )`

    await sql`INSERT INTO "Permit" (
      "permitNumber", "createdBy", "beneficiaryName", "beneficiaryPhone", "beneficiaryNationalId",
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price, "zoneAccess", "parkingSlot"
    ) VALUES (
      'P-20260501-0099', ${user1.id}, 'عمر فهد المالكي', '0534567890', '1076543210',
      'م ن س 7890', 'كيا', 'سبورتاج', 'رمادي',
      'MONTHLY', 'EXPIRED', '2026-05-01', '2026-05-31', 300,
      'A', 'A-003'
    )`

    await sql`INSERT INTO "Permit" (
      "permitNumber", "createdBy", "beneficiaryName", "beneficiaryPhone",
      "plateNumber", "vehicleBrand", "vehicleModel", "vehicleColor",
      type, status, "startDate", "endDate", price, "zoneAccess"
    ) VALUES (
      'P-20260614-0010', ${admin.id}, 'زائر — شركة الأمل', '0545678901',
      'ع غ ف 1122', 'شيفروليه', 'تاهو', 'أبيض',
      'VISITOR', 'ACTIVE', '2026-06-14', '2026-06-14', 20,
      'A'
    )`

    // Add some access logs
    const [p1] = await sql`SELECT id FROM "Permit" WHERE "permitNumber"='P-20260601-0001'`
    if (p1) {
      await sql`INSERT INTO "AccessLog" ("permitId", "plateNumber", action, method, "createdBy") VALUES (${p1.id}, 'أ ب ج 1234', 'ENTRY', 'QR', ${admin.id})`
    }

    return NextResponse.json({
      message: 'تم تهيئة قاعدة البيانات بنجاح ✅',
      data: {
        users: 3,
        zones: 3,
        slots: 35,
        permits: 6,
      }
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
