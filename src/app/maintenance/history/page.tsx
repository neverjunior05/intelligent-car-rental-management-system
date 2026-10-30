"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function MaintenanceHistoryPage() {
  const { maintenanceJobs } = useRentalStore();

  return (
    <PortalShell
      activeRole="maintenance"
      pageTitle="Vehicle Historical Service Records"
      breadcrumb={[{ label: "Vehicle History" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Service & Maintenance History</h2>
            <p className="text-xs text-soft">
              Audit trail of previous repairs, diagnostic records, parts replacements, and technician signoffs.
            </p>
          </div>
        </div>

        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Job Code</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Service Description</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Target Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {maintenanceJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-soft/30 transition">
                    <td className="p-4 font-mono font-bold text-orange">#{job.jobCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-app">{job.vehicleName}</div>
                      <div className="text-[10px] text-soft font-mono">{job.vehicleReg}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-app">{job.title}</div>
                      <div className="text-[10px] text-soft line-clamp-1">{job.problemDescription}</div>
                    </td>
                    <td className="p-4 text-app font-medium">{job.assignedTechnician}</td>
                    <td className="p-4 font-bold text-app">₹{(job.actualCost || job.estimatedCost).toLocaleString()}</td>
                    <td className="p-4 text-soft">{job.serviceDueDate}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize ${
                          job.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : job.status === "in_progress"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                        }`}
                      >
                        {job.status.replace("_", " ")}
                      </span>
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
