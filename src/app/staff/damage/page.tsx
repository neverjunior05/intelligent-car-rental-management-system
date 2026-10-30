"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import VehicleDamageDiagram from "@/components/portal/VehicleDamageDiagram";
import { DamagePoint } from "@/lib/rentalStore";

export default function StaffDamagePage() {
  const { fleet, handovers } = useRentalStore();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number>(1);

  // Aggregate damage records from all handovers
  const allDamage: DamagePoint[] = handovers.flatMap((h) => h.damagePoints);

  const selectedVehicle = fleet.find((v) => v.id === selectedVehicleId) || fleet[0];
  const vehicleHandovers = handovers.filter((h) => h.vehicleId === selectedVehicleId);
  const vehicleDamagePoints = vehicleHandovers.flatMap((h) => h.damagePoints);

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Fleet Damage Management"
      breadcrumb={[{ label: "Damage Management" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Damage Logs & Silhouette Inspector</h2>
            <p className="text-xs text-soft">
              Track vehicle condition hotspots, assess bodywork severity, and estimate repair liabilities.
            </p>
          </div>
        </div>

        {/* Vehicle Selector */}
        <div className="card rounded-2xl p-4 border border-app flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-app uppercase tracking-wider text-[11px]">Inspect Vehicle:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
              className="input px-3 py-1.5 text-xs font-bold cursor-pointer"
            >
              {fleet.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registrationNumber}) · {v.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-soft">Current State:</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                selectedVehicle.status === "available"
                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                  : selectedVehicle.status === "rented"
                    ? "bg-orange/15 text-orange border border-orange/30"
                    : "bg-red-500/15 text-red-500 border border-red-500/30"
              }`}
            >
              {selectedVehicle.status}
            </span>
          </div>
        </div>

        {/* Interactive Silhouette Diagram for Selected Car */}
        <div className="card rounded-3xl p-6 border border-app space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-app">
            <div>
              <h3 className="font-bold text-app text-sm">
                Damage Schematic: {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
              </h3>
              <p className="text-xs text-soft">
                Reg: {selectedVehicle.registrationNumber} · Mileage: {selectedVehicle.mileage.toLocaleString()} km
              </p>
            </div>
            <span className="text-xs font-bold text-soft">
              Total Recorded Points: {vehicleDamagePoints.length}
            </span>
          </div>

          <VehicleDamageDiagram
            existingPoints={vehicleDamagePoints}
            readOnly={true}
          />
        </div>

        {/* Global Damage History Table */}
        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="p-5 border-b border-app">
            <h4 className="font-bold text-app text-sm">Fleet-wide Damage Audit Log</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Car Area</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Repair Estimate</th>
                  <th className="p-4">Date Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {allDamage.map((d, i) => (
                  <tr key={i} className="hover:bg-soft/30 transition">
                    <td className="p-4 font-bold text-app capitalize">{d.area.replace("_", " ")}</td>
                    <td className="p-4 text-soft">{d.description}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                          d.severity === "minor"
                            ? "bg-blue-500/15 text-blue-500"
                            : d.severity === "moderate"
                              ? "bg-amber-500/15 text-amber-500"
                              : "bg-red-500/15 text-red-500"
                        }`}
                      >
                        {d.severity}
                      </span>
                    </td>
                    <td className="p-4 text-soft">
                      {d.isPreExisting ? "Pre-existing (Baseline)" : "Customer Liable (Return)"}
                    </td>
                    <td className="p-4 font-bold text-app">₹{d.repairCostEstimate.toLocaleString()}</td>
                    <td className="p-4 text-soft">{d.date}</td>
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
