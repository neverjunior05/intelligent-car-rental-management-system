import { db } from "@/db";
import { maintenanceRecords, vehicles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { transitionVehicleState } from "@/lib/services";

export const dynamic = "force-dynamic";

// GET — list all maintenance records with vehicle info.
export async function GET() {
  const guard = await requireRole(["maintenance", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const rows = await db
    .select({ record: maintenanceRecords, vehicle: vehicles })
    .from(maintenanceRecords)
    .leftJoin(vehicles, eq(maintenanceRecords.vehicleId, vehicles.id))
    .orderBy(desc(maintenanceRecords.createdAt));
  return Response.json({ records: rows });
}

// POST — schedule maintenance. Vehicle moves to "maintenance" (excluded from search).
export async function POST(req: Request) {
  const guard = await requireRole(["maintenance", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const body = await req.json();
  const vehicleId = Number(body.vehicleId);
  const [record] = await db
    .insert(maintenanceRecords)
    .values({
      vehicleId,
      description: body.description,
      cost: String(body.cost ?? 0),
      status: body.status ?? "scheduled",
      performedBy: guard.session.userId,
      serviceDate: body.serviceDate ? new Date(body.serviceDate) : new Date(),
    })
    .returning();

  // Take the vehicle out of availability when work is scheduled/in progress.
  const [v] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId));
  if (v && v.status !== "maintenance" && v.status !== "rented") {
    await transitionVehicleState(vehicleId, "maintenance");
  }
  return Response.json({ record });
}
