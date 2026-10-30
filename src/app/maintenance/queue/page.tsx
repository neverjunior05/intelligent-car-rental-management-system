"use client";

import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import EmptyState from "@/components/portal/EmptyState";

export default function MaintenanceQueuePage() {
  const { fleet } = useRentalStore();
  const serviceQueue = fleet.filter((v) => v.status === "maintenance");

  return (
    <PortalShell
      activeRole="maintenance"
      pageTitle="Vehicles Requiring Service"
      breadcrumb={[{ label: "Service Queue" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Service Intake Queue</h2>
            <p className="text-xs text-soft">
              Vehicles removed from customer availability awaiting mechanic diagnosis, parts replacement, or inspection signoff.
            </p>
          </div>
          <span className="rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-500 self-start sm:self-auto">
            {serviceQueue.length} In Workshop Queue
          </span>
        </div>

        {serviceQueue.length === 0 ? (
          <EmptyState
            icon="🛠️"
            title="Service Bay is Clear!"
            description="All fleet vehicles are certified and in service. No vehicles currently flagged for repairs."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {serviceQueue.map((v) => (
              <div key={v.id} className="card rounded-3xl p-5 border border-app space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 rounded-2xl overflow-hidden bg-zinc-800 shrink-0 shadow-inner">
                    {v.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.imageUrl} alt={v.model} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-app text-sm">{v.make} {v.model} ({v.year})</h3>
                    <p className="text-xs font-mono text-soft">Reg: {v.registrationNumber}</p>
                    <span className="rounded-full bg-red-500/15 text-red-500 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold mt-1 inline-block">
                      Status: MAINTENANCE
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-app bg-soft/40 p-3.5 space-y-2 text-xs text-soft">
                  <div className="flex justify-between">
                    <span>Odometer:</span>
                    <strong className="text-app">{v.mileage.toLocaleString()} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuel Tank:</span>
                    <strong className="text-app">{v.fuelLevel}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <strong className="text-app">{v.category}</strong>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Link
                    href={`/maintenance/jobs`}
                    className="btn-primary px-4 py-2 text-xs font-bold"
                  >
                    Open Active Work Order →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
