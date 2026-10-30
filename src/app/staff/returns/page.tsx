"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import VehicleDamageDiagram from "@/components/portal/VehicleDamageDiagram";
import { DamagePoint } from "@/lib/rentalStore";
import { useToast } from "@/components/portal/Toast";

export default function StaffReturnsPage() {
  return (
    <Suspense fallback={<p className="p-8 text-soft">Loading Return Inspection Console…</p>}>
      <StaffReturnsContent />
    </Suspense>
  );
}

import { useAuth } from "@/components/AuthProvider";

function StaffReturnsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { bookings, handovers, fleet, actions, pricing } = useRentalStore();
  const { success, warning, error } = useToast();

  const staffName = user?.name || "Rachel Green";

  const paramBookingId = searchParams.get("bookingId");
  // Select active rental by default or candidate
  const activeBookings = bookings.filter((b) => b.status === "active");
  const fallbackBooking = activeBookings[0] || bookings.find((b) => b.id === 101) || bookings[0];

  const [selectedBookingId, setSelectedBookingId] = useState<number>(
    paramBookingId ? Number(paramBookingId) : fallbackBooking?.id || 101
  );

  const activeBooking = bookings.find((b) => b.id === selectedBookingId) || fallbackBooking;
  const assignedVehicle = activeBooking ? fleet.find((v) => v.id === activeBooking.vehicleId) : null;
  const originalHandover = activeBooking ? handovers.find((h) => h.bookingId === activeBooking.id) : null;

  // Return inspection parameters
  const [returnFuelLevel, setReturnFuelLevel] = useState(90); // 10% deficit for demo calculation
  const [returnOdometer, setReturnOdometer] = useState(15800); // 800 km driven
  const [conditionNotes, setConditionNotes] = useState("Vehicle returned on time. Slight surface scuff on front bumper.");
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState("Front bumper touch-up and brake check");
  const [newDamagePoints, setNewDamagePoints] = useState<DamagePoint[]>([]);

  // Pre-rental metrics from handover
  const preFuel = originalHandover?.fuelLevel ?? 100;
  const preOdo = originalHandover?.odometer ?? 15000;
  const preDamage = originalHandover?.damagePoints ?? [];

  // Automated Charge Calculations
  const fuelDeficit = Math.max(0, preFuel - returnFuelLevel);
  const fuelDeficitCost = fuelDeficit * pricing.fuelPenaltyPerPercent;

  const kmDriven = Math.max(0, returnOdometer - preOdo);
  const rentalDays = activeBooking
    ? Math.max(1, Math.ceil((new Date(activeBooking.endDate).getTime() - new Date(activeBooking.startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 3;
  const allowance = rentalDays * pricing.mileageAllowancePerDay;
  const excessKm = Math.max(0, kmDriven - allowance);
  const extraMileageCost = excessKm * pricing.extraMileagePerKm;

  const damageCost = newDamagePoints.reduce((sum, d) => sum + (d.repairCostEstimate || 0), 0);
  const totalAdditionalCharge = fuelDeficitCost + extraMileageCost + damageCost;

  function handleAddNewDamage(pt: DamagePoint) {
    setNewDamagePoints([...newDamagePoints, pt]);
  }

  function handleRemoveNewDamage(id: string) {
    setNewDamagePoints(newDamagePoints.filter((p) => p.id !== id));
  }

  function handleProcessReturn() {
    if (!activeBooking) return;
    try {
      const willService = sendToMaintenance || newDamagePoints.length > 0;

      actions.performReturn({
        bookingId: activeBooking.id,
        returnFuelLevel,
        returnOdometer,
        condition: conditionNotes,
        newDamagePoints,
        sendToMaintenance: willService,
        maintenanceReason: willService ? maintenanceReason : undefined,
        staffName,
      });

      if (willService) {
        warning(
          "Vehicle Sent to Maintenance",
          `Return recorded. Due to damage/inspection, ${activeBooking.vehicleReg} has been routed to Maintenance Staff and removed from customer search.`
        );
      } else {
        success(
          "Vehicle Return Complete & Available!",
          `Return verified. Extra fees: ₹${totalAdditionalCharge}. Car is now AVAILABLE for new customer bookings!`
        );
      }

      router.push("/staff/bookings");
    } catch (err: any) {
      error("Return Failed", err?.message || "Could not process return.");
    }
  }

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Vehicle Return & Condition Audit"
      breadcrumb={[{ label: "Vehicle Returns" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Post-Rental Check-In & Damage Comparison</h2>
            <p className="text-xs text-soft">
              Compare pre-rental vs post-rental condition, calculate automated fuel/mileage penalties, and release deposit.
            </p>
          </div>
          <span className="rounded-full bg-orange/15 border border-orange/30 px-3 py-1 text-xs font-bold text-orange self-start sm:self-auto">
            Automated Audit Engine
          </span>
        </div>

        {/* Active Rental Selector */}
        <div className="card rounded-2xl p-4 border border-app flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-app uppercase tracking-wider text-[11px]">Select Active Rental:</span>
            <select
              value={activeBooking?.id || ""}
              onChange={(e) => setSelectedBookingId(Number(e.target.value))}
              className="input px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  #{b.bookingCode} · {b.customerName} ({b.vehicleName}) — {b.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {activeBooking && (
            <div className="flex items-center gap-2">
              <span className="text-soft">Assigned Reg:</span>
              <span className="font-bold text-app font-mono">{activeBooking.vehicleReg}</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SIDE-BY-SIDE: PRE-RENTAL vs POST-RENTAL CONDITION COMPARISON       */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 1. Pre-Rental Handover Baseline */}
          <div className="card rounded-3xl p-6 border border-blue-500/30 bg-blue-500/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20">
              <h3 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                1. Pre-Rental Condition (Handover Baseline)
              </h3>
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                Certified Dispatch
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-blue-500/10">
                <span className="text-soft">Baseline Odometer:</span>
                <span className="font-bold text-app">{preOdo.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-500/10">
                <span className="text-soft">Baseline Fuel Level:</span>
                <span className="font-bold text-app">{preFuel}% Full</span>
              </div>
              <div className="flex justify-between py-1 border-b border-blue-500/10">
                <span className="text-soft">Included Mileage Allowance:</span>
                <span className="font-bold text-app">{allowance.toLocaleString()} km ({pricing.mileageAllowancePerDay} km/day)</span>
              </div>
              <div>
                <span className="text-soft font-semibold block mb-1">Pre-existing Documented Scratches:</span>
                {preDamage.length === 0 ? (
                  <p className="text-[11px] text-soft italic">No pre-existing damages recorded.</p>
                ) : (
                  <div className="space-y-1">
                    {preDamage.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-blue-400">
                        <span>•</span>
                        <span>{d.area}: {d.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Post-Rental Return Telemetry & Inspection */}
          <div className="card rounded-3xl p-6 border border-orange/40 bg-orange/5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-orange/20">
              <h3 className="font-bold text-orange text-sm">
                2. Post-Rental Actual Check-in
              </h3>
              <span className="rounded-full bg-orange/20 px-2 py-0.5 text-[10px] font-bold text-orange">
                Live Audit
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="mb-1 flex justify-between font-bold text-app">
                  <span>Return Odometer (km):</span>
                  <span className="text-orange">{kmDriven} km driven</span>
                </label>
                <input
                  type="number"
                  value={returnOdometer}
                  onChange={(e) => setReturnOdometer(Number(e.target.value))}
                  className="input w-full px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="mb-1 flex justify-between font-bold text-app">
                  <span>Return Fuel Level (%):</span>
                  <span className={fuelDeficit > 0 ? "text-red-500" : "text-emerald-500"}>
                    {returnFuelLevel}% ({fuelDeficit > 0 ? `-${fuelDeficit}% deficit` : "Full Tank"})
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={returnFuelLevel}
                  onChange={(e) => setReturnFuelLevel(Number(e.target.value))}
                  className="w-full accent-orange cursor-pointer"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">Staff Return Notes</label>
                <input
                  type="text"
                  value={conditionNotes}
                  onChange={(e) => setConditionNotes(e.target.value)}
                  className="input w-full px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE DAMAGE INSPECTION: RECORD NEW RETURN DAMAGE             */}
        {/* ------------------------------------------------------------------ */}
        <div className="card rounded-3xl p-6 border border-app space-y-4">
          <div className="flex items-center justify-between border-b border-app pb-3">
            <div>
              <h3 className="font-bold text-app text-sm">Post-Rental Vehicle Damage Survey</h3>
              <p className="text-xs text-soft">
                Click car areas to log any NEW damages incurred during the trip. Pre-existing damages are protected in blue.
              </p>
            </div>
            <span className="text-xs font-bold text-red-500">
              New Damage Charges: ₹{damageCost.toLocaleString()}
            </span>
          </div>

          <VehicleDamageDiagram
            existingPoints={preDamage}
            newPoints={newDamagePoints}
            onAddPoint={handleAddNewDamage}
            onRemovePoint={handleRemoveNewDamage}
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* AUTOMATED FINANCIAL CHARGE & ROUTING CALCULATION                   */}
        {/* ------------------------------------------------------------------ */}
        <div className="rounded-3xl border border-app bg-elev p-6 space-y-4 shadow-lg">
          <h3 className="font-bold text-app text-sm border-b border-app pb-3">
            Automated Settlement & Lifecycle Routing
          </h3>

          <div className="grid gap-4 sm:grid-cols-4 text-xs">
            <div className="card rounded-2xl p-4">
              <span className="text-soft font-semibold block">Fuel Deficit Charge:</span>
              <span className="text-lg font-black text-app mt-1 block">₹{fuelDeficitCost.toLocaleString()}</span>
              <span className="text-[10px] text-soft">{fuelDeficit}% @ ₹{pricing.fuelPenaltyPerPercent}/%</span>
            </div>

            <div className="card rounded-2xl p-4">
              <span className="text-soft font-semibold block">Excess Mileage Charge:</span>
              <span className="text-lg font-black text-app mt-1 block">₹{extraMileageCost.toLocaleString()}</span>
              <span className="text-[10px] text-soft">{excessKm} excess km @ ₹{pricing.extraMileagePerKm}/km</span>
            </div>

            <div className="card rounded-2xl p-4">
              <span className="text-soft font-semibold block">Damage Liability Charge:</span>
              <span className="text-lg font-black text-red-500 mt-1 block">₹{damageCost.toLocaleString()}</span>
              <span className="text-[10px] text-soft">{newDamagePoints.length} new incidents</span>
            </div>

            <div className="card rounded-2xl p-4 border border-orange/40 bg-orange/5">
              <span className="text-orange font-bold block uppercase text-[10px]">Total Additional Due:</span>
              <span className="text-2xl font-black text-orange mt-1 block">₹{totalAdditionalCharge.toLocaleString()}</span>
              <span className="text-[10px] text-soft">Deducted from security deposit</span>
            </div>
          </div>

          {/* Vehicle Routing Decision */}
          <div className="rounded-2xl border border-app bg-soft/50 p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-app text-xs block">Post-Return Fleet Routing:</span>
                <span className="text-soft text-[11px]">
                  {sendToMaintenance || newDamagePoints.length > 0
                    ? "Vehicle will be transitioned to MAINTENANCE and automatically removed from customer bookings."
                    : "Vehicle condition is clear. Vehicle will immediately return to AVAILABLE status for new bookings."}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                <input
                  type="checkbox"
                  checked={sendToMaintenance || newDamagePoints.length > 0}
                  onChange={(e) => setSendToMaintenance(e.target.checked)}
                  className="h-4 w-4 accent-orange"
                />
                <span className="text-red-500">Route to Maintenance Workshop</span>
              </label>
            </div>

            {(sendToMaintenance || newDamagePoints.length > 0) && (
              <div>
                <label className="mb-1 block font-bold text-app">Maintenance Service Reason</label>
                <input
                  type="text"
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  className="input w-full px-3 py-1.5 text-xs"
                />
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleProcessReturn}
              className="rounded-2xl bg-gradient-to-r from-orange to-amber-600 hover:opacity-95 text-white font-black px-8 py-3 text-xs tracking-wider uppercase shadow-xl shadow-orange/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              ✓ Complete Return, Generate Invoice & Finalize
            </button>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
