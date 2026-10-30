// =============================================================================
// Intelligent Car Rental Management System — Data Model (Drizzle / PostgreSQL)
// -----------------------------------------------------------------------------
// This schema reflects the OOAD design described in the project documentation.
//
// INHERITANCE (User specialization):
//   A single `users` table carries a `role` discriminator column. The base
//   entity is `User`; the specializations Customer / Staff / Administrator /
//   MaintenanceStaff share common fields and are distinguished by `role`.
//   This mirrors single-table inheritance from the OOAD class diagram.
//
// Key relationships enforced with foreign keys:
//   Customer  -> Booking          (one-to-many)
//   Booking   -> Vehicle          (many-to-one)
//   Booking   -> Driver           (one-to-many)
//   Booking   -> Payment          (one-to-many)
//   Vehicle   -> DamageRecord     (one-to-many)
//   Vehicle   -> MaintenanceRecord(one-to-many)
//   Booking   -> Handover         (one-to-one)
//   Booking   -> Return           (one-to-one)
//   Location  -> Vehicle          (one-to-many)
//   Booking   -> Invoice          (one-to-one)
// =============================================================================

import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// ----- Enumerations (state machines & categories) ---------------------------

// User roles — the inheritance discriminator.
export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "staff",
  "admin",
  "maintenance",
]);

// Vehicle state machine:
//   Available -> Reserved -> Rented -> Returned -> Maintenance -> Available
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "reserved",
  "rented",
  "returned",
  "maintenance",
]);

// Booking state machine:
//   Pending -> Confirmed -> Active -> Completed  |  Pending -> Cancelled
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
]);

export const fuelTypeEnum = pgEnum("fuel_type", [
  "petrol",
  "diesel",
  "electric",
  "hybrid",
]);

export const transmissionEnum = pgEnum("transmission", [
  "manual",
  "automatic",
]);

export const damageSeverityEnum = pgEnum("damage_severity", [
  "minor",
  "moderate",
  "severe",
]);

// Polymorphic payment methods sharing a common Payment interface.
export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "upi",
  "bank_transfer",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "refunded",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "scheduled",
  "in_progress",
  "completed",
]);

// ----- User (base class + specializations via role) -------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  phone: text("phone"),
  // Customer-specific fields (nullable for other roles)
  licenseNumber: text("license_number"),
  address: text("address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Location -------------------------------------------------------------

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Vehicle --------------------------------------------------------------

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  vin: text("vin").notNull().unique(),
  registrationNumber: text("registration_number").notNull().unique(),
  category: text("category").notNull(), // e.g. Economy, SUV, Luxury
  fuelType: fuelTypeEnum("fuel_type").notNull(),
  transmission: transmissionEnum("transmission").notNull(),
  seats: integer("seats").notNull().default(5),
  mileage: integer("mileage").notNull().default(0), // odometer km
  fuelLevel: integer("fuel_level").notNull().default(100), // percent 0-100
  dailyRate: numeric("daily_rate", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  status: vehicleStatusEnum("status").notNull().default("available"),
  imageUrl: text("image_url"),
  locationId: integer("location_id").references(() => locations.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Booking --------------------------------------------------------------

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => users.id),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  totalCost: numeric("total_cost", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Driver (one-to-many per booking) -------------------------------------

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull(),
  idNumber: text("id_number").notNull(),
  licenseExpiry: text("license_expiry"),
  verified: boolean("verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Payment (polymorphic method) -----------------------------------------

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  transactionRef: text("transaction_ref"),
  isDeposit: boolean("is_deposit").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Invoice (one-to-one with booking) ------------------------------------

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id),
  baseCost: numeric("base_cost", { precision: 10, scale: 2 }).notNull(),
  extraMileageCharge: numeric("extra_mileage_charge", {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default("0"),
  fuelCharge: numeric("fuel_charge", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  damageCharge: numeric("damage_charge", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Damage record (one-to-many per vehicle) ------------------------------

export const damageRecords = pgTable("damage_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  description: text("description").notNull(),
  severity: damageSeverityEnum("severity").notNull().default("minor"),
  photoUrl: text("photo_url"),
  // true = existed before the rental (pre), false = new damage found on return (post)
  isPreExisting: boolean("is_pre_existing").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Maintenance record (one-to-many per vehicle) -------------------------

export const maintenanceRecords = pgTable("maintenance_records", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id),
  description: text("description").notNull(),
  serviceDate: timestamp("service_date").notNull().defaultNow(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull().default("0"),
  status: maintenanceStatusEnum("status").notNull().default("scheduled"),
  performedBy: integer("performed_by").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ----- Handover (one-to-one with booking) -----------------------------------

export const handovers = pgTable("handovers", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id)
    .unique(),
  fuelLevel: integer("fuel_level").notNull(),
  odometer: integer("odometer").notNull(),
  condition: text("condition").notNull(),
  accessories: text("accessories"),
  customerPhotoUrl: text("customer_photo_url"),
  signature: text("signature"), // digital signature (data URL / text)
  handoverAt: timestamp("handover_at").notNull().defaultNow(),
});

// ----- Return (one-to-one with booking) -------------------------------------

export const returns = pgTable("returns", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => bookings.id)
    .unique(),
  fuelLevel: integer("fuel_level").notNull(),
  odometer: integer("odometer").notNull(),
  condition: text("condition").notNull(),
  notes: text("notes"),
  returnedAt: timestamp("returned_at").notNull().defaultNow(),
});

// ----- Notification ---------------------------------------------------------

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Convenience types
export type User = typeof users.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
