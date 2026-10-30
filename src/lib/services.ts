// =============================================================================
// Service Layer — OOAD Abstraction & Encapsulation
// -----------------------------------------------------------------------------
// These service functions expose simple operations (e.g. processPayment,
// calculateBaseCost, transitionVehicleState) that HIDE internal complexity —
// demonstrating the Abstraction principle. State transitions are validated here
// so external code cannot put an entity into an invalid state (Encapsulation).
// =============================================================================

import { db } from "@/db";
import {
  vehicles,
  bookings,
  payments,
  invoices,
  damageRecords,
  handovers,
  returns,
} from "@/db/schema";
import { eq } from "drizzle-orm";

// ----- Vehicle state machine ------------------------------------------------
// Available -> Reserved -> Rented -> Returned -> Maintenance -> Available
export type VehicleStatus =
  | "available"
  | "reserved"
  | "rented"
  | "returned"
  | "maintenance";

const VEHICLE_TRANSITIONS: Record<VehicleStatus, VehicleStatus[]> = {
  available: ["reserved", "maintenance"],
  reserved: ["rented", "available"],
  rented: ["returned"],
  returned: ["maintenance", "available"],
  maintenance: ["available"],
};

export function canTransitionVehicle(
  from: VehicleStatus,
  to: VehicleStatus,
): boolean {
  return VEHICLE_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function transitionVehicleState(
  vehicleId: number,
  to: VehicleStatus,
): Promise<{ ok: boolean; error?: string }> {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId));
  if (!vehicle) return { ok: false, error: "Vehicle not found" };
  const from = vehicle.status as VehicleStatus;
  if (from === to) return { ok: true };
  if (!canTransitionVehicle(from, to)) {
    return {
      ok: false,
      error: `Invalid vehicle transition: ${from} -> ${to}`,
    };
  }
  await db.update(vehicles).set({ status: to }).where(eq(vehicles.id, vehicleId));
  return { ok: true };
}

// ----- Booking state machine ------------------------------------------------
// Pending -> Confirmed -> Active -> Completed  |  Pending -> Cancelled
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransitionBooking(
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  return BOOKING_TRANSITIONS[from]?.includes(to) ?? false;
}

// ----- Cost calculation (Abstraction) ---------------------------------------
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export function calculateBaseCost(
  dailyRate: number,
  start: Date,
  end: Date,
): number {
  return +(dailyRate * daysBetween(start, end)).toFixed(2);
}

// ----- Polymorphic payment processing ---------------------------------------
// A shared Payment interface implemented differently per method. Each strategy
// produces a transaction reference in its own way — this is Polymorphism.
export interface PaymentStrategy {
  method: "card" | "upi" | "bank_transfer";
  process(amount: number): { ref: string };
}

class CardPayment implements PaymentStrategy {
  method = "card" as const;
  process(amount: number) {
    return { ref: `CARD-${Date.now()}-${Math.round(amount)}` };
  }
}
class UPIPayment implements PaymentStrategy {
  method = "upi" as const;
  process(amount: number) {
    return { ref: `UPI-${Date.now()}-${Math.round(amount)}` };
  }
}
class BankTransferPayment implements PaymentStrategy {
  method = "bank_transfer" as const;
  process(amount: number) {
    return { ref: `BANK-${Date.now()}-${Math.round(amount)}` };
  }
}

function getPaymentStrategy(
  method: "card" | "upi" | "bank_transfer",
): PaymentStrategy {
  switch (method) {
    case "card":
      return new CardPayment();
    case "upi":
      return new UPIPayment();
    case "bank_transfer":
      return new BankTransferPayment();
  }
}

export async function processPayment(params: {
  bookingId: number;
  amount: number;
  method: "card" | "upi" | "bank_transfer";
  isDeposit?: boolean;
}) {
  const strategy = getPaymentStrategy(params.method);
  const { ref } = strategy.process(params.amount);
  const [payment] = await db
    .insert(payments)
    .values({
      bookingId: params.bookingId,
      amount: params.amount.toFixed(2),
      method: params.method,
      status: "completed",
      transactionRef: ref,
      isDeposit: params.isDeposit ?? false,
    })
    .returning();
  return payment;
}

// ----- Damage comparison logic ----------------------------------------------
// Compares pre-rental vs post-rental damage for a booking. Any damage record
// flagged NOT pre-existing (found on return) is considered new/customer-liable.
export async function compareDamage(bookingId: number) {
  const records = await db
    .select()
    .from(damageRecords)
    .where(eq(damageRecords.bookingId, bookingId));
  const preExisting = records.filter((r) => r.isPreExisting);
  const newDamage = records.filter((r) => !r.isPreExisting);
  // Simple severity-based charge estimate for newly found damage.
  const severityCost: Record<string, number> = {
    minor: 500,
    moderate: 2000,
    severe: 8000,
  };
  const estimatedCharge = newDamage.reduce(
    (sum, r) => sum + (severityCost[r.severity] ?? 0),
    0,
  );
  return { preExisting, newDamage, estimatedCharge };
}

// ----- Invoice generation (Abstraction) -------------------------------------
export async function generateInvoice(bookingId: number) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId));
  if (!booking) throw new Error("Booking not found");

  const baseCost = Number(booking.totalCost);

  // Fuel & mileage charges from handover vs return comparison.
  const [ho] = await db
    .select()
    .from(handovers)
    .where(eq(handovers.bookingId, bookingId));
  const [ret] = await db
    .select()
    .from(returns)
    .where(eq(returns.bookingId, bookingId));

  let fuelCharge = 0;
  let extraMileageCharge = 0;
  if (ho && ret) {
    // Charge 200 per 10% fuel deficit vs handover.
    const fuelDeficit = Math.max(0, ho.fuelLevel - ret.fuelLevel);
    fuelCharge = +(fuelDeficit * 20).toFixed(2);
    // Charge 10 per km beyond an allowance of days*250.
    const kmDriven = Math.max(0, ret.odometer - ho.odometer);
    const allowance = daysBetween(booking.startDate, booking.endDate) * 250;
    extraMileageCharge = +(Math.max(0, kmDriven - allowance) * 10).toFixed(2);
  }

  const { estimatedCharge: damageCharge } = await compareDamage(bookingId);

  const totalAmount = +(
    baseCost +
    fuelCharge +
    extraMileageCharge +
    damageCharge
  ).toFixed(2);

  // one invoice per booking
  const existing = await db
    .select()
    .from(invoices)
    .where(eq(invoices.bookingId, bookingId));
  if (existing.length > 0) {
    const [updated] = await db
      .update(invoices)
      .set({
        baseCost: baseCost.toFixed(2),
        fuelCharge: fuelCharge.toFixed(2),
        extraMileageCharge: extraMileageCharge.toFixed(2),
        damageCharge: damageCharge.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
      })
      .where(eq(invoices.bookingId, bookingId))
      .returning();
    return updated;
  }

  const [invoice] = await db
    .insert(invoices)
    .values({
      bookingId,
      baseCost: baseCost.toFixed(2),
      fuelCharge: fuelCharge.toFixed(2),
      extraMileageCharge: extraMileageCharge.toFixed(2),
      damageCharge: damageCharge.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
    })
    .returning();
  return invoice;
}
