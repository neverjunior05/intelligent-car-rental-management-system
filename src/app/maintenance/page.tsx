"use client";

import Link from "next/link";
import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/portal/Modal";
import Drawer from "@/components/portal/Drawer";
import { useToast } from "@/components/portal/Toast";

import { useAuth } from "@/components/AuthProvider";

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const { fleet, maintenanceJobs, actions } = useRentalStore();
  const { success } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const technicianName = user?.name || "Mike Mechanic";

  // New work order form state
  const [form, setForm] = useState({
    vehicleId: 5,
    title: "",
    problemDescription: "",
    priority: "medium" as const,
    assignedTechnician: technicianName,
    serviceDueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    estimatedCost: 3500,
    parts: "",
  });

  const vehiclesInService = fleet.filter((v) => v.status === "maintenance");
  const inProgressJobs = maintenanceJobs.filter((j) => j.status === "in_progress");
  const pendingJobs = maintenanceJobs.filter((j) => j.status === "pending");
  const completedJobs = maintenanceJobs.filter((j) => j.status === "completed");

  const totalCostMonth = maintenanceJobs.reduce((sum, j) => sum + (j.actualCost || j.estimatedCost || 0), 0);

  function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    const vehicle = fleet.find((v) => v.id === Number(form.vehicleId));
    if (!vehicle) return;

    actions.createMaintenanceJob({
      vehicleId: vehicle.id,
      vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.year})`,
      vehicleReg: vehicle.registrationNumber,
      vehicleCategory: vehicle.category,
      title: form.title,
      problemDescription: form.problemDescription,
      priority: form.priority,
      status: "pending",
      assignedTechnician: form.assignedTechnician,
      serviceDueDate: form.serviceDueDate,
      estimatedCost: Number(form.estimatedCost),
      actualCost: 0,
      partsUsed: form.parts ? form.parts.split(",").map((s) => s.trim()) : [],
      notes: "Initiated by Fleet Workshop technician.",
      serviceChecklist: [
        { task: "Initial diagnostic scan", done: false },
        { task: "Perform component repairs", done: false },
        { task: "Quality assurance test drive", done: false },
      ],
    });

    setCreateModalOpen(false);
    success(
      "Work Order Created!",
      `Job created for ${vehicle.make} ${vehicle.model}. Vehicle status set to MAINTENANCE and blocked from customer bookings.`
    );
  }

  function handleStatusChange(jobId: number, nextStatus: any) {
    actions.updateMaintenanceJobStatus(jobId, nextStatus);
    if (nextStatus === "completed") {
      success(
        "Maintenance Completed!",
        "Vehicle returned to AVAILABLE status and is now visible for customer bookings."
      );
    } else {
      success("Status Updated", `Work order status changed to ${nextStatus.toUpperCase()}`);
    }
    if (selectedJob?.id === jobId) {
      setSelectedJob({ ...selectedJob, status: nextStatus });
    }
  }

  return (
    <PortalShell
      activeRole="maintenance"
      pageTitle="Fleet Maintenance & Workshop Control"
      breadcrumb={[{ label: "Maintenance Dashboard" }]}
    >
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-app bg-gradient-to-r from-elev via-soft/40 to-elev p-6 sm:p-8 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Workshop Bay 1 & 2 Active · {technicianName}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-app">
              Diagnostics & Fleet Servicing
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-soft">
              Manage work orders, record parts replacement costs, and certify vehicles back to available status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary px-5 py-2.5 text-xs font-bold shadow-md"
            >
              + Create Work Order
            </button>
            <Link href="/maintenance/queue" className="btn-ghost px-4 py-2.5 text-xs font-semibold">
              Service Queue ({vehiclesInService.length})
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* WORKSHOP KPI METRICS                                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card rounded-2xl p-5 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">Vehicles in Service</span>
              <span className="text-xl">🚗</span>
            </div>
            <p className="mt-3 text-2xl font-black text-red-500">{vehiclesInService.length}</p>
            <p className="text-xs text-soft mt-1">Unavailable for customer rent</p>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">Active Work Orders</span>
              <span className="text-xl">🔧</span>
            </div>
            <p className="mt-3 text-2xl font-black text-amber-500">{inProgressJobs.length}</p>
            <p className="text-xs text-soft mt-1">Currently in mechanic bay</p>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">Pending Assessment</span>
              <span className="text-xl">⏳</span>
            </div>
            <p className="mt-3 text-2xl font-black text-blue-500">{pendingJobs.length}</p>
            <p className="text-xs text-soft mt-1">Awaiting parts or inspection</p>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-emerald-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-soft">Total Repairs Spend</span>
              <span className="text-xl">💰</span>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-500">₹{totalCostMonth.toLocaleString()}</p>
            <p className="text-xs text-soft mt-1">{completedJobs.length} completed this cycle</p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TWO COLUMNS: Active Work Orders Pipeline vs Service Queue          */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Work Orders List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-app tracking-tight">Active Maintenance Work Orders</h3>
                <p className="text-xs text-soft">Completing a work order immediately restores the car to Available.</p>
              </div>
              <Link href="/maintenance/jobs" className="text-xs font-bold text-orange hover:underline">
                View All Work Orders →
              </Link>
            </div>

            <div className="space-y-3">
              {maintenanceJobs.map((job) => (
                <div key={job.id} className="card rounded-3xl p-5 border border-app hover:border-orange/60 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-app">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-orange">#{job.jobCode}</span>
                      <h4 className="font-black text-app text-sm">{job.vehicleName}</h4>
                      <span className="text-xs font-mono text-soft">({job.vehicleReg})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          job.priority === "critical"
                            ? "bg-red-500/15 text-red-500 border border-red-500/30"
                            : job.priority === "high"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                        }`}
                      >
                        {job.priority} Priority
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <p className="font-bold text-app">{job.title}</p>
                    <p className="text-soft leading-relaxed">{job.problemDescription}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-soft">
                      <div>
                        <span>Assigned:</span> <strong className="text-app">{job.assignedTechnician}</strong>
                      </div>
                      <div>
                        <span>Cost:</span>{" "}
                        <strong className="text-app">₹{(job.actualCost || job.estimatedCost).toLocaleString()}</strong>
                      </div>
                      <div>
                        <span>Due:</span> <strong className="text-app">{job.serviceDueDate}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Pipeline Buttons */}
                  <div className="mt-4 pt-3 border-t border-app flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="btn-ghost px-3 py-1 text-xs font-semibold"
                    >
                      Inspect Checklist & Parts
                    </button>

                    <div className="flex items-center gap-2">
                      {job.status === "pending" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "in_progress")}
                          className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 text-xs"
                        >
                          Start Repair Bay
                        </button>
                      )}
                      {job.status === "in_progress" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "completed")}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1 text-xs shadow"
                        >
                          ✓ Mark Completed (Return to Fleet)
                        </button>
                      )}
                      {job.status === "completed" && (
                        <span className="text-[11px] font-bold text-emerald-500">
                          ✓ Service Certified & Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Vehicles Currently in Maintenance Queue */}
          <div className="space-y-6">
            <div className="card rounded-3xl p-6 border border-app space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-app">
                <div>
                  <h3 className="font-bold text-app text-sm">Vehicles in Service Queue</h3>
                  <p className="text-[11px] text-soft">Blocked from customer search</p>
                </div>
                <span className="rounded-full bg-red-500/15 text-red-500 px-2 py-0.5 text-xs font-bold">
                  {vehiclesInService.length}
                </span>
              </div>

              {vehiclesInService.length === 0 ? (
                <p className="text-center text-xs text-soft py-4">No vehicles currently in maintenance.</p>
              ) : (
                <div className="space-y-3">
                  {vehiclesInService.map((v) => (
                    <div key={v.id} className="rounded-2xl border border-app bg-soft/40 p-3.5 text-xs space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-14 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                          {v.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.imageUrl} alt={v.model} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-app block">{v.make} {v.model}</span>
                          <span className="font-mono text-[10px] text-soft">Reg: {v.registrationNumber}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-soft">Mileage: {v.mileage.toLocaleString()} km</span>
                        <button
                          onClick={() => {
                            setForm({ ...form, vehicleId: v.id, title: `Service for ${v.make} ${v.model}` });
                            setCreateModalOpen(true);
                          }}
                          className="font-bold text-orange hover:underline cursor-pointer"
                        >
                          + Log Work Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Protocols Card */}
            <div className="card rounded-3xl p-6 border border-app space-y-3 text-xs">
              <h4 className="font-bold text-app text-sm">Standard Workshop Protocols</h4>
              <p className="text-soft text-[11px] leading-relaxed">
                1. Always log OEM parts replacement serial numbers.
              </p>
              <p className="text-soft text-[11px] leading-relaxed">
                2. Mandatory brake pad and tire tread depth (&gt;3.5mm) verification.
              </p>
              <p className="text-soft text-[11px] leading-relaxed">
                3. Quality assurance signoff automatically marks vehicle AVAILABLE for customer booking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Work Order Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Maintenance Work Order"
        subtitle="Route vehicle to repair bay and update availability state"
      >
        <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-app">Select Vehicle</label>
            <select
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: Number(e.target.value) })}
              className="input w-full px-3 py-2 text-xs cursor-pointer font-bold"
            >
              {fleet.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registrationNumber}) · {v.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block font-bold text-app">Work Order Title</label>
            <input
              type="text"
              placeholder="e.g. Front suspension bushing & routine oil service"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="input w-full px-3 py-2 text-xs font-semibold"
            />
          </div>

          <div>
            <label className="mb-1 block font-bold text-app">Problem Description & Diagnosis</label>
            <textarea
              rows={3}
              placeholder="Detail symptoms, diagnostic codes, or post-rental damage notes..."
              value={form.problemDescription}
              onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
              required
              className="input w-full px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                className="input w-full px-2.5 py-2 text-xs cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical (Safety Stop)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Assigned Technician</label>
              <input
                type="text"
                value={form.assignedTechnician}
                onChange={(e) => setForm({ ...form, assignedTechnician: e.target.value })}
                className="input w-full px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">Estimated Cost (₹)</label>
              <input
                type="number"
                value={form.estimatedCost}
                onChange={(e) => setForm({ ...form, estimatedCost: Number(e.target.value) })}
                className="input w-full px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Target Due Date</label>
              <input
                type="date"
                value={form.serviceDueDate}
                onChange={(e) => setForm({ ...form, serviceDueDate: e.target.value })}
                className="input w-full px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-bold text-app">Parts & Materials Required (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Brake pads, 5W-30 Synthetic Oil, Cabin Filter"
              value={form.parts}
              onChange={(e) => setForm({ ...form, parts: e.target.value })}
              className="input w-full px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-app">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-ghost px-4 py-2 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 font-bold text-xs shadow-md"
            >
              Issue Work Order
            </button>
          </div>
        </form>
      </Modal>

      {/* Work Order Inspection Drawer */}
      <Drawer
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title="Work Order Service Sheet"
        subtitle={`Job #${selectedJob?.jobCode}`}
      >
        {selectedJob && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-app bg-soft p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-app text-sm">{selectedJob.vehicleName}</span>
                <StatusBadge status={selectedJob.status} />
              </div>
              <p className="text-soft font-mono">Reg: {selectedJob.vehicleReg} · Category: {selectedJob.vehicleCategory}</p>
              <p className="font-bold text-orange">{selectedJob.title}</p>
            </div>

            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <span className="font-bold text-app block border-b border-app pb-1">Technician Checklist:</span>
              {selectedJob.serviceChecklist.map((task: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                  <span className={task.done ? "text-emerald-500 font-bold" : "text-soft"}>
                    {task.done ? "✓" : "○"}
                  </span>
                  <span className={task.done ? "line-through opacity-70 text-app" : "text-app"}>
                    {task.task}
                  </span>
                </div>
              ))}
            </div>

            {selectedJob.partsUsed && selectedJob.partsUsed.length > 0 && (
              <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
                <span className="font-bold text-app block border-b border-app pb-1">Replaced Parts:</span>
                {selectedJob.partsUsed.map((p: string, i: number) => (
                  <p key={i} className="text-app">• {p}</p>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {selectedJob.status === "in_progress" && (
                <button
                  onClick={() => handleStatusChange(selectedJob.id, "completed")}
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  ✓ Complete Work Order & Release to Fleet
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
