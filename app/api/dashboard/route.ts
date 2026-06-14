import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const [[{ count: totalUsers }], [{ count: totalVehicles }], [{ count: totalPermits }], [{ count: activePermits }], [{ count: totalReservations }], [{ count: todayReservations }], [{ count: totalSlots }], [{ count: occupiedSlots }]] = await Promise.all([
    sql`SELECT COUNT(*)::int FROM "User"`,
    sql`SELECT COUNT(*)::int FROM "Vehicle"`,
    sql`SELECT COUNT(*)::int FROM "Permit"`,
    sql`SELECT COUNT(*)::int FROM "Permit" WHERE status='ACTIVE'`,
    sql`SELECT COUNT(*)::int FROM "Reservation"`,
    sql`SELECT COUNT(*)::int FROM "Reservation" WHERE "startTime" >= CURRENT_DATE AND status='CONFIRMED'`,
    sql`SELECT COUNT(*)::int FROM "ParkingSlot"`,
    sql`SELECT COUNT(*)::int FROM "ParkingSlot" WHERE status='OCCUPIED'`,
  ])
  const recentReservations = await sql`
    SELECT r.*, u.name as "userName", v."plateNumber", ps."slotNumber", pz.name as "zoneName"
    FROM "Reservation" r JOIN "User" u ON r."userId"=u.id JOIN "Vehicle" v ON r."vehicleId"=v.id
    JOIN "ParkingSlot" ps ON r."slotId"=ps.id JOIN "ParkingZone" pz ON ps."zoneId"=pz.id
    ORDER BY r."createdAt" DESC LIMIT 5
  `
  return NextResponse.json({
    stats: { totalUsers, totalVehicles, totalPermits, activePermits, totalReservations, todayReservations, totalSlots, occupiedSlots, availableSlots: totalSlots - occupiedSlots },
    recentReservations: recentReservations.map(r => ({ ...r, user: { name: r.userName }, vehicle: { plateNumber: r.plateNumber }, slot: { slotNumber: r.slotNumber, zone: { name: r.zoneName } } })),
  })
}
