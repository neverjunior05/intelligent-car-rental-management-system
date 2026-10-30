export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  registrationNumber: string;
  category: string;
  fuelType: "petrol" | "diesel" | "electric" | "hybrid";
  transmission: "manual" | "automatic";
  seats: number;
  mileage: number;
  fuelLevel: number;
  dailyRate: string;
  status: "available" | "reserved" | "rented" | "returned" | "maintenance";
  imageUrl: string | null;
  locationId: number | null;
  color?: string;
}

export interface Booking {
  id: number;
  customerId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  totalCost: string;
  createdAt: string;
}

export interface Driver {
  id: number;
  bookingId: number;
  name: string;
  licenseNumber: string;
  idNumber: string;
  licenseExpiry: string | null;
  verified: boolean;
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: string;
  method: "card" | "upi" | "bank_transfer";
  status: string;
  transactionRef: string | null;
  isDeposit: boolean;
}

export interface Invoice {
  id: number;
  bookingId: number;
  baseCost: string;
  extraMileageCharge: string;
  fuelCharge: string;
  damageCharge: string;
  totalAmount: string;
}

export interface Handover {
  id: number;
  bookingId: number;
  fuelLevel: number;
  odometer: number;
  condition: string;
  accessories: string | null;
  signature: string | null;
}

export interface ReturnRecord {
  id: number;
  bookingId: number;
  fuelLevel: number;
  odometer: number;
  condition: string;
  notes: string | null;
}
