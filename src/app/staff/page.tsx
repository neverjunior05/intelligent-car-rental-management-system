"use client";

import Link from "next/link";
import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/portal/Toast";
import Drawer from "@/components/portal/Drawer";

import { useAuth } from "@/components/AuthProvider";

export default function StaffDashboard() {
  const { user } = useAuth();
  const { fleet, bookings, maintenanceJobs, activityLogs, actions } = useRentalStore();
  const { success, warning } = useToast();

  const [selectedDriverDoc, setSelectedDriverDoc] = useState<any>(null);

  const staffName = user?.name || "Rachel Green";

  // Operational metrics
  const totalVehicles = fleet.length;
  const availableVehicles = fleet.filter((v) => v.status === "available").length;
  const rentedVehicles = fleet.filter((v) => v.status === "rented").length;
  const reservedVehicles = fleet.filter((v) => v.status === "reserved").length;
  const maintenanceVehicles = fleet.filter((v) => v.status === "maintenance").length;

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const activeRentals = bookings.filter((b) => b.status === "active");
  const awaitingKyc = bookings.filter((b) => b.driverVerification === "under_review");

  function handleVerifyDoc(bookingId: number, approve: boolean) {
    actions.verifyDriverDocument(bookingId, approve, approve ? `Verified by ${staffName} (Staff)` : "Unclear scan. Please re-upload.", staffName);
    setSelectedDriverDoc(null);
    if (approve) {
      success("Driver Verified!", "Customer notified. Booking is ready for digital handover.");
    } else {
      warning("Document Rejected", "Customer notified to provide an updated scan.");
    }
  }

  function handleQuickConfirm(bookingId: number) {
    actions.confirmBooking(bookingId, staffName);
    success("Booking Confirmed!", `Booking #${bookingId} confirmed and customer alerted.`);
  }

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Staff Operational Control Center"
      breadcrumb={[{ label: "Operations" }]}
    >
      <div className="space-y-8 animate-fade-up">
        {/* Welcome & Shift Brief */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-app bg-gradient-to-r from-elev via-soft/40 to-elev p-6 sm:p-8 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500 mb-2">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Front Desk Operations Active · Terminal 1 Depot
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-app">
              Operations Hub · <span className="text-orange">{staffName}</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-soft">
              Real-time rental queues, digital vehicle dispatching, return condition checks, and KYC verification.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/staff/handover" className="btn-primary px-5 py-2.5 text-xs font-bold shadow-md">
              + Start Digital Handover
            </Link>
            <Link href="/staff/returns" className="btn-ghost px-4 py-2.5 text-xs font-semibold">
              Vehicle Returns Check-in
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* OPERATIONAL KPI METRICS GRID                                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card rounded-2xl p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">Pending Confirmation</span>
              <span className="text-xl">⏳</span>
            </div>
            <p className="mt-3 text-2xl font-black text-amber-500">{pendingBookings.length}</p>
            <p className="text-xs text-soft mt-1">Bookings awaiting approval</p>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">Awaiting Handover</span>
              <span className="text-xl">📋</span>
            </div>
            <p className="mt-3 text-2xl font-black text-blue-500">{confirmedBookings.length}</p>
            <p className="text-xs text-soft mt-1">Confirmed & ready for pickup</p>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-orange">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">Active On Road</span>
              <span className="text-xl">🚗</span>
            </div>
            <p className="mt-3 text-2xl font-black text-orange">{rentedVehicles}</p>
            <p className="text-xs text-soft mt-1">Active customer rentals</p>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">In Maintenance</span>
              <span className="text-xl">🔧</span>
            </div>
            <p className="mt-3 text-2xl font-black text-red-500">{maintenanceVehicles}</p>
            <p className="text-xs text-soft mt-1">Unavailable for customer booking</p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TWO COLUMNS: Actionable Queues vs Live Operational Feed             */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Action Queues (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Pending KYC Verification Queue */}
            <div className="card rounded-3xl p-6 border border-app">
              <div className="flex items-center justify-between pb-4 border-b border-app">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🪪</span>
                  <div>
                    <h3 className="font-bold text-app text-sm">Pending KYC Document Approvals</h3>
                    <p className="text-xs text-soft">Review uploaded driver licenses before vehicle release</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                  {awaitingKyc.length} Pending
                </span>
              </div>

              {awaitingKyc.length === 0 ? (
                <p className="text-center text-xs text-soft py-6">All driver documents are verified and clear.</p>
              ) : (
                <div className="divide-y divide-app mt-2">
                  {awaitingKyc.map((b) => (
                    <div key={b.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-app">{b.customerName}</span>
                          <span className="text-soft">({b.customerEmail})</span>
                        </div>
                        <p className="text-soft mt-0.5">
                          Booking #{b.bookingCode} · Car: <span className="font-semibold text-app">{b.vehicleName}</span>
                        </p>
                        <p className="text-[11px] text-amber-500 font-medium">
                          License: {b.driver?.licenseNumber || "Uploaded Document"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDriverDoc(b)}
                          className="btn-ghost px-3 py-1.5 text-xs font-semibold"
                        >
                          Inspect Scan
                        </button>
                        <button
                          onClick={() => handleVerifyDoc(b.id, true)}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow transition cursor-pointer"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleVerifyDoc(b.id, false)}
                          className="rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Today's Bookings & Ready for Handover */}
            <div className="card rounded-3xl p-6 border border-app">
              <div className="flex items-center justify-between pb-4 border-b border-app">
                <div>
                  <h3 className="font-bold text-app text-sm">Bookings Requiring Staff Action</h3>
                  <p className="text-xs text-soft">Confirm reservations or initiate digital handover</p>
                </div>
                <Link href="/staff/bookings" className="text-xs font-bold text-orange hover:underline">
                  Full Table ({bookings.length}) →
                </Link>
              </div>

              <div className="divide-y divide-app mt-2">
                {bookings.slice(0, 4).map((b) => (
                  <div key={b.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 rounded-xl overflow-hidden bg-soft shrink-0">
                        {b.vehicleImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={b.vehicleImage} alt={b.vehicleName} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-app">{b.customerName}</span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="text-soft mt-0.5">
                          {b.vehicleName} · Reg: <span className="font-semibold text-app">{b.vehicleReg}</span>
                        </p>
                        <p className="text-[11px] text-soft">
                          Pickup: {b.pickupLocation} · Amount: <strong className="text-orange">₹{b.totalCost.toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === "pending" && (
                        <button
                          onClick={() => handleQuickConfirm(b.id)}
                          className="btn-primary px-3 py-1.5 text-xs font-bold"
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <Link
                          href={`/staff/handover?bookingId=${b.id}`}
                          className="btn-primary px-3 py-1.5 text-xs font-bold"
                        >
                          Start Handover →
                        </Link>
                      )}
                      {b.status === "active" && (
                        <Link
                          href={`/staff/returns?bookingId=${b.id}`}
                          className="btn-ghost px-3 py-1.5 text-xs font-bold text-orange hover:!border-orange"
                        >
                          Check-in Return →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Operational Activity Feed */}
          <div className="space-y-6">
            {/* Activity Stream */}
            <div className="card rounded-3xl p-6 border border-app">
              <div className="flex items-center justify-between pb-3 border-b border-app">
                <h3 className="font-bold text-app text-sm">Real-Time Activity Feed</h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>

              <div className="mt-4 space-y-3.5 text-xs">
                {activityLogs.slice(0, 6).map((act) => (
                  <div key={act.id} className="relative pl-4 border-l-2 border-app">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-app">{act.action}</span>
                      <span className="text-[10px] text-soft shrink-0">{act.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-soft text-[11px] leading-relaxed">{act.details}</p>
                    <span className="mt-1 inline-block rounded bg-soft px-1.5 py-0.5 text-[9px] font-bold text-soft uppercase tracking-wider">
                      by {act.user} ({act.role})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Fleet Readiness Summary */}
            <div className="card rounded-3xl p-6 border border-app space-y-3 text-xs">
              <h3 className="font-bold text-app text-sm">Fleet Status Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-app">
                  <span className="text-soft">Total Fleet Units:</span>
                  <span className="font-bold text-app">{totalVehicles} Vehicles</span>
                </div>
                <div className="flex justify-between py-1 border-b border-app">
                  <span className="text-soft">Ready for Rent:</span>
                  <span className="font-bold text-emerald-500">{availableVehicles} Available</span>
                </div>
                <div className="flex justify-between py-1 border-b border-app">
                  <span className="text-soft">Dispatched / Rented:</span>
                  <span className="font-bold text-orange">{rentedVehicles} On Road</span>
                </div>
                <div className="flex justify-between py-1 border-b border-app">
                  <span className="text-soft">In Workshop / Service:</span>
                  <span className="font-bold text-red-500">{maintenanceVehicles} In Repair</span>
                </div>
              </div>

              <Link
                href="/staff/vehicles"
                className="btn-ghost w-full py-2 text-center text-xs font-bold block mt-2"
              >
                Manage Fleet Inventory →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Driver License Scan Inspection Drawer */}
      <Drawer
        isOpen={!!selectedDriverDoc}
        onClose={() => setSelectedDriverDoc(null)}
        title="Inspect Customer KYC Driver License"
        subtitle={`Renter: ${selectedDriverDoc?.customerName} (${selectedDriverDoc?.bookingCode})`}
      >
        {selectedDriverDoc && (
          <div className="space-y-4 text-xs">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-black border border-app">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedDriverDoc.driver?.licenseFrontUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80"}
                alt="License Scan"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="rounded-2xl border border-app bg-soft p-4 space-y-2 text-soft">
              <div className="flex justify-between">
                <span>Renter Name:</span>
                <span className="font-bold text-app">{selectedDriverDoc.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>License Number:</span>
                <span className="font-bold text-app">{selectedDriverDoc.driver?.licenseNumber || "DL-9981234"}</span>
              </div>
              <div className="flex justify-between">
                <span>Expiry Date:</span>
                <span className="font-bold text-app">{selectedDriverDoc.driver?.licenseExpiry || "2029-08-15"}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleVerifyDoc(selectedDriverDoc.id, true)}
                className="btn-primary flex-1 py-2.5 text-xs font-bold"
              >
                ✓ Approve Verification
              </button>
              <button
                onClick={() => handleVerifyDoc(selectedDriverDoc.id, false)}
                className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 px-4 py-2.5 text-xs font-bold hover:bg-red-500 hover:text-white transition"
              >
                ✕ Reject
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
