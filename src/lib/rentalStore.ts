// =============================================================================
// Intelligent Car Rental Management System — Unified Cross-Portal Data Store
// -----------------------------------------------------------------------------
// This file serves as the reactive single source of truth for the 4 portals:
// 1. CUSTOMER
// 2. RENTAL STAFF
// 3. MAINTENANCE STAFF
// 4. ADMINISTRATOR
//
// Key principles:
// - Connected rental lifecycle: Customer -> Booking -> Verification -> Payment ->
//   Handover -> Active Rental -> Fleet Tracking -> Return -> Damage Comparison ->
//   Invoice -> Maintenance (if needed) -> Available Again.
// - Changes in one portal immediately update state across all portals.
// - Persisted to localStorage with automatic cross-tab synchronization.
// =============================================================================

import { mockVehicles } from "./mockVehicles";
import { Vehicle } from "./types";

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: "customer" | "staff" | "maintenance" | "admin";
  phone: string;
  licenseNumber?: string;
  address?: string;
  status: "active" | "suspended";
  avatar?: string;
  department?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface DriverVerification {
  id: number;
  bookingId: number;
  name: string;
  licenseNumber: string;
  idNumber: string;
  licenseExpiry: string;
  verified: boolean;
  status: "pending" | "under_review" | "verified" | "rejected";
  licenseFrontUrl?: string;
  licenseBackUrl?: string;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface DamagePoint {
  id: string;
  area: "front_bumper" | "hood" | "windshield" | "left_doors" | "right_doors" | "rear_bumper" | "roof" | "trunk" | "wheels";
  description: string;
  severity: "minor" | "moderate" | "severe";
  isPreExisting: boolean;
  photoUrl?: string;
  recordedBy?: string;
  date: string;
  repairCostEstimate: number;
}

export interface BookingRecord {
  id: number;
  bookingCode: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleId: number;
  vehicleName: string;
  vehicleReg: string;
  vehicleImage: string;
  category: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  returnLocation: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  totalCost: number;
  baseCost: number;
  depositAmount: number;
  paymentMethod: "card" | "upi" | "bank_transfer";
  paymentStatus: "pending" | "paid" | "refunded";
  driverVerification: "pending" | "under_review" | "verified" | "rejected";
  driver?: DriverVerification;
  createdAt: string;
  handoverId?: number;
  returnId?: number;
}

export interface HandoverRecord {
  id: number;
  bookingId: number;
  vehicleId: number;
  staffName: string;
  handoverAt: string;
  fuelLevel: number;
  odometer: number;
  condition: string;
  accessories: string[];
  signature: string;
  customerPhotoUrl?: string;
  gpsActive: boolean;
  damagePoints: DamagePoint[];
  notes?: string;
}

export interface ReturnRecord {
  id: number;
  bookingId: number;
  vehicleId: number;
  staffName: string;
  returnedAt: string;
  fuelLevel: number;
  odometer: number;
  condition: string;
  fuelDeficitCost: number;
  extraMileageCost: number;
  damageCost: number;
  totalAdditionalCharge: number;
  newDamagePoints: DamagePoint[];
  preExistingDamagePoints: DamagePoint[];
  sentToMaintenance: boolean;
  maintenanceReason?: string;
  notes?: string;
}

export interface MaintenanceJob {
  id: number;
  jobCode: string;
  vehicleId: number;
  vehicleName: string;
  vehicleReg: string;
  vehicleCategory: string;
  title: string;
  problemDescription: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "assigned" | "in_progress" | "waiting_parts" | "completed" | "cancelled";
  assignedTechnician: string;
  dateCreated: string;
  serviceDueDate: string;
  dateCompleted?: string;
  estimatedCost: number;
  actualCost: number;
  partsUsed: string[];
  notes: string;
  serviceChecklist: { task: string; done: boolean }[];
}

export interface FleetVehicle extends Vehicle {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  currentAddress: string;
  activeBookingId?: number;
  currentDriverName?: string;
  lastServiceDate?: string;
  nextServiceMileage?: number;
  inMaintenance?: boolean;
}

export interface SystemNotification {
  id: string;
  userId?: number;
  targetRole?: "customer" | "staff" | "maintenance" | "admin" | "all";
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: "customer" | "staff" | "maintenance" | "admin" | "system";
  action: string;
  affectedEntity: "booking" | "vehicle" | "user" | "handover" | "return" | "maintenance" | "pricing" | "payment" | "document";
  entityId: string | number;
  status: "success" | "warning" | "info" | "danger";
  details: string;
}

export interface PricingConfig {
  baseDailyDiscount7Days: number;
  baseDailyDiscount30Days: number;
  fuelPenaltyPerPercent: number; // cost per 1% fuel missing
  extraMileagePerKm: number;     // cost per km beyond allowance
  mileageAllowancePerDay: number; // km allowance per day
  standardSecurityDeposit: number;
  luxurySecurityDeposit: number;
  insuranceDailyRate: number;
  gpsDailyRate: number;
  childSeatDailyRate: number;
}

export interface RentalLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  fleetCount: number;
  active: boolean;
}

// -----------------------------------------------------------------------------
// Initial Mock Data Seeds
// -----------------------------------------------------------------------------

const INITIAL_USERS: UserAccount[] = [
  {
    id: 1,
    name: "System Admin",
    email: "admin@carrent.com",
    password: "password123",
    role: "admin",
    phone: "+1 (555) 019-2831",
    status: "active",
    department: "Executive Management",
    lastLogin: "Just now",
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    name: "Rachel Green",
    email: "staff@carrent.com",
    password: "password123",
    role: "staff",
    phone: "+1 (555) 019-2832",
    status: "active",
    department: "Front Desk Operations",
    lastLogin: "10 mins ago",
    createdAt: "2024-01-10",
  },
  {
    id: 3,
    name: "Mike Mechanic",
    email: "maint@carrent.com",
    password: "password123",
    role: "maintenance",
    phone: "+1 (555) 019-2833",
    status: "active",
    department: "Fleet Workshop & Diagnostics",
    lastLogin: "25 mins ago",
    createdAt: "2024-01-15",
  },
  {
    id: 4,
    name: "Jane Customer",
    email: "customer@carrent.com",
    password: "password123",
    role: "customer",
    phone: "+1 (555) 019-2834",
    licenseNumber: "DL-9981234",
    address: "742 Evergreen Terrace, Metropolis",
    status: "active",
    lastLogin: "Active now",
    createdAt: "2024-02-01",
  },
  {
    id: 5,
    name: "Carlos Rivera",
    email: "carlos.r@example.com",
    password: "password123",
    role: "customer",
    phone: "+1 (555) 019-4455",
    licenseNumber: "DL-4829104",
    address: "124 Palm Avenue, Metropolis",
    status: "active",
    lastLogin: "Yesterday",
    createdAt: "2024-02-14",
  },
  {
    id: 6,
    name: "David Kim",
    email: "david.staff@carrent.com",
    password: "password123",
    role: "staff",
    phone: "+1 (555) 019-8822",
    status: "active",
    department: "Airport Operations",
    lastLogin: "2 hours ago",
    createdAt: "2024-02-20",
  },
];

const INITIAL_LOCATIONS: RentalLocation[] = [
  { id: 1, name: "Downtown Central Hub", address: "12 Main St", city: "Metropolis", phone: "+1 (555) 800-1001", fleetCount: 16, active: true },
  { id: 2, name: "Metropolis Int'l Airport (Terminal 2)", address: "1 Airport Blvd", city: "Metropolis", phone: "+1 (555) 800-1002", fleetCount: 10, active: true },
  { id: 3, name: "City South Logistics Depot", address: "44 Industrial Parkway", city: "Metropolis", phone: "+1 (555) 800-1003", fleetCount: 4, active: true },
];

const INITIAL_PRICING: PricingConfig = {
  baseDailyDiscount7Days: 10,
  baseDailyDiscount30Days: 20,
  fuelPenaltyPerPercent: 25,
  extraMileagePerKm: 12,
  mileageAllowancePerDay: 250,
  standardSecurityDeposit: 3000,
  luxurySecurityDeposit: 8000,
  insuranceDailyRate: 350,
  gpsDailyRate: 150,
  childSeatDailyRate: 100,
};

// Generate fleet with GPS coordinates spread realistically around Metropolis city
const INITIAL_FLEET: FleetVehicle[] = mockVehicles.map((v, idx) => {
  // Base location roughly centered at Metropolis (approx lat 40.7128, lng -74.0060)
  const latOffset = ((idx * 7) % 20 - 10) * 0.007;
  const lngOffset = ((idx * 11) % 20 - 10) * 0.008;
  const baseLat = 40.7128 + latOffset;
  const baseLng = -74.0060 + lngOffset;

  let status = v.status;
  // Specific vehicles in active/rented or maintenance states for realistic demo:
  if (v.id === 1) status = "rented"; // Corolla is currently active on rental for Jane Customer
  if (v.id === 3) status = "reserved"; // Tesla Model 3 has confirmed upcoming booking
  if (v.id === 5) status = "maintenance"; // Swift is in maintenance

  return {
    ...v,
    status,
    lat: baseLat,
    lng: baseLng,
    speed: status === "rented" ? Math.floor(35 + (idx * 5) % 40) : 0,
    heading: (idx * 45) % 360,
    currentAddress: idx % 2 === 0 ? "7th Ave & 34th St, Metropolis" : "Airport Expressway Exit 4",
    activeBookingId: status === "rented" ? 101 : undefined,
    currentDriverName: status === "rented" ? "Jane Customer" : undefined,
    lastServiceDate: "2024-01-20",
    nextServiceMileage: v.mileage + 5000,
    inMaintenance: status === "maintenance",
  };
});

const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 101,
    bookingCode: "VEL-101",
    customerId: 4,
    customerName: "Jane Customer",
    customerEmail: "customer@carrent.com",
    customerPhone: "+1 (555) 019-2834",
    vehicleId: 1,
    vehicleName: "Toyota Corolla (2023)",
    vehicleReg: "MH01AB1001",
    vehicleImage: INITIAL_FLEET[0].imageUrl || "",
    category: "Economy",
    startDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    pickupLocation: "Downtown Central Hub",
    returnLocation: "Downtown Central Hub",
    status: "active",
    totalCost: 12500,
    baseCost: 12500,
    depositAmount: 3000,
    paymentMethod: "card",
    paymentStatus: "paid",
    driverVerification: "verified",
    driver: {
      id: 1,
      bookingId: 101,
      name: "Jane Customer",
      licenseNumber: "DL-9981234",
      idNumber: "ID-908122",
      licenseExpiry: "2029-08-15",
      verified: true,
      status: "verified",
      licenseFrontUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
      notes: "License verified against government registry.",
      verifiedAt: "2024-02-22",
      verifiedBy: "Rachel Green (Staff)",
    },
    handoverId: 501,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 102,
    bookingCode: "VEL-102",
    customerId: 5,
    customerName: "Carlos Rivera",
    customerEmail: "carlos.r@example.com",
    customerPhone: "+1 (555) 019-4455",
    vehicleId: 3,
    vehicleName: "Tesla Model 3 (2024)",
    vehicleReg: "MH01AB1003",
    vehicleImage: INITIAL_FLEET[2].imageUrl || "",
    category: "Luxury",
    startDate: new Date(Date.now() + 86400000 * 1).toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10),
    pickupLocation: "Metropolis Int'l Airport (Terminal 2)",
    returnLocation: "Metropolis Int'l Airport (Terminal 2)",
    status: "confirmed",
    totalCost: 19500,
    baseCost: 19500,
    depositAmount: 8000,
    paymentMethod: "card",
    paymentStatus: "paid",
    driverVerification: "under_review",
    driver: {
      id: 2,
      bookingId: 102,
      name: "Carlos Rivera",
      licenseNumber: "DL-4829104",
      idNumber: "ID-442119",
      licenseExpiry: "2027-11-20",
      verified: false,
      status: "under_review",
      licenseFrontUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
      notes: "Uploaded yesterday, pending staff inspection.",
    },
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 103,
    bookingCode: "VEL-103",
    customerId: 4,
    customerName: "Jane Customer",
    customerEmail: "customer@carrent.com",
    customerPhone: "+1 (555) 019-2834",
    vehicleId: 4,
    vehicleName: "Jeep Compass (2023)",
    vehicleReg: "MH01AB1004",
    vehicleImage: INITIAL_FLEET[3].imageUrl || "",
    category: "SUV",
    startDate: new Date(Date.now() - 86400000 * 14).toISOString().slice(0, 10),
    endDate: new Date(Date.now() - 86400000 * 10).toISOString().slice(0, 10),
    pickupLocation: "Downtown Central Hub",
    returnLocation: "Downtown Central Hub",
    status: "completed",
    totalCost: 18000,
    baseCost: 18000,
    depositAmount: 3000,
    paymentMethod: "card",
    paymentStatus: "paid",
    driverVerification: "verified",
    driver: {
      id: 3,
      bookingId: 103,
      name: "Jane Customer",
      licenseNumber: "DL-9981234",
      idNumber: "ID-908122",
      licenseExpiry: "2029-08-15",
      verified: true,
      status: "verified",
    },
    handoverId: 500,
    returnId: 600,
    createdAt: new Date(Date.now() - 86400000 * 16).toISOString(),
  },
];

const INITIAL_HANDOVERS: HandoverRecord[] = [
  {
    id: 501,
    bookingId: 101,
    vehicleId: 1,
    staffName: "Rachel Green",
    handoverAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    fuelLevel: 100,
    odometer: 15000,
    condition: "Flawless showroom condition. Detailed interior clean.",
    accessories: ["Spare Wheel", "Hydraulic Jack", "First Aid Kit", "FASTag Toll Pass", "Dual-Lens Dashcam"],
    signature: "Jane Customer (Verified Signoff)",
    gpsActive: true,
    damagePoints: [
      {
        id: "dmg-1",
        area: "rear_bumper",
        description: "Small 2cm clearcoat scratch near tailgate latch",
        severity: "minor",
        isPreExisting: true,
        date: "2024-02-18",
        repairCostEstimate: 500,
      },
    ],
    notes: "Customer briefed on fuel return policy (100% full) and emergency assistance number.",
  },
];

const INITIAL_MAINTENANCE_JOBS: MaintenanceJob[] = [
  {
    id: 201,
    jobCode: "JOB-201",
    vehicleId: 5,
    vehicleName: "Maruti Swift (2021)",
    vehicleReg: "MH01AB1005",
    vehicleCategory: "Economy",
    title: "Brake Pad Replacement & 40,000 km Scheduled Service",
    problemDescription: "Front brake pads worn below 3mm threshold. Customer reported slight shudder on high-speed deceleration. Routine oil & filter change required.",
    priority: "high",
    status: "in_progress",
    assignedTechnician: "Mike Mechanic",
    dateCreated: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 10),
    serviceDueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    estimatedCost: 6500,
    actualCost: 5800,
    partsUsed: ["Brembo Ceramic Front Brake Pads", "Synthetic 5W-30 Engine Oil (3.5L)", "Bosch Oil Filter"],
    notes: "Front pads replaced successfully. Currently performing caliper bleed and road testing.",
    serviceChecklist: [
      { task: "Vehicle inspection on hydraulic lift", done: true },
      { task: "Disassemble front calipers & rotors", done: true },
      { task: "Install new ceramic brake pads", done: true },
      { task: "Flush and bleed brake hydraulic lines", done: true },
      { task: "Engine oil change & filter replacement", done: true },
      { task: "Final dynamic road test", done: false },
    ],
  },
  {
    id: 202,
    jobCode: "JOB-202",
    vehicleId: 17,
    vehicleName: "Mahindra Thar (2023)",
    vehicleReg: "MH01AB1017",
    vehicleCategory: "SUV",
    title: "Off-Road Suspension Alignment & Differential Check",
    problemDescription: "Slight steering drift to the left following weekend trail rental. Inspect 4x4 transfer case seals and tie rods.",
    priority: "medium",
    status: "pending",
    assignedTechnician: "Mike Mechanic",
    dateCreated: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    serviceDueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    estimatedCost: 4500,
    actualCost: 0,
    partsUsed: ["Tie rod end bushing kit", "Differential gear oil 75W-90"],
    notes: "Awaiting bay availability in workshop.",
    serviceChecklist: [
      { task: "Computerized wheel alignment check", done: false },
      { task: "Inspect tie rods and suspension ball joints", done: false },
      { task: "Check transfer case oil level and seals", done: false },
    ],
  },
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    targetRole: "customer",
    userId: 4,
    title: "Active Rental in Progress",
    message: "Your rental of the Toyota Corolla is active. Return expected in 3 days.",
    type: "info",
    read: false,
    timestamp: "2 hours ago",
    actionUrl: "/customer/active-rental",
  },
  {
    id: "notif-2",
    targetRole: "staff",
    title: "Document Awaiting Verification",
    message: "Carlos Rivera uploaded a Driver License for Booking #VEL-102.",
    type: "warning",
    read: false,
    timestamp: "3 hours ago",
    actionUrl: "/staff/bookings",
  },
  {
    id: "notif-3",
    targetRole: "maintenance",
    title: "Work Order in Progress",
    message: "Job #JOB-201 (Swift Brake Service) is 80% complete.",
    type: "info",
    read: false,
    timestamp: "4 hours ago",
    actionUrl: "/maintenance/jobs",
  },
  {
    id: "notif-4",
    targetRole: "admin",
    title: "Fleet Telemetry Alert",
    message: "All 30 fleet GPS transponders are healthy and pinging live.",
    type: "success",
    read: true,
    timestamp: "5 hours ago",
    actionUrl: "/admin/live",
  },
];

const INITIAL_ACTIVITY: ActivityLog[] = [
  {
    id: "act-1",
    timestamp: "Just now",
    user: "System",
    role: "system",
    action: "Fleet Telemetry Ping",
    affectedEntity: "vehicle",
    entityId: "MH01AB1001",
    status: "success",
    details: "Vehicle #1 (Corolla) reported GPS coordinates 40.7128, -74.0060 @ 42 km/h.",
  },
  {
    id: "act-2",
    timestamp: "28 mins ago",
    user: "Carlos Rivera",
    role: "customer",
    action: "Document Uploaded",
    affectedEntity: "document",
    entityId: "DL-4829104",
    status: "info",
    details: "Customer uploaded driver license for Booking #VEL-102 awaiting verification.",
  },
  {
    id: "act-3",
    timestamp: "1 hour ago",
    user: "Rachel Green",
    role: "staff",
    action: "Digital Handover Signed",
    affectedEntity: "handover",
    entityId: 501,
    status: "success",
    details: "Handover executed for Booking #VEL-101. Vehicle MH01AB1001 status -> RENTED.",
  },
  {
    id: "act-4",
    timestamp: "3 hours ago",
    user: "Mike Mechanic",
    role: "maintenance",
    action: "Work Order Started",
    affectedEntity: "maintenance",
    entityId: "JOB-201",
    status: "warning",
    details: "Brake service initiated for Maruti Swift (MH01AB1005). Status -> IN_PROGRESS.",
  },
  {
    id: "act-5",
    timestamp: "Yesterday",
    user: "System Admin",
    role: "admin",
    action: "Pricing Updated",
    affectedEntity: "pricing",
    entityId: "CFG-2024",
    status: "info",
    details: "Standardized luxury security deposit set to ₹8,000.",
  },
];

// -----------------------------------------------------------------------------
// Storage Keys & State Helper
// -----------------------------------------------------------------------------

const STORAGE_KEYS = {
  FLEET: "veloce_fleet_v2",
  BOOKINGS: "veloce_bookings_v2",
  USERS: "veloce_users_v2",
  HANDOVERS: "veloce_handovers_v2",
  MAINTENANCE: "veloce_maintenance_v2",
  NOTIFICATIONS: "veloce_notifications_v2",
  ACTIVITY: "veloce_activity_v2",
  PRICING: "veloce_pricing_v2",
  LOCATIONS: "veloce_locations_v2",
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch a custom local event for immediate reactivity across same-window components
    window.dispatchEvent(new CustomEvent("veloce_store_updated", { detail: { key } }));
  } catch (err) {
    console.warn("localStorage write error:", err);
  }
}

// -----------------------------------------------------------------------------
// Rental Store Object & Actions
// -----------------------------------------------------------------------------

export const rentalStore = {
  // Reads
  getFleet(): FleetVehicle[] {
    return safeGet<FleetVehicle[]>(STORAGE_KEYS.FLEET, INITIAL_FLEET);
  },
  getBookings(): BookingRecord[] {
    return safeGet<BookingRecord[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  },
  getUsers(): UserAccount[] {
    return safeGet<UserAccount[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getHandovers(): HandoverRecord[] {
    return safeGet<HandoverRecord[]>(STORAGE_KEYS.HANDOVERS, INITIAL_HANDOVERS);
  },
  getMaintenanceJobs(): MaintenanceJob[] {
    return safeGet<MaintenanceJob[]>(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_JOBS);
  },
  getNotifications(): SystemNotification[] {
    return safeGet<SystemNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  getActivityLogs(): ActivityLog[] {
    return safeGet<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY);
  },
  getPricing(): PricingConfig {
    return safeGet<PricingConfig>(STORAGE_KEYS.PRICING, INITIAL_PRICING);
  },
  getLocations(): RentalLocation[] {
    return safeGet<RentalLocation[]>(STORAGE_KEYS.LOCATIONS, INITIAL_LOCATIONS);
  },

  // ---------------------------------------------------------------------------
  // Action 1: Customer creates Booking
  // Lifecycle: Customer creates -> Vehicle becomes "reserved" -> Staff sees new booking
  // ---------------------------------------------------------------------------
  createBooking(params: {
    customerId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    vehicleId: number;
    startDate: string;
    endDate: string;
    pickupLocation: string;
    returnLocation: string;
    paymentMethod: "card" | "upi" | "bank_transfer";
  }): BookingRecord {
    const fleet = this.getFleet();
    const vehicle = fleet.find((v) => v.id === params.vehicleId);
    if (!vehicle) throw new Error("Selected vehicle not found.");
    if (vehicle.status !== "available") {
      throw new Error(`Vehicle is currently ${vehicle.status.toUpperCase()} and cannot be booked.`);
    }

    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const baseCost = days * Number(vehicle.dailyRate);
    const pricing = this.getPricing();
    const deposit = vehicle.category === "Luxury" ? pricing.luxurySecurityDeposit : pricing.standardSecurityDeposit;
    const totalCost = baseCost;

    const bookings = this.getBookings();
    const nextId = bookings.length > 0 ? Math.max(...bookings.map((b) => b.id)) + 1 : 101;

    const newBooking: BookingRecord = {
      id: nextId,
      bookingCode: `VEL-${nextId}`,
      customerId: params.customerId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      vehicleReg: vehicle.registrationNumber,
      vehicleImage: vehicle.imageUrl || "",
      category: vehicle.category,
      startDate: params.startDate,
      endDate: params.endDate,
      pickupLocation: params.pickupLocation,
      returnLocation: params.returnLocation,
      status: "pending",
      totalCost,
      baseCost,
      depositAmount: deposit,
      paymentMethod: params.paymentMethod,
      paymentStatus: "paid",
      driverVerification: "under_review",
      createdAt: new Date().toISOString(),
    };

    // Transition vehicle to 'reserved'
    const updatedFleet = fleet.map((v) =>
      v.id === vehicle.id ? { ...v, status: "reserved" as const, activeBookingId: newBooking.id } : v
    );

    safeSet(STORAGE_KEYS.FLEET, updatedFleet);
    safeSet(STORAGE_KEYS.BOOKINGS, [newBooking, ...bookings]);

    // Notifications & Activity
    this.addNotification({
      title: "New Booking Created",
      message: `${params.customerName} booked ${vehicle.make} ${vehicle.model} (#VEL-${nextId}).`,
      type: "info",
      targetRole: "staff",
      actionUrl: "/staff/bookings",
    });

    this.logActivity({
      user: params.customerName,
      role: "customer",
      action: "Booking Created",
      affectedEntity: "booking",
      entityId: newBooking.bookingCode,
      status: "info",
      details: `Created Booking #${newBooking.bookingCode} for ${vehicle.make} ${vehicle.model}. Vehicle status -> RESERVED.`,
    });

    return newBooking;
  },

  // ---------------------------------------------------------------------------
  // Action 2: Staff confirms Booking
  // ---------------------------------------------------------------------------
  confirmBooking(bookingId: number, staffName = "Rachel Green"): void {
    const bookings = this.getBookings();
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;

    const updatedBookings = bookings.map((x) =>
      x.id === bookingId ? { ...x, status: "confirmed" as const } : x
    );
    safeSet(STORAGE_KEYS.BOOKINGS, updatedBookings);

    this.addNotification({
      title: "Booking Confirmed!",
      message: `Your booking #${b.bookingCode} for ${b.vehicleName} has been confirmed by staff.`,
      type: "success",
      targetRole: "customer",
      userId: b.customerId,
      actionUrl: "/customer/bookings",
    });

    this.logActivity({
      user: staffName,
      role: "staff",
      action: "Booking Confirmed",
      affectedEntity: "booking",
      entityId: b.bookingCode,
      status: "success",
      details: `Staff confirmed Booking #${b.bookingCode}. Driver verification is ${b.driverVerification}.`,
    });
  },

  // ---------------------------------------------------------------------------
  // Action 3: Customer uploads Driver License / Staff verifies Document
  // ---------------------------------------------------------------------------
  submitDriverDocument(bookingId: number, driverData: {
    name: string;
    licenseNumber: string;
    idNumber: string;
    licenseExpiry: string;
    licenseFrontUrl?: string;
  }): void {
    const bookings = this.getBookings();
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;

    const updatedDriver: DriverVerification = {
      id: Date.now(),
      bookingId,
      name: driverData.name,
      licenseNumber: driverData.licenseNumber,
      idNumber: driverData.idNumber,
      licenseExpiry: driverData.licenseExpiry,
      verified: false,
      status: "under_review",
      licenseFrontUrl: driverData.licenseFrontUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
      notes: "Uploaded by customer, pending staff verification.",
    };

    const updated = bookings.map((x) =>
      x.id === bookingId
        ? { ...x, driverVerification: "under_review" as const, driver: updatedDriver }
        : x
    );
    safeSet(STORAGE_KEYS.BOOKINGS, updated);

    this.addNotification({
      title: "KYC Document Awaiting Review",
      message: `${driverData.name} uploaded Driver License for Booking #${b.bookingCode}.`,
      type: "warning",
      targetRole: "staff",
      actionUrl: "/staff/bookings",
    });

    this.logActivity({
      user: driverData.name,
      role: "customer",
      action: "Driver Document Uploaded",
      affectedEntity: "document",
      entityId: b.bookingCode,
      status: "info",
      details: `License #${driverData.licenseNumber} submitted for Booking #${b.bookingCode}.`,
    });
  },

  verifyDriverDocument(bookingId: number, approve: boolean, notes = "", staffName = "Rachel Green"): void {
    const bookings = this.getBookings();
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;

    const updatedDriver: DriverVerification = b.driver
      ? {
          ...b.driver,
          verified: approve,
          status: approve ? "verified" : "rejected",
          notes: notes || (approve ? "Verified by staff." : "Document image unreadable. Please re-upload."),
          verifiedAt: new Date().toISOString(),
          verifiedBy: staffName,
        }
      : {
          id: Date.now(),
          bookingId,
          name: b.customerName,
          licenseNumber: "VERIFIED-DL",
          idNumber: "VERIFIED-ID",
          licenseExpiry: "2030-01-01",
          verified: approve,
          status: approve ? "verified" : "rejected",
          notes: notes || (approve ? "Verified by staff." : "Document rejected."),
          verifiedAt: new Date().toISOString(),
          verifiedBy: staffName,
        };

    const updated = bookings.map((x) =>
      x.id === bookingId
        ? {
            ...x,
            driverVerification: approve ? ("verified" as const) : ("rejected" as const),
            driver: updatedDriver,
          }
        : x
    );
    safeSet(STORAGE_KEYS.BOOKINGS, updated);

    this.addNotification({
      title: approve ? "Driver License Approved!" : "Driver License Requires Attention",
      message: approve
        ? `Your driver verification for Booking #${b.bookingCode} is approved. You are ready for handover!`
        : `Your document for Booking #${b.bookingCode} was rejected: ${notes}. Please re-upload.`,
      type: approve ? "success" : "error",
      targetRole: "customer",
      userId: b.customerId,
      actionUrl: "/customer/documents",
    });

    this.logActivity({
      user: staffName,
      role: "staff",
      action: approve ? "Driver Verified" : "Driver Rejected",
      affectedEntity: "document",
      entityId: b.bookingCode,
      status: approve ? "success" : "danger",
      details: `Staff ${approve ? "approved" : "rejected"} driver verification for Booking #${b.bookingCode}.`,
    });
  },

  // ---------------------------------------------------------------------------
  // Action 4: Staff performs Digital Handover
  // Lifecycle: Staff verifies condition/accessories/signature -> Booking becomes "active"
  // -> Vehicle becomes "rented" -> Customer sees Active Rental with GPS tracking!
  // ---------------------------------------------------------------------------
  performHandover(data: {
    bookingId: number;
    fuelLevel: number;
    odometer: number;
    condition: string;
    accessories: string[];
    signature: string;
    staffName?: string;
    damagePoints?: DamagePoint[];
  }): HandoverRecord {
    const bookings = this.getBookings();
    const b = bookings.find((x) => x.id === data.bookingId);
    if (!b) throw new Error("Booking not found");

    const handovers = this.getHandovers();
    const nextId = handovers.length > 0 ? Math.max(...handovers.map((h) => h.id)) + 1 : 501;

    const newHandover: HandoverRecord = {
      id: nextId,
      bookingId: data.bookingId,
      vehicleId: b.vehicleId,
      staffName: data.staffName || "Rachel Green",
      handoverAt: new Date().toISOString(),
      fuelLevel: data.fuelLevel,
      odometer: data.odometer,
      condition: data.condition,
      accessories: data.accessories,
      signature: data.signature,
      gpsActive: true,
      damagePoints: data.damagePoints || [],
      notes: "Digital vehicle inspection completed. Keys released.",
    };

    safeSet(STORAGE_KEYS.HANDOVERS, [newHandover, ...handovers]);

    // Update booking to 'active'
    const updatedBookings = bookings.map((x) =>
      x.id === data.bookingId
        ? { ...x, status: "active" as const, handoverId: newHandover.id }
        : x
    );
    safeSet(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Update vehicle to 'rented' and active on GPS map
    const fleet = this.getFleet();
    const updatedFleet = fleet.map((v) =>
      v.id === b.vehicleId
        ? {
            ...v,
            status: "rented" as const,
            fuelLevel: data.fuelLevel,
            mileage: data.odometer,
            activeBookingId: b.id,
            currentDriverName: b.customerName,
            speed: 38, // simulated moving vehicle
          }
        : v
    );
    safeSet(STORAGE_KEYS.FLEET, updatedFleet);

    // Real-time alerts across roles
    this.addNotification({
      title: "Vehicle Handover Completed!",
      message: `Your rental is now ACTIVE! Keys handed over for ${b.vehicleName}. Enjoy your journey!`,
      type: "success",
      targetRole: "customer",
      userId: b.customerId,
      actionUrl: "/customer/active-rental",
    });

    this.addNotification({
      title: "Fleet Dispatched",
      message: `${b.vehicleName} (${b.vehicleReg}) handed over to ${b.customerName}.`,
      type: "info",
      targetRole: "admin",
      actionUrl: "/admin/live",
    });

    this.logActivity({
      user: data.staffName || "Rachel Green",
      role: "staff",
      action: "Vehicle Handover Completed",
      affectedEntity: "handover",
      entityId: b.bookingCode,
      status: "success",
      details: `Keys dispatched for ${b.vehicleName}. Booking #${b.bookingCode} -> ACTIVE. Vehicle -> RENTED.`,
    });

    return newHandover;
  },

  // ---------------------------------------------------------------------------
  // Action 5: Staff performs Vehicle Return & Damage Comparison
  // Lifecycle: Compare Pre-rental vs Post-rental condition -> Calculate fuel/mileage/damage
  // -> Move vehicle to "available" OR "maintenance" -> Customer rental completes!
  // ---------------------------------------------------------------------------
  performReturn(data: {
    bookingId: number;
    returnFuelLevel: number;
    returnOdometer: number;
    condition: string;
    newDamagePoints: DamagePoint[];
    sendToMaintenance: boolean;
    maintenanceReason?: string;
    staffName?: string;
    notes?: string;
  }): ReturnRecord {
    const bookings = this.getBookings();
    const b = bookings.find((x) => x.id === data.bookingId);
    if (!b) throw new Error("Booking not found");

    const handovers = this.getHandovers();
    const handover = handovers.find((h) => h.bookingId === data.bookingId);

    const pricing = this.getPricing();
    const preOdo = handover ? handover.odometer : 15000;
    const preFuel = handover ? handover.fuelLevel : 100;

    // Fuel deficit cost
    const fuelDeficit = Math.max(0, preFuel - data.returnFuelLevel);
    const fuelDeficitCost = fuelDeficit * pricing.fuelPenaltyPerPercent;

    // Mileage allowance calculation (default 250km/day)
    const kmDriven = Math.max(0, data.returnOdometer - preOdo);
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    const rentalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const allowance = rentalDays * pricing.mileageAllowancePerDay;
    const excessKm = Math.max(0, kmDriven - allowance);
    const extraMileageCost = excessKm * pricing.extraMileagePerKm;

    // Damage cost
    const damageCost = data.newDamagePoints.reduce((acc, d) => acc + (d.repairCostEstimate || 0), 0);
    const totalAdditionalCharge = fuelDeficitCost + extraMileageCost + damageCost;

    const returnRecord: ReturnRecord = {
      id: Date.now(),
      bookingId: b.id,
      vehicleId: b.vehicleId,
      staffName: data.staffName || "Rachel Green",
      returnedAt: new Date().toISOString(),
      fuelLevel: data.returnFuelLevel,
      odometer: data.returnOdometer,
      condition: data.condition,
      fuelDeficitCost,
      extraMileageCost,
      damageCost,
      totalAdditionalCharge,
      newDamagePoints: data.newDamagePoints,
      preExistingDamagePoints: handover ? handover.damagePoints : [],
      sentToMaintenance: data.sendToMaintenance || data.newDamagePoints.length > 0,
      maintenanceReason: data.maintenanceReason || (data.newDamagePoints.length > 0 ? "Post-rental damage repairs" : undefined),
      notes: data.notes,
    };

    // Update booking status -> completed
    const updatedBookings = bookings.map((x) =>
      x.id === data.bookingId
        ? {
            ...x,
            status: "completed" as const,
            returnId: returnRecord.id,
            totalCost: x.totalCost + totalAdditionalCharge,
          }
        : x
    );
    safeSet(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Fleet state transition:
    // If damage recorded or sendToMaintenance checked -> 'maintenance'
    // Else -> 'available'
    const nextVehicleStatus = returnRecord.sentToMaintenance ? ("maintenance" as const) : ("available" as const);

    const fleet = this.getFleet();
    const updatedFleet = fleet.map((v) =>
      v.id === b.vehicleId
        ? {
            ...v,
            status: nextVehicleStatus,
            fuelLevel: data.returnFuelLevel,
            mileage: data.returnOdometer,
            activeBookingId: undefined,
            currentDriverName: undefined,
            speed: 0,
            inMaintenance: returnRecord.sentToMaintenance,
          }
        : v
    );
    safeSet(STORAGE_KEYS.FLEET, updatedFleet);

    // If sent to maintenance, automatically generate a Maintenance Work Order!
    if (returnRecord.sentToMaintenance) {
      const jobs = this.getMaintenanceJobs();
      const nextJobId = jobs.length > 0 ? Math.max(...jobs.map((j) => j.id)) + 1 : 201;

      const newJob: MaintenanceJob = {
        id: nextJobId,
        jobCode: `JOB-${nextJobId}`,
        vehicleId: b.vehicleId,
        vehicleName: b.vehicleName,
        vehicleReg: b.vehicleReg,
        vehicleCategory: b.category,
        title: data.maintenanceReason || "Post-Rental Inspection & Damage Repair",
        problemDescription: `Vehicle returned with condition notes: ${data.condition}. Identified issues: ${data.newDamagePoints.map((d) => `${d.area} (${d.severity}): ${d.description}`).join("; ") || "General post-rental servicing."}`,
        priority: damageCost > 3000 ? "high" : "medium",
        status: "pending",
        assignedTechnician: "Mike Mechanic",
        dateCreated: new Date().toISOString().slice(0, 10),
        serviceDueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        estimatedCost: damageCost || 2500,
        actualCost: 0,
        partsUsed: [],
        notes: "Auto-generated from rental return inspection.",
        serviceChecklist: [
          { task: "Detailed damage survey", done: false },
          { task: "Repair/replace damaged components", done: false },
          { task: "Safety & roadworthiness signoff", done: false },
        ],
      };

      safeSet(STORAGE_KEYS.MAINTENANCE, [newJob, ...jobs]);

      this.addNotification({
        title: "Vehicle Sent to Maintenance",
        message: `${b.vehicleName} (${b.vehicleReg}) requires maintenance inspection (#JOB-${nextJobId}).`,
        type: "warning",
        targetRole: "maintenance",
        actionUrl: "/maintenance/jobs",
      });
    }

    // Customer Notification
    this.addNotification({
      title: "Rental Completed & Invoiced",
      message: `Your return inspection for Booking #${b.bookingCode} is complete. Total charges: ₹${(b.totalCost + totalAdditionalCharge).toLocaleString()}.`,
      type: "info",
      targetRole: "customer",
      userId: b.customerId,
      actionUrl: "/customer/payments",
    });

    this.logActivity({
      user: data.staffName || "Rachel Green",
      role: "staff",
      action: "Vehicle Return Processed",
      affectedEntity: "return",
      entityId: b.bookingCode,
      status: "success",
      details: `Returned with ${data.newDamagePoints.length} new damages. Extra charges: ₹${totalAdditionalCharge}. Vehicle status -> ${nextVehicleStatus.toUpperCase()}.`,
    });

    return returnRecord;
  },

  // ---------------------------------------------------------------------------
  // Action 6: Maintenance Staff completes Work Order
  // Lifecycle: Work order completed -> Vehicle returns to "AVAILABLE" -> Appears in Customer search again!
  // ---------------------------------------------------------------------------
  updateMaintenanceJobStatus(jobId: number, nextStatus: MaintenanceJob["status"], actualCost?: number, notes?: string): void {
    const jobs = this.getMaintenanceJobs();
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const updatedJobs = jobs.map((j) =>
      j.id === jobId
        ? {
            ...j,
            status: nextStatus,
            actualCost: actualCost !== undefined ? actualCost : j.actualCost,
            notes: notes ? `${j.notes}\n${notes}` : j.notes,
            dateCompleted: nextStatus === "completed" ? new Date().toISOString().slice(0, 10) : j.dateCompleted,
          }
        : j
    );
    safeSet(STORAGE_KEYS.MAINTENANCE, updatedJobs);

    // If completed -> Restore vehicle to 'available'
    if (nextStatus === "completed") {
      const fleet = this.getFleet();
      const updatedFleet = fleet.map((v) =>
        v.id === job.vehicleId
          ? {
              ...v,
              status: "available" as const,
              inMaintenance: false,
              lastServiceDate: new Date().toISOString().slice(0, 10),
            }
          : v
      );
      safeSet(STORAGE_KEYS.FLEET, updatedFleet);

      this.addNotification({
        title: "Vehicle Returned to Service",
        message: `${job.vehicleName} (${job.vehicleReg}) passed maintenance and is now AVAILABLE for customer booking!`,
        type: "success",
        targetRole: "staff",
        actionUrl: "/staff/vehicles",
      });

      this.addNotification({
        title: "Fleet Inventory Updated",
        message: `${job.vehicleName} returned to active fleet.`,
        type: "success",
        targetRole: "admin",
        actionUrl: "/admin/vehicles",
      });

      this.logActivity({
        user: "Mike Mechanic",
        role: "maintenance",
        action: "Maintenance Completed",
        affectedEntity: "maintenance",
        entityId: job.jobCode,
        status: "success",
        details: `Work Order #${job.jobCode} marked COMPLETED. Vehicle ${job.vehicleReg} status -> AVAILABLE.`,
      });
    } else {
      this.logActivity({
        user: "Mike Mechanic",
        role: "maintenance",
        action: "Job Status Updated",
        affectedEntity: "maintenance",
        entityId: job.jobCode,
        status: "info",
        details: `Job #${job.jobCode} transitioned to ${nextStatus.toUpperCase()}.`,
      });
    }
  },

  createMaintenanceJob(data: Omit<MaintenanceJob, "id" | "jobCode" | "dateCreated">): MaintenanceJob {
    const jobs = this.getMaintenanceJobs();
    const nextId = jobs.length > 0 ? Math.max(...jobs.map((j) => j.id)) + 1 : 201;

    const newJob: MaintenanceJob = {
      ...data,
      id: nextId,
      jobCode: `JOB-${nextId}`,
      dateCreated: new Date().toISOString().slice(0, 10),
    };

    safeSet(STORAGE_KEYS.MAINTENANCE, [newJob, ...jobs]);

    // Set vehicle status to maintenance
    const fleet = this.getFleet();
    const updatedFleet = fleet.map((v) =>
      v.id === data.vehicleId ? { ...v, status: "maintenance" as const, inMaintenance: true } : v
    );
    safeSet(STORAGE_KEYS.FLEET, updatedFleet);

    this.logActivity({
      user: "System Admin",
      role: "admin",
      action: "Work Order Created",
      affectedEntity: "maintenance",
      entityId: newJob.jobCode,
      status: "warning",
      details: `Work order created for ${data.vehicleName}. Vehicle set to MAINTENANCE.`,
    });

    return newJob;
  },

  // ---------------------------------------------------------------------------
  // Action 7: Admin / Staff Vehicle Management
  // ---------------------------------------------------------------------------
  addVehicle(vehicleData: Omit<FleetVehicle, "id">): FleetVehicle {
    const fleet = this.getFleet();
    const nextId = fleet.length > 0 ? Math.max(...fleet.map((v) => v.id)) + 1 : 1;
    const newVehicle: FleetVehicle = {
      ...vehicleData,
      id: nextId,
    };
    safeSet(STORAGE_KEYS.FLEET, [newVehicle, ...fleet]);

    this.logActivity({
      user: "System Admin",
      role: "admin",
      action: "Vehicle Added",
      affectedEntity: "vehicle",
      entityId: newVehicle.registrationNumber,
      status: "success",
      details: `Added ${newVehicle.make} ${newVehicle.model} (${newVehicle.year}) to fleet.`,
    });

    return newVehicle;
  },

  updateVehicle(id: number, updates: Partial<FleetVehicle>): void {
    const fleet = this.getFleet();
    const updated = fleet.map((v) => (v.id === id ? { ...v, ...updates } : v));
    safeSet(STORAGE_KEYS.FLEET, updated);

    this.logActivity({
      user: "Staff",
      role: "staff",
      action: "Vehicle Updated",
      affectedEntity: "vehicle",
      entityId: id,
      status: "info",
      details: `Updated attributes for vehicle #${id}.`,
    });
  },

  deleteVehicle(id: number): void {
    const fleet = this.getFleet();
    safeSet(STORAGE_KEYS.FLEET, fleet.filter((v) => v.id !== id));

    this.logActivity({
      user: "System Admin",
      role: "admin",
      action: "Vehicle Removed",
      affectedEntity: "vehicle",
      entityId: id,
      status: "danger",
      details: `Decommissioned vehicle #${id} from active fleet.`,
    });
  },

  // ---------------------------------------------------------------------------
  // Action 8: Admin User Management
  // ---------------------------------------------------------------------------
  createUser(userData: Omit<UserAccount, "id" | "createdAt">): UserAccount {
    const users = this.getUsers();
    const nextId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const newUser: UserAccount = {
      ...userData,
      id: nextId,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    safeSet(STORAGE_KEYS.USERS, [newUser, ...users]);

    this.logActivity({
      user: "System Admin",
      role: "admin",
      action: "User Created",
      affectedEntity: "user",
      entityId: newUser.email,
      status: "success",
      details: `Created new user account for ${newUser.name} with role ${newUser.role.toUpperCase()}.`,
    });

    return newUser;
  },

  updateUser(id: number, updates: Partial<UserAccount>): void {
    const users = this.getUsers();
    safeSet(STORAGE_KEYS.USERS, users.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  },

  toggleUserStatus(id: number): void {
    const users = this.getUsers();
    const updated = users.map((u) =>
      u.id === id ? { ...u, status: u.status === "active" ? ("suspended" as const) : ("active" as const) } : u
    );
    safeSet(STORAGE_KEYS.USERS, updated);
  },

  // ---------------------------------------------------------------------------
  // Action 9: Admin Pricing & Locations
  // ---------------------------------------------------------------------------
  updatePricing(newConfig: Partial<PricingConfig>): void {
    const current = this.getPricing();
    const updated = { ...current, ...newConfig };
    safeSet(STORAGE_KEYS.PRICING, updated);

    this.logActivity({
      user: "System Admin",
      role: "admin",
      action: "Pricing Updated",
      affectedEntity: "pricing",
      entityId: "CONFIG",
      status: "info",
      details: "System pricing parameters updated.",
    });
  },

  // ---------------------------------------------------------------------------
  // Notifications & Logging
  // ---------------------------------------------------------------------------
  addNotification(notif: Omit<SystemNotification, "id" | "read" | "timestamp">): void {
    const notifs = this.getNotifications();
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      read: false,
      timestamp: "Just now",
    };
    safeSet(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
  },

  markAllNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    safeSet(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  logActivity(log: Omit<ActivityLog, "id" | "timestamp">): void {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      ...log,
      id: `act-${Date.now()}`,
      timestamp: "Just now",
    };
    safeSet(STORAGE_KEYS.ACTIVITY, [newLog, ...logs.slice(0, 99)]); // keep latest 100
  },

  // Reset store to fresh initial state
  resetAll(): void {
    safeSet(STORAGE_KEYS.FLEET, INITIAL_FLEET);
    safeSet(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    safeSet(STORAGE_KEYS.USERS, INITIAL_USERS);
    safeSet(STORAGE_KEYS.HANDOVERS, INITIAL_HANDOVERS);
    safeSet(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_JOBS);
    safeSet(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    safeSet(STORAGE_KEYS.ACTIVITY, INITIAL_ACTIVITY);
    safeSet(STORAGE_KEYS.PRICING, INITIAL_PRICING);
    safeSet(STORAGE_KEYS.LOCATIONS, INITIAL_LOCATIONS);
  },
};
