"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import { useToast } from "@/components/portal/Toast";

export default function AdminPricingPage() {
  const { pricing, actions } = useRentalStore();
  const { success } = useToast();

  const [form, setForm] = useState({
    fuelPenaltyPerPercent: pricing.fuelPenaltyPerPercent,
    extraMileagePerKm: pricing.extraMileagePerKm,
    mileageAllowancePerDay: pricing.mileageAllowancePerDay,
    standardSecurityDeposit: pricing.standardSecurityDeposit,
    luxurySecurityDeposit: pricing.luxurySecurityDeposit,
    baseDailyDiscount7Days: pricing.baseDailyDiscount7Days,
    baseDailyDiscount30Days: pricing.baseDailyDiscount30Days,
    insuranceDailyRate: pricing.insuranceDailyRate,
    gpsDailyRate: pricing.gpsDailyRate,
    childSeatDailyRate: pricing.childSeatDailyRate,
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    actions.updatePricing(form);
    success(
      "Pricing Parameters Updated!",
      "New tariff, fuel penalties, and deposit structures are immediately active in the booking quote calculator."
    );
  }

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Dynamic Pricing & Tariff Engine"
      breadcrumb={[{ label: "Pricing Engine" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Tariff & Fee Configuration</h2>
            <p className="text-xs text-soft">
              Configure daily rates, return penalties, mileage allowances, and refundable security deposit policies.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-500 self-start sm:self-auto">
            Live Pricing Engine Active
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Card 1: Return Deficit & Overage Penalties */}
          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <h3 className="font-bold text-app text-sm border-b border-app pb-2">
              Vehicle Return Penalty Charges & Allowance
            </h3>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-app">Fuel Deficit Penalty (₹ per 1%)</label>
                <input
                  type="number"
                  value={form.fuelPenaltyPerPercent}
                  onChange={(e) => setForm({ ...form, fuelPenaltyPerPercent: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
                <span className="text-[10px] text-soft mt-0.5 block">Applied when returned below handover fuel</span>
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">Daily Mileage Allowance (km/day)</label>
                <input
                  type="number"
                  value={form.mileageAllowancePerDay}
                  onChange={(e) => setForm({ ...form, mileageAllowancePerDay: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
                <span className="text-[10px] text-soft mt-0.5 block">Included distance before excess charges</span>
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">Excess Mileage Fee (₹ per km)</label>
                <input
                  type="number"
                  value={form.extraMileagePerKm}
                  onChange={(e) => setForm({ ...form, extraMileagePerKm: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
                <span className="text-[10px] text-soft mt-0.5 block">Charged per km beyond included allowance</span>
              </div>
            </div>
          </div>

          {/* Card 2: Security Deposit Escrow Holds */}
          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <h3 className="font-bold text-app text-sm border-b border-app pb-2">
              Refundable Security Deposit Requirements
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="mb-1 block font-bold text-app">Standard & SUV Deposit Hold (₹)</label>
                <input
                  type="number"
                  value={form.standardSecurityDeposit}
                  onChange={(e) => setForm({ ...form, standardSecurityDeposit: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
                <span className="text-[10px] text-soft mt-0.5 block">Economy, Sedan & Standard SUVs</span>
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">Luxury & Sports Car Deposit Hold (₹)</label>
                <input
                  type="number"
                  value={form.luxurySecurityDeposit}
                  onChange={(e) => setForm({ ...form, luxurySecurityDeposit: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
                <span className="text-[10px] text-soft mt-0.5 block">Porsche, Lexus, BMW, Mercedes</span>
              </div>
            </div>
          </div>

          {/* Card 3: Optional Add-on Daily Rates */}
          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <h3 className="font-bold text-app text-sm border-b border-app pb-2">
              Optional Add-on Equipment Daily Rates
            </h3>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div>
                <label className="mb-1 block font-bold text-app">Comprehensive Insurance (₹/day)</label>
                <input
                  type="number"
                  value={form.insuranceDailyRate}
                  onChange={(e) => setForm({ ...form, insuranceDailyRate: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">GPS Satellite Nav (₹/day)</label>
                <input
                  type="number"
                  value={form.gpsDailyRate}
                  onChange={(e) => setForm({ ...form, gpsDailyRate: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">Child Safety Seat (₹/day)</label>
                <input
                  type="number"
                  value={form.childSeatDailyRate}
                  onChange={(e) => setForm({ ...form, childSeatDailyRate: Number(e.target.value) })}
                  className="input w-full px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-orange to-amber-600 hover:opacity-95 text-white font-black px-8 py-3 text-xs tracking-wider uppercase shadow-xl shadow-orange/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              Save & Propagate Tariff Rules
            </button>
          </div>
        </form>
      </div>
    </PortalShell>
  );
}
