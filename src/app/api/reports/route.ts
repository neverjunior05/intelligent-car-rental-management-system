import { db } from "@/db";
import { bookings, vehicles, maintenanceRecords, invoices } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Module 9 — admin-only aggregation reports.
export async function GET() {
  const guard = await requireRole(["admin"]);
  if (!guard.ok) return guard.response;

  const [{ count: totalBookings }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(bookings);

  const [{ count: availableVehicles }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(vehicles)
    .where(eq(vehicles.status, "available"));

  const [{ count: rentedVehicles }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(vehicles)
    .where(eq(vehicles.status, "rented"));

  const [{ count: maintenanceCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(maintenanceRecords);

  const [{ revenue }] = await db
    .select({ revenue: sql<string>`coalesce(sum(${invoices.totalAmount}), 0)` })
    .from(invoices);

  // Bookings grouped by status (for a chart).
  const byStatus = await db
    .select({
      status: bookings.status,
      count: sql<number>`count(*)::int`,
    })
    .from(bookings)
    .groupBy(bookings.status);

  // Vehicle utilization: bookings per vehicle.
  const utilization = await db
    .select({
      vehicle: sql<string>`${vehicles.make} || ' ' || ${vehicles.model}`,
      count: sql<number>`count(${bookings.id})::int`,
    })
    .from(vehicles)
    .leftJoin(bookings, eq(bookings.vehicleId, vehicles.id))
    .groupBy(vehicles.id, vehicles.make, vehicles.model);

  return Response.json({
    totalBookings,
    availableVehicles,
    rentedVehicles,
    maintenanceCount,
    revenue: Number(revenue),
    byStatus,
    utilization,
  });
}
