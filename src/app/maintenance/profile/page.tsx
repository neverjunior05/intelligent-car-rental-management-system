"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useAuth } from "@/components/AuthProvider";

export default function MaintenanceProfilePage() {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "MC";

  return (
    <PortalShell
      activeRole="maintenance"
      pageTitle="Technician Profile & Certifications"
      breadcrumb={[{ label: "Profile" }]}
    >
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
        <div className="card rounded-3xl p-6 sm:p-8 border border-app">
          <div className="flex items-center gap-4 pb-6 border-b border-app">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 font-black text-emerald-500 text-2xl">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-app">{user?.name || "Mike Mechanic"}</h2>
              <p className="text-xs text-soft">{user?.email || "maint@carrent.com"} · Master Fleet Diagnostic Technician</p>
              <span className="rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold px-2 py-0.5 mt-1 inline-block">
                Assigned Bay: Fleet Central Workshop
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            <div className="rounded-2xl border border-app bg-soft/40 p-4 space-y-2 text-soft">
              <span className="font-bold text-app block">Professional Certifications & Permissions:</span>
              <p>✓ ASE Master Automobile Technician Certified</p>
              <p>✓ High-Voltage EV Safety & Lithium-Ion Diagnostics Certified</p>
              <p>✓ Authorized to certify vehicles from MAINTENANCE back to AVAILABLE</p>
              <p>✓ Authorized to log parts requisition orders</p>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
