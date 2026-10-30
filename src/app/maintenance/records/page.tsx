"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function MaintenanceRecordsPage() {
  const { maintenanceJobs } = useRentalStore();

  return (
    <PortalShell
      activeRole="maintenance"
      pageTitle="Diagnostics & Safety Checklists"
      breadcrumb={[{ label: "Diagnostics & Records" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Workshop Inspection Checklists & Diagnostics</h2>
            <p className="text-xs text-soft">
              Mandatory multipoint safety inspection records for roadworthiness certification.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {maintenanceJobs.map((job) => (
            <div key={job.id} className="card rounded-3xl p-6 border border-app space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-app">
                <div>
                  <span className="font-mono text-xs font-bold text-orange">#{job.jobCode}</span>
                  <h3 className="font-bold text-app text-sm">{job.vehicleName} ({job.vehicleReg})</h3>
                </div>
                <span className="text-xs font-bold text-soft">Technician: {job.assignedTechnician}</span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold text-app block">Multipoint Inspection Tasks:</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {job.serviceChecklist.map((task, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-xl bg-soft/40 p-2.5 border border-app">
                      <span className={task.done ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                        {task.done ? "✓ Certified" : "⏳ Pending"}
                      </span>
                      <span className="text-app">{task.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
