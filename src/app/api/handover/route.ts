import { db } from "@/db";
import { handovers, bookings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";

// Module 5 — digital handover. Records condition, fuel, odometer, signature.
export async function POST(req: Request) {
  const guard = await requireRole(["staff", "admin"]);
  if (!guard.ok) return guard.response;
  const body = await req.json();
  const bookingId = Number(body.bookingId);
  if (!bookingId)
    return Response.json({ error: "bookingId required" }, { status: 400 });

  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));
  if (!booking)
    return Response.json({ error: "Booking not found" }, { status: 404 });

  const existing = await db
    .select()
    .from(handovers)
    .where(eq(handovers.bookingId, bookingId));
  if (existing.length > 0) {
    return Response.json(
      { error: "Handover already recorded" },
      { status: 409 },
    );
  }

  const [handover] = await db
    .insert(handovers)
    .values({
      bookingId,
      fuelLevel: Number(body.fuelLevel),
      odometer: Number(body.odometer),
      condition: body.condition ?? "Good",
      accessories: body.accessories || null,
      customerPhotoUrl: body.customerPhotoUrl || null,
      signature: body.signature || null,
    })
    .returning();

  return Response.json({ handover });
}
