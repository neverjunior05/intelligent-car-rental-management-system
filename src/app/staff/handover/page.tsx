"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import VehicleDamageDiagram from "@/components/portal/VehicleDamageDiagram";
import { DamagePoint } from "@/lib/rentalStore";
import { useToast } from "@/components/portal/Toast";

export default function StaffHandoverPage() {
  return (
    <Suspense fallback={<p className="p-8 text-soft">Loading Handover Console…</p>}>
      <StaffHandoverContent />
    </Suspense>
  );
}

import { useAuth } from "@/components/AuthProvider";

function StaffHandoverContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { bookings, fleet, actions } = useRentalStore();
  const { success, error } = useToast();

  const staffName = user?.name || "Rachel Green";

  const paramBookingId = searchParams.get("bookingId");
  const [selectedBookingId, setSelectedBookingId] = useState<number>(
    paramBookingId ? Number(paramBookingId) : 101
  );

  const [currentStep, setCurrentStep] = useState(1);

  // Handover state fields
  const [fuelLevel, setFuelLevel] = useState(100);
  const [odometer, setOdometer] = useState(15000);
  const [condition, setCondition] = useState("Showroom pristine condition, cleaned and sanitized.");
  const [accessories, setAccessories] = useState<string[]>([
    "Spare Wheel & Alloy",
    "Hydraulic Jack & Wrench",
    "First Aid Medical Kit",
    "FASTag National Toll Pass",
    "Dual-Lens 4K Dashcam",
  ]);
  const [gpsActive, setGpsActive] = useState(true);
  const [signature, setSignature] = useState("Jane Customer");
  const [damagePoints, setDamagePoints] = useState<DamagePoint[]>([
    {
      id: "dmg-pre-1",
      area: "rear_bumper",
      description: "Minor clearcoat scuff near boot latch",
      severity: "minor",
      isPreExisting: true,
      date: "2024-02-15",
      repairCostEstimate: 500,
    },
  ]);

  const candidateBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending" || b.status === "active");
  const activeBooking = bookings.find((b) => b.id === selectedBookingId) || candidateBookings[0];
  const assignedVehicle = activeBooking ? fleet.find((v) => v.id === activeBooking.vehicleId) : null;

  function toggleAccessory(acc: string) {
    if (accessories.includes(acc)) {
      setAccessories(accessories.filter((a) => a !== acc));
    } else {
      setAccessories([...accessories, acc]);
    }
  }

  function handleAddDamagePoint(pt: DamagePoint) {
    setDamagePoints([...damagePoints, pt]);
  }

  function handleRemoveDamagePoint(id: string) {
    setDamagePoints(damagePoints.filter((p) => p.id !== id));
  }

  function handleCompleteHandover() {
    if (!activeBooking) return;
    try {
      actions.performHandover({
        bookingId: activeBooking.id,
        fuelLevel,
        odometer,
        condition,
        accessories,
        signature,
        staffName,
        damagePoints,
      });

      success(
        "Digital Handover Certified!",
        `Keys released for ${activeBooking.vehicleName}. Booking is ACTIVE and vehicle is RENTED.`
      );
      router.push("/staff");
    } catch (err: any) {
      error("Handover Failed", err?.message || "Could not complete handover.");
    }
  }

  const steps = [
    { num: 1, title: "Booking & Customer" },
    { num: 2, title: "Vehicle Condition & Damage" },
    { num: 3, title: "Fuel & Odometer Telemetry" },
    { num: 4, title: "Accessories & Equipment" },
    { num: 5, title: "Digital Signature & Dispatch" },
  ];

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Digital Vehicle Handover Protocol"
      breadcrumb={[{ label: "Handover" }]}
    >
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Pre-Rental Handover Inspection</h2>
            <p className="text-xs text-soft">
              Execute standardized 10-point digital signoff prior to handing over car keys to the renter.
            </p>
          </div>
          <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-500 self-start sm:self-auto">
            Shift Protocol: Rachel Green
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="card rounded-2xl p-4 border border-app">
          <div className="flex items-center justify-between overflow-x-auto gap-2">
            {steps.map((st) => (
              <button
                key={st.num}
                type="button"
                onClick={() => setCurrentStep(st.num)}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 cursor-pointer ${
                  currentStep === st.num
                    ? "bg-orange text-white shadow-md"
                    : currentStep > st.num
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : "bg-soft text-soft hover:text-app"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-[10px]">
                  {currentStep > st.num ? "✓" : st.num}
                </span>
                <span>{st.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Booking Picker */}
        <div className="card rounded-2xl p-4 border border-app flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-app uppercase tracking-wider text-[11px]">Select Booking:</span>
            <select
              value={activeBooking?.id || ""}
              onChange={(e) => setSelectedBookingId(Number(e.target.value))}
              className="input px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              {candidateBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  #{b.bookingCode} · {b.customerName} ({b.vehicleName})
                </option>
              ))}
            </select>
          </div>

          {activeBooking && (
            <div className="flex items-center gap-2">
              <span className="text-soft">KYC Status:</span>
              <span className="font-bold text-emerald-500 uppercase">{activeBooking.driverVerification}</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: Booking & Customer Verification                            */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 1 && activeBooking && (
          <div className="card rounded-3xl p-6 border border-app space-y-5 animate-fade-in">
            <h3 className="font-bold text-app text-sm border-b border-app pb-3">
              Step 1 of 5: Booking Details & Customer Identity Verification
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-app bg-soft/40 p-4 space-y-2">
                <span className="font-bold text-app uppercase tracking-wider text-[11px] block">Renter Profile</span>
                <p><span className="text-soft">Name:</span> <strong className="text-app">{activeBooking.customerName}</strong></p>
                <p><span className="text-soft">Email:</span> <strong className="text-app">{activeBooking.customerEmail}</strong></p>
                <p><span className="text-soft">Phone:</span> <strong className="text-app">{activeBooking.customerPhone}</strong></p>
                <p><span className="text-soft">License #:</span> <strong className="text-app">{activeBooking.driver?.licenseNumber || "DL-9981234"}</strong></p>
                <div className="pt-2">
                  <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                    Physical License Verified by Staff ✓
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-app bg-soft/40 p-4 space-y-2">
                <span className="font-bold text-app uppercase tracking-wider text-[11px] block">Assigned Vehicle</span>
                <p><span className="text-soft">Model:</span> <strong className="text-app">{activeBooking.vehicleName}</strong></p>
                <p><span className="text-soft">Registration:</span> <strong className="text-app">{activeBooking.vehicleReg}</strong></p>
                <p><span className="text-soft">Category:</span> <strong className="text-app">{activeBooking.category}</strong></p>
                <p><span className="text-soft">Rental Period:</span> <strong className="text-app">{new Date(activeBooking.startDate).toLocaleDateString()} to {new Date(activeBooking.endDate).toLocaleDateString()}</strong></p>
                <div className="pt-2">
                  <span className="rounded-lg bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-500">
                    Payment Paid in Full (₹{activeBooking.totalCost.toLocaleString()}) ✓
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-primary px-6 py-2.5 text-xs font-bold"
              >
                Proceed to Vehicle Inspection →
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: Vehicle Condition & Interactive Damage Diagram             */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 2 && (
          <div className="card rounded-3xl p-6 border border-app space-y-5 animate-fade-in">
            <div>
              <h3 className="font-bold text-app text-sm">
                Step 2 of 5: Vehicle Condition & Damage Diagram
              </h3>
              <p className="text-xs text-soft mt-0.5">
                Click any vehicle area to mark pre-existing scratches, scuffs, or dents so the customer is not liable.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-app">General Interior & Exterior Condition Notes</label>
              <textarea
                rows={2}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="input w-full px-3 py-2 text-xs"
              />
            </div>

            {/* Interactive SVG Diagram */}
            <VehicleDamageDiagram
              existingPoints={damagePoints}
              onAddPoint={handleAddDamagePoint}
              onRemovePoint={handleRemoveDamagePoint}
            />

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn-ghost px-5 py-2 text-xs font-bold"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-primary px-6 py-2 text-xs font-bold"
              >
                Proceed to Fuel & Odometer →
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: Fuel Level & Odometer Reading                              */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 3 && (
          <div className="card rounded-3xl p-6 border border-app space-y-5 animate-fade-in">
            <h3 className="font-bold text-app text-sm border-b border-app pb-3">
              Step 3 of 5: Dispatch Fuel & Odometer Telemetry
            </h3>

            <div className="grid gap-6 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-app bg-soft/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-app">Fuel Level Gauge</span>
                  <span className="text-base font-black text-orange">{fuelLevel}% Full</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(Number(e.target.value))}
                  className="w-full accent-orange cursor-pointer"
                />
                <p className="text-[11px] text-soft">
                  Policy: Vehicles must be dispatched 100% full. Customer must return full.
                </p>
              </div>

              <div className="rounded-2xl border border-app bg-soft/40 p-5 space-y-3">
                <span className="font-bold text-app block">Odometer Reading (km)</span>
                <input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(Number(e.target.value))}
                  className="input w-full px-3.5 py-2.5 text-base font-black"
                />
                <p className="text-[11px] text-soft">
                  Odometer verified against vehicle dashboard cluster.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn-ghost px-5 py-2 text-xs font-bold"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-primary px-6 py-2 text-xs font-bold"
              >
                Proceed to Accessories Checklist →
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: Accessories & Equipment Checklist                          */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 4 && (
          <div className="card rounded-3xl p-6 border border-app space-y-5 animate-fade-in">
            <h3 className="font-bold text-app text-sm border-b border-app pb-3">
              Step 4 of 5: Vehicle Accessories & Safety Kit Checklist
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                "Spare Wheel & Alloy",
                "Hydraulic Jack & Wrench",
                "First Aid Medical Kit",
                "FASTag National Toll Pass",
                "Dual-Lens 4K Dashcam",
                "Emergency Warning Triangle",
                "USB-C Multi-device Fast Charger",
              ].map((acc) => {
                const checked = accessories.includes(acc);
                return (
                  <label
                    key={acc}
                    className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition ${
                      checked ? "border-orange/40 bg-orange/5" : "border-app bg-soft/30 opacity-70"
                    }`}
                  >
                    <span className="font-bold text-app">{acc}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAccessory(acc)}
                      className="h-4 w-4 accent-orange cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn-ghost px-5 py-2 text-xs font-bold"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="btn-primary px-6 py-2 text-xs font-bold"
              >
                Proceed to Digital Signature →
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 5: GPS Activation, Signature & Final Handover Dispatch        */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 5 && (
          <div className="card rounded-3xl p-6 border border-app space-y-5 animate-fade-in">
            <h3 className="font-bold text-app text-sm border-b border-app pb-3">
              Step 5 of 5: Digital Signature & Key Release Certification
            </h3>

            <div className="rounded-2xl border border-app bg-soft/40 p-4 flex items-center justify-between">
              <div>
                <span className="font-bold text-app text-xs block">Active Fleet GPS Satellite Telemetry</span>
                <span className="text-[11px] text-soft">Transponder syncs live telemetry to Admin & Customer map</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={gpsActive}
                  onChange={(e) => setGpsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange" />
              </label>
            </div>

            {/* Digital Signature Pad Input */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-app block">Customer Digital Signature Signoff</label>
              <div className="rounded-2xl border border-app bg-elev p-4">
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type customer full legal name for digital signoff"
                  className="w-full bg-transparent font-serif italic text-lg sm:text-xl text-orange border-b border-app pb-1 focus:outline-none"
                />
                <div className="flex justify-between items-center text-[10px] text-soft mt-2">
                  <span>Digitally timestamped with device biometric confirmation</span>
                  <span>ID: #SIG-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>

            {/* Final Dispatch Button */}
            <div className="flex justify-between pt-4 border-t border-app">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn-ghost px-5 py-2 text-xs font-bold"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleCompleteHandover}
                className="rounded-2xl bg-gradient-to-r from-orange via-orange-600 to-amber-600 hover:opacity-95 text-white font-black px-8 py-3 text-xs tracking-wider uppercase shadow-xl shadow-orange/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                🔑 Authorize Key Release & Activate Rental
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
