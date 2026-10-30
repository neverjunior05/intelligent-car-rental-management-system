"use client";

import Link from "next/link";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function AdminStaffPage() {
  const { users } = useRentalStore();
  const staffUsers = users.filter((u) => u.role === "staff" || u.role === "maintenance");

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Staff Crews & Technician Roster"
      breadcrumb={[{ label: "Staff & Crews" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Internal Personnel & Hub Crew Roster</h2>
            <p className="text-xs text-soft">
              Front desk rental agents, workshop diagnostic mechanics, and depot fleet supervisors.
            </p>
          </div>
          <Link href="/admin/users" className="btn-primary px-4 py-2 text-xs font-bold self-start sm:self-auto shadow-md">
            + Provision New Crew User
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {staffUsers.map((u) => (
            <div key={u.id} className="card rounded-3xl p-5 border border-app space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-app">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange/15 font-black text-orange text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-app text-sm">{u.name}</h3>
                    <p className="text-[11px] text-soft">{u.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    u.role === "staff"
                      ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                      : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                  }`}
                >
                  {u.role}
                </span>
              </div>

              <div className="text-xs text-soft space-y-1">
                <p><span className="font-semibold text-app">Department:</span> {u.department || "Operations"}</p>
                <p><span className="font-semibold text-app">Phone:</span> {u.phone}</p>
                <p><span className="font-semibold text-app">Status:</span> <span className="text-emerald-500 font-bold uppercase">{u.status}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
