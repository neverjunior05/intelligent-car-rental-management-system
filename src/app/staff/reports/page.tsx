"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function StaffReportsPage() {
  const { bookings, fleet } = useRentalStore();

  const rentedCars = fleet.filter((v) => v.status === "rented").length;
  const availableCars = fleet.filter((v) => v.status === "available").length;

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Staff Operational Shift Reports"
      breadcrumb={[{ label: "Reports" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Daily Shift Turnaround & Dispatch Log</h2>
            <p className="text-xs text-soft">
              Summary of daily customer handovers, returned vehicle condition audits, and fleet turnover.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-primary px-4 py-2 text-xs font-bold self-start sm:self-auto shadow-md"
          >
            🖨️ Print Shift Log
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card rounded-2xl p-5 border-l-4 border-l-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Cars Dispatched Today</span>
            <span className="text-2xl font-black text-app mt-2 block">{rentedCars} Units</span>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">100% digital KYC signoff</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-emerald-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Ready for Customer Pickup</span>
            <span className="text-2xl font-black text-emerald-500 mt-2 block">{availableCars} Units</span>
            <span className="text-[11px] text-soft mt-1 block">Cleaned & fueled 100%</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-blue-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Total Shift Operations</span>
            <span className="text-2xl font-black text-app mt-2 block">{bookings.length} Actions</span>
            <span className="text-[11px] text-soft mt-1 block">Zero customer wait incidents</span>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
