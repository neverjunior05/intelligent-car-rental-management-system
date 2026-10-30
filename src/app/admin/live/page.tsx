"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import FleetMap from "@/components/portal/FleetMap";
import { FleetVehicle } from "@/lib/rentalStore";

export default function AdminLiveOperationsPage() {
  const { fleet, activityLogs } = useRentalStore();
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(fleet[0] || null);

  const rentedCount = fleet.filter((v) => v.status === "rented").length;
  const availableCount = fleet.filter((v) => v.status === "available").length;
  const maintenanceCount = fleet.filter((v) => v.status === "maintenance").length;

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Live Operations & Satellite Fleet Tracking"
      breadcrumb={[{ label: "Live Operations" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                Live WebSocket GPS Feed Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Operations Control Center</h2>
            <p className="text-xs text-soft">
              Real-time vehicle telemetry, moving transponder signals, engine status, and driver assignments.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="card px-3 py-1.5 rounded-xl font-bold">
              <span className="text-orange">{rentedCount}</span> Rented / En Route
            </span>
            <span className="card px-3 py-1.5 rounded-xl font-bold">
              <span className="text-emerald-500">{availableCount}</span> Available Hubs
            </span>
            <span className="card px-3 py-1.5 rounded-xl font-bold">
              <span className="text-red-500">{maintenanceCount}</span> Workshop
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* SATELLITE GPS FLEET MAP (Full Interactive Control)                 */}
        {/* ------------------------------------------------------------------ */}
        <FleetMap
          vehicles={fleet}
          selectedVehicleId={selectedVehicle?.id}
          onSelectVehicle={(v) => setSelectedVehicle(v)}
          height="540px"
        />

        {/* ------------------------------------------------------------------ */}
        {/* LIVE ACTIVITY TICKER & TELEMETRY STREAM                            */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Real-time Event Stream (2 cols) */}
          <div className="card rounded-3xl p-6 border border-app lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-app">
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <h3 className="font-bold text-app text-sm">Real-Time Operational Event Ticker</h3>
              </div>
              <span className="text-xs text-soft font-mono">Synced: Just now</span>
            </div>

            <div className="space-y-3 text-xs">
              {activityLogs.slice(0, 8).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-2xl border border-app bg-soft/30 hover:bg-soft transition"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-2 w-2 rounded-full shrink-0 ${
                        act.status === "success"
                          ? "bg-emerald-500"
                          : act.status === "danger"
                            ? "bg-red-500"
                            : act.status === "warning"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-app">{act.action}</strong>
                        <span className="rounded bg-elev px-1.5 py-0.5 text-[9px] font-bold text-soft uppercase tracking-wider">
                          {act.role}
                        </span>
                      </div>
                      <p className="mt-0.5 text-soft text-[11px] leading-relaxed">{act.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-soft shrink-0 font-mono">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Vehicle Live Inspector (1 col) */}
          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <h3 className="font-bold text-app text-sm pb-3 border-b border-app">Vehicle Telemetry Inspector</h3>

            {selectedVehicle ? (
              <div className="space-y-3.5 text-xs">
                <div className="h-32 rounded-2xl overflow-hidden bg-soft shadow-inner">
                  {selectedVehicle.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedVehicle.imageUrl} alt={selectedVehicle.model} className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div>
                  <h4 className="font-black text-app text-sm">{selectedVehicle.make} {selectedVehicle.model}</h4>
                  <p className="text-soft font-mono text-[11px]">Reg: {selectedVehicle.registrationNumber}</p>
                </div>

                <div className="rounded-2xl border border-app bg-soft/50 p-3 space-y-2 text-soft">
                  <div className="flex justify-between">
                    <span>Live GPS Speed:</span>
                    <strong className="text-emerald-500 font-bold">{selectedVehicle.speed} km/h</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Tank:</span>
                    <strong className="text-app font-bold">{selectedVehicle.fuelLevel}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Odometer:</span>
                    <strong className="text-app font-bold">{selectedVehicle.mileage.toLocaleString()} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Status:</span>
                    <strong className="text-orange uppercase font-bold">{selectedVehicle.status}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Driver:</span>
                    <strong className="text-app">{selectedVehicle.currentDriverName || "No active driver"}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-soft text-center py-8">Click any vehicle marker on the map to inspect.</p>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
