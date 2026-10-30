import { getVehiclesCollection, getDamageCollection, getMaintenanceCollection } from "@/lib/mongodb";
import { requireRole } from "@/lib/auth";
import { mockVehicles } from "@/lib/mockVehicles";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const vid = Number(id);

  try {
    const col = await getVehiclesCollection();
    // Query by number or string ID
    const vehicle = await col.findOne({ $or: [{ id: vid }, { id: id }] });
    
    if (vehicle) {
      const damageCol = await getDamageCollection();
      const maintCol = await getMaintenanceCollection();

      const damage = await damageCol.find({ $or: [{ vehicleId: vid }, { vehicleId: id }] }).toArray();
      const maintenance = await maintCol.find({ $or: [{ vehicleId: vid }, { vehicleId: id }] }).toArray();

      return Response.json({
        vehicle: { ...vehicle, id: vehicle.id ?? vehicle._id.toString() },
        damage,
        maintenance,
      });
    }
  } catch (err: any) {
    console.warn(`MongoDB query failed for vehicle ${vid}:`, err?.message || err);
  }

  const fallbackVehicle = mockVehicles.find((v) => v.id === vid);
  if (fallbackVehicle) {
    return Response.json({
      vehicle: fallbackVehicle,
      damage: [],
      maintenance: [],
    });
  }

  return Response.json({ error: "Vehicle not found" }, { status: 404 });
}

// PATCH — update vehicle in MongoDB (staff/admin/maintenance)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(["staff", "admin", "maintenance"]);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const vid = Number(id);
  const body = await req.json();

  try {
    const col = await getVehiclesCollection();
    const updateData: Record<string, any> = { ...body, updatedAt: new Date() };
    delete updateData._id;

    const result = await col.findOneAndUpdate(
      { $or: [{ id: vid }, { id: id }] },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return Response.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return Response.json({ vehicle: result });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Failed to update vehicle in MongoDB" }, { status: 500 });
  }
}

// DELETE — delete vehicle from MongoDB (admin only)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(["admin"]);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const vid = Number(id);

  try {
    const col = await getVehiclesCollection();
    await col.deleteOne({ $or: [{ id: vid }, { id: id }] });
    return Response.json({ ok: true, deleted: true });
  } catch (err: any) {
    return Response.json({ error: err?.message || "Failed to delete vehicle" }, { status: 500 });
  }
}
