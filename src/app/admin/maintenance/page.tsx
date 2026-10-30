"use client";

import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";

export default function AdminMaintenanceControlPage() {
  const { fleet, maintenanceJobs } = useRentalStore();

  const vehiclesInService = fleet.filter((v) => v.status === "maintenance");
  const totalCost = maintenanceJobs.reduce((sum, j) => sum + (j.actualCost || j.estimatedCost || 0), 0);

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Enterprise Maintenance Oversight"
      breadcrumb={[{ label: "Maintenance Oversight" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Workshop Control & Repair Liabilities</h2>
            <p className="text-xs text-soft">
              Executive oversight over workshop turnaround times, repair costs, and safety signoffs.
            </p>
          </div>
          <span className="rounded-xl border border-app bg-soft/50 px-3.5 py-1.5 text-xs font-semibold text-soft">
            Admin Oversight Mode
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card rounded-2xl p-5 border-l-4 border-l-red-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Blocked Fleet Units</span>
            <span className="text-2xl font-black text-red-500 mt-2 block">{vehiclesInService.length} Vehicles</span>
            <span className="text-[11px] text-soft mt-1 block">In repair workshop bays</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-amber-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Active Work Orders</span>
            <span className="text-2xl font-black text-amber-500 mt-2 block">{maintenanceJobs.length} Jobs</span>
            <span className="text-[11px] text-soft mt-1 block">Scheduled & in progress</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Total Repairs Spend</span>
            <span className="text-2xl font-black text-orange mt-2 block">₹{totalCost.toLocaleString()}</span>
            <span className="text-[11px] text-soft mt-1 block">Parts & labor reconciliation</span>
          </div>
        </div>

        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="p-5 border-b border-app">
            <h3 className="font-bold text-app text-sm">Work Order Audit Table</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Job Code</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Issue Description</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {maintenanceJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-soft/30 transition">
                    <td className="p-4 font-mono font-bold text-orange">#{j.jobCode}</td>
                    <td className="p-4 font-bold text-app">{j.vehicleName}</td>
                    <td className="p-4 text-soft">{j.title}</td>
                    <td className="p-4 text-app font-medium">{j.assignedTechnician}</td>
                    <td className="p-4 font-bold text-app">₹{(j.actualCost || j.estimatedCost).toLocaleString()}</td>
                    <td className="p-4">
                      <StatusBadge status={j.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
