"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import { useToast } from "@/components/portal/Toast";

export default function MaintenanceJobsPage() {
  const { maintenanceJobs, actions } = useRentalStore();
  const { success } = useToast();

  const [filter, setFilter] = useState("all");

  const filtered = maintenanceJobs.filter((j) => {
    if (filter === "all") return true;
    return j.status === filter;
  });

  function handleComplete(jobId: number) {
    actions.updateMaintenanceJobStatus(jobId, "completed");
    success(
      "Maintenance Certified!",
      "Work order signed off. Vehicle status restored to AVAILABLE and is now visible to customers in car search!"
    );
  }

  function handleStart(jobId: number) {
    actions.updateMaintenanceJobStatus(jobId, "in_progress");
    success("Bay Started", "Work order moved to In Progress.");
  }

  return (
    <PortalShell
      activeRole="maintenance"
      pageTitle="Maintenance Work Orders Pipeline"
      breadcrumb={[{ label: "Work Orders" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Workshop Work Orders & Repair Pipeline</h2>
            <p className="text-xs text-soft">
              Track diagnostic tasks, parts replacement costs, and technician job signoffs.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-app text-xs">
          {(["all", "pending", "in_progress", "completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-xl px-4 py-2 font-bold capitalize transition shrink-0 cursor-pointer ${
                filter === s ? "bg-orange text-white shadow-sm" : "bg-soft text-soft hover:text-app"
              }`}
            >
              {s.replace("_", " ")} ({s === "all" ? maintenanceJobs.length : maintenanceJobs.filter((j) => j.status === s).length})
            </button>
          ))}
        </div>

        {/* Work Orders Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => (
            <div key={job.id} className="card rounded-3xl p-5 sm:p-6 border border-app space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-app">
                <div>
                  <span className="font-mono text-xs font-bold text-orange">#{job.jobCode}</span>
                  <h3 className="font-black text-app text-base">{job.vehicleName}</h3>
                  <span className="text-xs font-mono text-soft">Reg: {job.vehicleReg}</span>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-app">{job.title}</p>
                <p className="text-soft leading-relaxed">{job.problemDescription}</p>

                <div className="rounded-2xl border border-app bg-soft/40 p-3 space-y-1.5 text-soft">
                  <div className="flex justify-between">
                    <span>Assigned Technician:</span>
                    <strong className="text-app">{job.assignedTechnician}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Priority Level:</span>
                    <strong className="text-orange uppercase">{job.priority}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Repair Cost:</span>
                    <strong className="text-app">₹{(job.actualCost || job.estimatedCost).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-app">
                {job.status === "pending" && (
                  <button
                    onClick={() => handleStart(job.id)}
                    className="btn-ghost px-4 py-1.5 text-xs font-bold"
                  >
                    Start Service Bay
                  </button>
                )}
                {job.status === "in_progress" && (
                  <button
                    onClick={() => handleComplete(job.id)}
                    className="btn-primary px-4 py-1.5 text-xs font-bold shadow-md"
                  >
                    ✓ Complete & Release to Fleet
                  </button>
                )}
                {job.status === "completed" && (
                  <span className="text-emerald-500 font-bold text-xs">
                    ✓ Vehicle Certified & In Service
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
