import { db } from "@/db";
import { returns, bookings, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { transitionVehicleState, generateInvoice } from "@/lib/services";

// Module 5 — return processing. Updates vehicle mileage/fuel, moves state,
// and auto-generates the final invoice (with fuel/mileage/damage charges).
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
    .from(returns)
    .where(eq(returns.bookingId, bookingId));
  if (existing.length > 0)
    return Response.json({ error: "Return already recorded" }, { status: 409 });

  const odometer = Number(body.odometer);
  const fuelLevel = Number(body.fuelLevel);

  const [returnRec] = await db
    .insert(returns)
    .values({
      bookingId,
      fuelLevel,
      odometer,
      condition: body.condition ?? "Good",
      notes: body.notes || null,
    })
    .returning();

  // Encapsulated update: vehicle's mileage/fuel reflect the returned state.
  await db
    .update(vehicles)
    .set({ mileage: odometer, fuelLevel })
    .where(eq(vehicles.id, booking.vehicleId));

  // Vehicle: Rented -> Returned. Booking: Active -> Completed.
  await transitionVehicleState(booking.vehicleId, "returned");
  await db
    .update(bookings)
    .set({ status: "completed" })
    .where(eq(bookings.id, bookingId));

  const invoice = await generateInvoice(bookingId);

  // Returned -> Available (ready for next rental) unless flagged for service.
  if (!body.needsMaintenance) {
    await transitionVehicleState(booking.vehicleId, "available");
  } else {
    await transitionVehicleState(booking.vehicleId, "maintenance");
  }

  return Response.json({ return: returnRec, invoice });
}
