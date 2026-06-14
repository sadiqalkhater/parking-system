import sql from './db'

export async function initDB() {
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
  await sql`
    CREATE TABLE IF NOT EXISTS "Vehicle" (
      id TEXT PRIMARY KEY,
      "plateNumber" TEXT UNIQUE NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      color TEXT NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "User"(id),
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
      "userId" TEXT NOT NULL REFERENCES "User"(id),
      "vehicleId" TEXT NOT NULL REFERENCES "Vehicle"(id),
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      "startDate" TIMESTAMP NOT NULL,
      "endDate" TIMESTAMP NOT NULL,
      "zoneAccess" TEXT,
      price FLOAT NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS "Reservation" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"(id),
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
      "slotId" TEXT,
      "entryTime" TIMESTAMP DEFAULT NOW(),
      "exitTime" TIMESTAMP,
      method TEXT DEFAULT 'MANUAL'
    )
  `
}
