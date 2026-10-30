"use client";

import Link from "next/link";
import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/portal/EmptyState";
import Drawer from "@/components/portal/Drawer";

import { useAuth } from "@/components/AuthProvider";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { fleet, bookings, handovers, notifications } = useRentalStore();
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<any>(null);

  const currentUserId = user?.id || user?.userId;
  const currentUserEmail = user?.email?.toLowerCase();

  const myBookings = bookings.filter((b) =>
    (currentUserId && b.customerId === currentUserId) ||
    (currentUserEmail && b.customerEmail?.toLowerCase() === currentUserEmail)
  );
  const activeRental = myBookings.find((b) => b.status === "active");
  const upcomingBooking = myBookings.find((b) => b.status === "confirmed" || b.status === "pending");
  const completedBookings = myBookings.filter((b) => b.status === "completed");

  const activeVehicle = activeRental ? fleet.find((v) => v.id === activeRental.vehicleId) : null;
  const activeHandover = activeRental ? handovers.find((h) => h.bookingId === activeRental.id) : null;

  // Recommended vehicles (available only)
  const recommendedCars = fleet.filter((v) => v.status === "available").slice(0, 3);

  // Calculate rental countdown if active
  const remainingHours = activeRental
    ? Math.max(0, Math.round((new Date(activeRental.endDate).getTime() - Date.now()) / (1000 * 60 * 60)))
    : 0;

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="Customer Dashboard"
      breadcrumb={[{ label: "Overview" }]}
    >
      <div className="space-y-8 animate-fade-up">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-app bg-gradient-to-r from-elev via-soft/50 to-elev p-6 sm:p-8 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-3 py-1 text-xs font-bold text-orange mb-2">
              <span className="h-2 w-2 rounded-full bg-orange animate-pulse" />
              Verified Driver · Gold Tier
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-app">
              Welcome back, <span className="text-orange">{user?.name ? user.name.split(" ")[0] : "Customer"}</span> 👋
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-soft">
              Manage your rentals, track live vehicle telemetry, and browse premium fleet additions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/customer/fleet" className="btn-primary px-5 py-2.5 text-xs font-bold shadow-md">
              + Book New Car
            </Link>
            <Link href="/customer/documents" className="btn-ghost px-4 py-2.5 text-xs font-semibold">
              KYC Documents
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* ACTIVE RENTAL SPOTLIGHT (Hero Card if active rental exists)         */}
        {/* ------------------------------------------------------------------ */}
        {activeRental && activeVehicle ? (
          <div className="relative overflow-hidden rounded-3xl border border-orange/40 bg-gradient-to-br from-elev via-orange/5 to-elev p-6 sm:p-8 shadow-xl">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-orange/10 blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-app/60">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange">
                    Active Rental Cockpit
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-app">
                    {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-app bg-elev px-4 py-2 text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-soft block">
                    Time Remaining
                  </span>
                  <span className="text-lg font-black text-orange">
                    {remainingHours} Hours left
                  </span>
                </div>
                <Link
                  href="/customer/active-rental"
                  className="btn-primary px-4 py-2 text-xs font-bold"
                >
                  Live GPS Map →
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3 mt-6 items-center">
              {/* Car Image + Reg */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-soft shadow-inner">
                {activeVehicle.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeVehicle.imageUrl}
                    alt={activeVehicle.model}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : null}
                <div className="absolute bottom-2 left-2 rounded-lg bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
                  Reg: {activeVehicle.registrationNumber}
                </div>
              </div>

              {/* Real-time Telemetry Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
                    Speed / Movement
                  </span>
                  <span className="text-base font-black text-emerald-500 mt-1 block">
                    {activeVehicle.speed > 0 ? `${activeVehicle.speed} km/h (Moving)` : "Parked Safe"}
                  </span>
                  <span className="text-[10px] text-soft">Live satellite ping</span>
                </div>

                <div className="card rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
                    Fuel Gauge
                  </span>
                  <span className="text-base font-black text-app mt-1 block">
                    {activeVehicle.fuelLevel}% Full
                  </span>
                  <span className="text-[10px] text-soft">100% full return req.</span>
                </div>

                <div className="card rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
                    Odometer
                  </span>
                  <span className="text-base font-black text-app mt-1 block">
                    {activeVehicle.mileage.toLocaleString()} km
                  </span>
                  <span className="text-[10px] text-soft">250 km/day included</span>
                </div>

                <div className="card rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
                    Digital Handover
                  </span>
                  <span className="text-base font-black text-emerald-500 mt-1 block">
                    Signed ✓
                  </span>
                  <span className="text-[10px] text-soft">Keys dispatched</span>
                </div>
              </div>

              {/* Handover & Location Brief */}
              <div className="rounded-2xl border border-app bg-soft/50 p-4 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
                    Return Deadline
                  </span>
                  <p className="font-semibold text-app mt-0.5">
                    {new Date(activeRental.endDate).toLocaleDateString()} @ {activeRental.returnLocation}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
                    Roadside Assistance Hotline
                  </span>
                  <p className="font-bold text-orange mt-0.5">1800-VELOCE-CARE (24/7)</p>
                </div>
                <div className="pt-2 border-t border-app">
                  <Link
                    href="/customer/active-rental"
                    className="text-xs font-bold text-orange hover:underline block"
                  >
                    View Handover Sheet & Request Extension →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ------------------------------------------------------------------ */}
        {/* KPI METRICS OVERVIEW                                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card rounded-2xl p-5">
            <span className="text-2xl">🗓️</span>
            <p className="mt-3 text-2xl font-black text-app">{myBookings.length}</p>
            <p className="text-xs text-soft font-semibold">Total Lifetime Bookings</p>
          </div>
          <div className="card rounded-2xl p-5">
            <span className="text-2xl">🚗</span>
            <p className="mt-3 text-2xl font-black text-app">
              {activeRental ? "1 Active" : "No Active Drive"}
            </p>
            <p className="text-xs text-soft font-semibold">Current Rental Status</p>
          </div>
          <div className="card rounded-2xl p-5">
            <span className="text-2xl">🪪</span>
            <p className="mt-3 text-2xl font-black text-emerald-500">Verified ✓</p>
            <p className="text-xs text-soft font-semibold">Driver License KYC</p>
          </div>
          <div className="card rounded-2xl p-5">
            <span className="text-2xl">💳</span>
            <p className="mt-3 text-2xl font-black text-app">₹0.00</p>
            <p className="text-xs text-soft font-semibold">Outstanding Due Balance</p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TWO-COLUMN: Bookings Queue vs Document Status & Alerts             */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upcoming & Recent Bookings (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-app tracking-tight">My Rental Bookings</h3>
              <Link href="/customer/bookings" className="text-xs font-bold text-orange hover:underline">
                View All Bookings →
              </Link>
            </div>

            {myBookings.length === 0 ? (
              <EmptyState
                icon="🗓️"
                title="No bookings yet"
                description="Browse our fleet to reserve your first luxury or daily drive."
                actionText="Explore Fleet"
                actionHref="/customer/fleet"
              />
            ) : (
              <div className="space-y-3">
                {myBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="card rounded-2xl p-4 flex flex-wrap items-center gap-4">
                    <div className="h-16 w-24 rounded-xl overflow-hidden bg-soft shrink-0">
                      {b.vehicleImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.vehicleImage} alt={b.vehicleName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">🚗</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-app text-sm">{b.vehicleName}</h4>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="mt-1 text-xs text-soft">
                        {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-soft">
                        Pickup: <span className="text-app font-medium">{b.pickupLocation}</span> · Total:{" "}
                        <span className="font-bold text-orange">₹{b.totalCost.toLocaleString()}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInvoiceBooking(b)}
                        className="btn-ghost px-3 py-1.5 text-xs font-semibold"
                      >
                        Invoice
                      </button>
                      <Link
                        href={b.status === "active" ? "/customer/active-rental" : "/customer/bookings"}
                        className="btn-primary px-3 py-1.5 text-xs font-bold"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Available Fleet Carousel */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-soft">
                  Recommended Available Cars
                </h4>
                <Link href="/customer/fleet" className="text-xs font-bold text-orange hover:underline">
                  Full Catalog ({fleet.filter((v) => v.status === "available").length}) →
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {recommendedCars.map((c) => (
                  <Link
                    key={c.id}
                    href={`/customer/fleet?selected=${c.id}`}
                    className="card rounded-2xl p-3 block group hover:border-orange transition"
                  >
                    <div className="h-28 rounded-xl overflow-hidden bg-soft mb-2.5">
                      {c.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.imageUrl}
                          alt={c.model}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      )}
                    </div>
                    <h5 className="font-bold text-app text-xs truncate">
                      {c.make} {c.model}
                    </h5>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-soft capitalize">{c.transmission}</span>
                      <span className="font-black text-orange">₹{Number(c.dailyRate).toLocaleString()}/d</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Document Verification & Notifications Feed */}
          <div className="space-y-6">
            {/* KYC Status Card */}
            <div className="card rounded-3xl p-5 border border-app">
              <div className="flex items-center justify-between pb-3 border-b border-app">
                <h4 className="font-bold text-app text-sm">Driver Verification</h4>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
                  Approved
                </span>
              </div>
              <div className="mt-3 space-y-2 text-xs text-soft">
                <p>
                  <span className="font-semibold text-app">License:</span> DL-9981234
                </p>
                <p>
                  <span className="font-semibold text-app">Expiry:</span> 2029-08-15
                </p>
                <p>
                  <span className="font-semibold text-app">Verified by:</span> Rachel Green (Staff)
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  ✓ Ready for instant digital vehicle handovers.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-app">
                <Link
                  href="/customer/documents"
                  className="text-xs font-bold text-orange hover:underline"
                >
                  Manage Identification Documents →
                </Link>
              </div>
            </div>

            {/* Notification Stream */}
            <div className="card rounded-3xl p-5 border border-app">
              <h4 className="font-bold text-app text-sm mb-3">Recent Activity</h4>
              <div className="space-y-2.5">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="rounded-xl border border-app bg-soft/40 p-3 text-xs">
                    <span className="font-bold text-app block">{n.title}</span>
                    <p className="mt-0.5 text-soft text-[11px]">{n.message}</p>
                    <span className="text-[10px] text-soft mt-1 block opacity-75">{n.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Detail Drawer */}
      <Drawer
        isOpen={!!selectedInvoiceBooking}
        onClose={() => setSelectedInvoiceBooking(null)}
        title="Rental Tax Invoice"
        subtitle={`Booking Ref: ${selectedInvoiceBooking?.bookingCode || ""}`}
      >
        {selectedInvoiceBooking && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-app bg-soft p-4 space-y-2">
              <div className="flex justify-between font-bold text-sm text-app">
                <span>Veloce Car Rental Co.</span>
                <span>PAID ✓</span>
              </div>
              <p className="text-soft">Metropolis Central Station Depot</p>
              <p className="text-soft">Billed to: {selectedInvoiceBooking.customerName}</p>
            </div>

            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <div className="flex justify-between py-1 border-b border-app">
                <span>Vehicle:</span>
                <span className="font-bold text-app">{selectedInvoiceBooking.vehicleName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Registration:</span>
                <span className="font-bold text-app">{selectedInvoiceBooking.vehicleReg}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Base Rental Rate:</span>
                <span className="font-bold text-app">₹{selectedInvoiceBooking.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Refundable Deposit:</span>
                <span className="font-bold text-app">₹{selectedInvoiceBooking.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>GST (18% Included):</span>
                <span className="font-bold text-app">₹{(selectedInvoiceBooking.baseCost * 0.18).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-app border-t border-app">
                <span>Total Amount Paid:</span>
                <span className="text-orange">₹{selectedInvoiceBooking.totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn-primary flex-1 py-2 text-xs font-bold"
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
