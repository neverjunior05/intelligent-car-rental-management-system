import { db } from "@/db";
import { maintenanceRecords, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { transitionVehicleState } from "@/lib/services";

// PATCH — update maintenance status. Completing it returns the vehicle to service.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(["maintenance", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const body = await req.json();
  const [record] = await db
    .update(maintenanceRecords)
    .set({
      status: body.status,
      ...(body.cost !== undefined ? { cost: String(body.cost) } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
    })
    .where(eq(maintenanceRecords.id, Number(id)))
    .returning();

  if (body.status === "completed" && record) {
    const [v] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, record.vehicleId));
    if (v?.status === "maintenance") {
      await transitionVehicleState(record.vehicleId, "available");
    }
  }
  return Response.json({ record });
}
