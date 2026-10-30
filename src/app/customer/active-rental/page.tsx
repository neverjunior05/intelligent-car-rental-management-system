"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import FleetMap from "@/components/portal/FleetMap";
import Modal from "@/components/portal/Modal";
import EmptyState from "@/components/portal/EmptyState";
import { useToast } from "@/components/portal/Toast";

import { useAuth } from "@/components/AuthProvider";

export default function CustomerActiveRentalPage() {
  const { user } = useAuth();
  const { fleet, bookings, handovers } = useRentalStore();
  const { success } = useToast();

  const [extensionModalOpen, setExtensionModalOpen] = useState(false);
  const [extraDays, setExtraDays] = useState(2);

  const currentUserId = user?.id || user?.userId;
  const currentUserEmail = user?.email?.toLowerCase();

  // Active rental for logged-in customer
  const activeRental = bookings.find(
    (b) =>
      ((currentUserId && b.customerId === currentUserId) ||
        (currentUserEmail && b.customerEmail?.toLowerCase() === currentUserEmail)) &&
      b.status === "active"
  );
  const activeVehicle = activeRental ? fleet.find((v) => v.id === activeRental.vehicleId) : null;
  const activeHandover = activeRental ? handovers.find((h) => h.bookingId === activeRental.id) : null;

  function handleRequestExtension() {
    setExtensionModalOpen(false);
    success(
      "Extension Request Submitted!",
      `Requested ${extraDays} additional days for ${activeVehicle?.make} ${activeVehicle?.model}. Staff notified.`
    );
  }

  if (!activeRental || !activeVehicle) {
    return (
      <PortalShell
        activeRole="customer"
        pageTitle="Active Rental Cockpit"
        breadcrumb={[{ label: "Active Rental" }]}
      >
        <EmptyState
          icon="🔑"
          title="No Active Rental Right Now"
          description="You currently have no vehicles dispatched on an active drive. Reserve your next vehicle or check upcoming bookings."
          actionText="Browse Fleet & Book"
          actionHref="/customer/fleet"
        />
      </PortalShell>
    );
  }

  const remainingHours = Math.max(0, Math.round((new Date(activeRental.endDate).getTime() - Date.now()) / (1000 * 60 * 60)));

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="Active Rental Cockpit"
      breadcrumb={[{ label: "Active Rental" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Cockpit Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-orange/40 bg-gradient-to-r from-elev via-orange/5 to-elev p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange">
                  Live Active Drive
                </span>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
                  Online Telemetry
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-app">
                {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-app bg-elev px-4 py-2 text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-soft block">
                Countdown to Return
              </span>
              <span className="text-lg font-black text-orange">
                {remainingHours} Hours Remaining
              </span>
            </div>
            <button
              onClick={() => setExtensionModalOpen(true)}
              className="btn-primary px-4 py-2 text-xs font-bold"
            >
              Request Extension
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SATELLITE GPS FLEET TRACKING MAP                                   */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-soft">
              Real-Time GPS Satellite Tracking
            </h3>
            <span className="text-xs text-soft">
              Current Location: <span className="font-semibold text-app">{activeVehicle.currentAddress}</span>
            </span>
          </div>

          <FleetMap
            vehicles={[activeVehicle]}
            selectedVehicleId={activeVehicle.id}
            height="460px"
          />
        </div>

        {/* Telemetry Telemetrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
              Speed & Motion
            </span>
            <span className="text-2xl font-black text-emerald-500 mt-1 block">
              {activeVehicle.speed > 0 ? `${activeVehicle.speed} km/h` : "Parked (0 km/h)"}
            </span>
            <span className="text-xs text-soft">Live engine telemetry</span>
          </div>

          <div className="card rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
              Fuel Tank Level
            </span>
            <span className="text-2xl font-black text-app mt-1 block">
              {activeVehicle.fuelLevel}% Full
            </span>
            <span className="text-xs text-soft">Handover was 100% full</span>
          </div>

          <div className="card rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
              Current Odometer
            </span>
            <span className="text-2xl font-black text-app mt-1 block">
              {activeVehicle.mileage.toLocaleString()} km
            </span>
            <span className="text-xs text-soft">Free allowance: 250 km/day</span>
          </div>

          <div className="card rounded-2xl p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">
              Return Hub
            </span>
            <span className="text-sm font-black text-app mt-1 block truncate">
              {activeRental.returnLocation}
            </span>
            <span className="text-xs text-soft">
              Due: {new Date(activeRental.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* DIGITAL HANDOVER VERIFICATION RECORD                               */}
        {/* ------------------------------------------------------------------ */}
        {activeHandover && (
          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <div>
                <h4 className="font-bold text-app text-sm">Digital Handover Signoff Record</h4>
                <p className="text-xs text-soft">Inspection completed prior to vehicle release</p>
              </div>
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-500">
                Handover Certified ✓
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div>
                <span className="text-soft font-semibold block">Dispatched by Staff:</span>
                <span className="font-bold text-app text-sm">{activeHandover.staffName}</span>
              </div>
              <div>
                <span className="text-soft font-semibold block">Handover Timestamp:</span>
                <span className="font-bold text-app">{new Date(activeHandover.handoverAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-soft font-semibold block">Customer Digital Signature:</span>
                <span className="font-bold text-orange font-mono">{activeHandover.signature}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-soft/50 p-4 border border-app text-xs space-y-2">
              <span className="font-bold text-app block">Included Verified Accessories & Equipment:</span>
              <div className="flex flex-wrap gap-2">
                {activeHandover.accessories.map((acc, i) => (
                  <span key={i} className="rounded-lg border border-app bg-elev px-2.5 py-1 text-app font-medium">
                    ✓ {acc}
                  </span>
                ))}
              </div>
            </div>

            {activeHandover.damagePoints.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-app block mb-1">Pre-Existing Condition Notes (Customer Protected):</span>
                <div className="space-y-1 text-soft">
                  {activeHandover.damagePoints.map((dp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>
                        <strong className="text-app">{dp.area}:</strong> {dp.description} ({dp.severity})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Request Extension Modal */}
      <Modal
        isOpen={extensionModalOpen}
        onClose={() => setExtensionModalOpen(false)}
        title="Extend Rental Duration"
        subtitle={`Vehicle: ${activeVehicle.make} ${activeVehicle.model}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-app">Additional Days</label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 5, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setExtraDays(days)}
                  className={`rounded-xl px-4 py-2 font-bold border transition ${
                    extraDays === days
                      ? "border-orange bg-orange text-white shadow"
                      : "border-app bg-soft text-soft hover:text-app"
                  }`}
                >
                  +{days} Day{days > 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-app bg-soft p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-soft">Daily Rate:</span>
              <span className="font-bold text-app">₹{Number(activeVehicle.dailyRate).toLocaleString()} / day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-soft">Extra Duration:</span>
              <span className="font-bold text-app">{extraDays} Days</span>
            </div>
            <div className="flex justify-between border-t border-app pt-2 font-black text-sm text-app">
              <span>Estimated Extension Charge:</span>
              <span className="text-orange">
                ₹{(Number(activeVehicle.dailyRate) * extraDays).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setExtensionModalOpen(false)}
              className="btn-ghost px-4 py-2 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestExtension}
              className="btn-primary px-5 py-2 font-bold text-xs"
            >
              Confirm Extension
            </button>
          </div>
        </div>
      </Modal>
    </PortalShell>
  );
}
