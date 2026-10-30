import { db } from "@/db";
import { damageRecords } from "@/db/schema";
import { requireRole } from "@/lib/auth";
import { compareDamage } from "@/lib/services";

export const dynamic = "force-dynamic";

// GET — damage comparison for a booking (pre vs post rental).
export async function GET(req: Request) {
  const guard = await requireRole(["staff", "admin"]);
  if (!guard.ok) return guard.response;
  const url = new URL(req.url);
  const bookingId = Number(url.searchParams.get("bookingId"));
  if (!bookingId)
    return Response.json({ error: "bookingId required" }, { status: 400 });
  const comparison = await compareDamage(bookingId);
  return Response.json(comparison);
}

// POST — record damage tied to a vehicle (and optionally a booking).
export async function POST(req: Request) {
  const guard = await requireRole(["staff", "admin", "maintenance"]);
  if (!guard.ok) return guard.response;
  const body = await req.json();
  const [record] = await db
    .insert(damageRecords)
    .values({
      vehicleId: Number(body.vehicleId),
      bookingId: body.bookingId ? Number(body.bookingId) : null,
      description: body.description,
      severity: body.severity ?? "minor",
      photoUrl: body.photoUrl || null,
      isPreExisting: body.isPreExisting ?? true,
    })
    .returning();
  return Response.json({ record });
}
