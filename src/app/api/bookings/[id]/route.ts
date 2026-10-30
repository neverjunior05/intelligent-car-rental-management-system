import { db } from "@/db";
import {
  bookings,
  vehicles,
  drivers,
  payments,
  invoices,
  handovers,
  returns,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth";
import { canTransitionBooking, transitionVehicleState } from "@/lib/services";
import type { BookingStatus } from "@/lib/services";

export const dynamic = "force-dynamic";

// GET — full booking detail with related entities.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(["customer", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const bid = Number(id);
  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bid));
  if (!booking)
    return Response.json({ error: "Booking not found" }, { status: 404 });
  if (guard.session.role === "customer" && booking.customerId !== guard.session.userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, booking.vehicleId));
  const driverList = await db
    .select()
    .from(drivers)
    .where(eq(drivers.bookingId, bid));
  const paymentList = await db
    .select()
    .from(payments)
    .where(eq(payments.bookingId, bid));
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.bookingId, bid));
  const [handover] = await db
    .select()
    .from(handovers)
    .where(eq(handovers.bookingId, bid));
  const [returnRec] = await db
    .select()
    .from(returns)
    .where(eq(returns.bookingId, bid));

  return Response.json({
    booking,
    vehicle,
    drivers: driverList,
    payments: paymentList,
    invoice,
    handover,
    return: returnRec,
  });
}

// PATCH — transition booking status through its validated state machine.
// Pending -> Confirmed -> Active -> Completed | Pending/Confirmed -> Cancelled
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireRole(["customer", "staff", "admin"]);
  if (!guard.ok) return guard.response;
  const { id } = await params;
  const bid = Number(id);
  const { status } = (await req.json()) as { status: BookingStatus };

  const [booking] = await db.select().from(bookings).where(eq(bookings.id, bid));
  if (!booking)
    return Response.json({ error: "Booking not found" }, { status: 404 });

  // Customers may only cancel their own bookings; other transitions are staff/admin.
  if (guard.session.role === "customer") {
    if (booking.customerId !== guard.session.userId || status !== "cancelled") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const from = booking.status as BookingStatus;
  if (!canTransitionBooking(from, status)) {
    return Response.json(
      { error: `Invalid booking transition: ${from} -> ${status}` },
      { status: 400 },
    );
  }

  await db.update(bookings).set({ status }).where(eq(bookings.id, bid));

  // Cascade vehicle state changes with the booking lifecycle.
  if (status === "active") {
    // Reserved -> Rented on pickup.
    await transitionVehicleState(booking.vehicleId, "rented");
  } else if (status === "cancelled") {
    const [v] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, booking.vehicleId));
    if (v?.status === "reserved")
      await transitionVehicleState(booking.vehicleId, "available");
  }

  const [updated] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bid));
  return Response.json({ booking: updated });
}
