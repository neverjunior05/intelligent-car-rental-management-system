"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useAuth } from "@/components/AuthProvider";

export default function StaffProfilePage() {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Staff Profile & Shift Details"
      breadcrumb={[{ label: "Profile" }]}
    >
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
        <div className="card rounded-3xl p-6 sm:p-8 border border-app">
          <div className="flex items-center gap-4 pb-6 border-b border-app">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 font-black text-blue-500 text-2xl">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-app">{user?.name || "Rachel Green"}</h2>
              <p className="text-xs text-soft">{user?.email || "staff@carrent.com"} · Rental Operations Officer</p>
              <span className="rounded-full bg-blue-500/15 text-blue-500 text-[10px] font-bold px-2 py-0.5 mt-1 inline-block">
                Assigned Hub: Downtown Central Depot
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-xs">
            <div className="rounded-2xl border border-app bg-soft/40 p-4 space-y-2 text-soft">
              <span className="font-bold text-app block">Role Permissions:</span>
              <p>✓ Authorized for Digital Vehicle Handover & Digital Key Dispatch</p>
              <p>✓ Authorized for Return Inspection & Condition Audits</p>
              <p>✓ Authorized for Driver License KYC Verification</p>
              <p>✓ Authorized for Fleet Inventory Management</p>
              <p className="text-amber-500">✕ System Configuration & User Role Assignment (Reserved for Admin)</p>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
