"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function AdminActivityPage() {
  const { activityLogs } = useRentalStore();
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = activityLogs.filter((act) => {
    const matchesRole = roleFilter === "all" || act.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      act.action.toLowerCase().includes(q) ||
      act.user.toLowerCase().includes(q) ||
      act.details.toLowerCase().includes(q) ||
      String(act.entityId).toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="System Security & Activity Audit Log"
      breadcrumb={[{ label: "Activity Log" }]}
    >
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Compliance Audit Trail & Event Ledger</h2>
            <p className="text-xs text-soft">
              Immutable chronological record of every system event, booking transition, handover signoff, and administrative update.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-500 self-start sm:self-auto">
            Audit Stream Active
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search audit trail by user, action, entity ID, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full py-2 pl-9 pr-3 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(["all", "staff", "customer", "maintenance", "admin", "system"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition shrink-0 cursor-pointer ${
                  roleFilter === r ? "bg-orange text-white shadow-sm" : "bg-soft text-soft hover:text-app"
                }`}
              >
                {r} ({r === "all" ? activityLogs.length : activityLogs.filter((a) => a.role === r).length})
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor / Role</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Ref</th>
                  <th className="p-4">Event Details</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filtered.map((act) => (
                  <tr key={act.id} className="hover:bg-soft/30 transition">
                    <td className="p-4 text-soft font-mono whitespace-nowrap">{act.timestamp}</td>
                    <td className="p-4">
                      <div className="font-bold text-app">{act.user}</div>
                      <span className="text-[10px] text-soft uppercase font-bold">{act.role}</span>
                    </td>
                    <td className="p-4 font-bold text-app">{act.action}</td>
                    <td className="p-4 font-mono text-orange font-bold">
                      {act.affectedEntity.toUpperCase()}: {act.entityId}
                    </td>
                    <td className="p-4 text-soft leading-relaxed max-w-md">{act.details}</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          act.status === "success"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : act.status === "danger"
                              ? "bg-red-500/15 text-red-500"
                              : act.status === "warning"
                                ? "bg-amber-500/15 text-amber-500"
                                : "bg-blue-500/15 text-blue-500"
                        }`}
                      >
                        {act.status}
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
