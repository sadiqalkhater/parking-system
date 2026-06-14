import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET() {
  const [[{ count: totalUsers }], [{ count: totalPermits }], [{ count: activePermits }], [{ count: expiredPermits }], [{ count: totalSlots }], [{ count: availableSlots }], [{ count: occupiedSlots }]] = await Promise.all([
    sql`SELECT COUNT(*)::int FROM "User"`,
    sql`SELECT COUNT(*)::int FROM "Permit"`,
    sql`SELECT COUNT(*)::int FROM "Permit" WHERE status='ACTIVE' AND "endDate" >= CURRENT_DATE`,
    sql`SELECT COUNT(*)::int FROM "Permit" WHERE status='ACTIVE' AND "endDate" < CURRENT_DATE`,
    sql`SELECT COUNT(*)::int FROM "ParkingSlot"`,
    sql`SELECT COUNT(*)::int FROM "ParkingSlot" WHERE status='AVAILABLE'`,
    sql`SELECT COUNT(*)::int FROM "ParkingSlot" WHERE status='OCCUPIED'`,
  ])

  const recentPermits = await sql`
    SELECT p.id, p."permitNumber", p."beneficiaryName", p."plateNumber", 
           p.type, p.status, p."endDate", p."parkingSlot", p.price,
           u.name as "createdByName"
    FROM "Permit" p
    LEFT JOIN "User" u ON p."createdBy" = u.id
    ORDER BY p."createdAt" DESC LIMIT 6
  `

  const zoneStats = await sql`
    SELECT pz.name, pz.type,
      COUNT(ps.id)::int as total,
      COUNT(ps.id) FILTER (WHERE ps.status='AVAILABLE')::int as available,
      COUNT(ps.id) FILTER (WHERE ps.status='OCCUPIED')::int as occupied,
      COUNT(ps.id) FILTER (WHERE ps.status='RESERVED')::int as reserved
    FROM "ParkingZone" pz
    LEFT JOIN "ParkingSlot" ps ON ps."zoneId" = pz.id
    GROUP BY pz.id, pz.name, pz.type
    ORDER BY pz.name
  `

  return NextResponse.json({
    stats: { totalUsers, totalPermits, activePermits, expiredPermits, totalSlots, availableSlots, occupiedSlots },
    recentPermits,
    zoneStats,
  })
}
