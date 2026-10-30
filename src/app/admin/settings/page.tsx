"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useToast } from "@/components/portal/Toast";

export default function AdminSettingsPage() {
  const { success } = useToast();

  const [companyName, setCompanyName] = useState("Veloce Enterprise Mobility LLC");
  const [supportEmail, setSupportEmail] = useState("concierge@carrent.com");
  const [gstin, setGstin] = useState("27AABCV1234F1Z9");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    success("System Settings Saved", "Enterprise parameters saved to secure storage.");
  }

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Enterprise System Settings"
      breadcrumb={[{ label: "Settings" }]}
    >
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
        <div className="card rounded-3xl p-6 sm:p-8 border border-app">
          <h2 className="text-xl font-bold text-app mb-1">Company & Platform Configuration</h2>
          <p className="text-xs text-soft mb-6">Commercial SaaS fleet-management settings.</p>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-app">Operating Entity Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input w-full px-3 py-2 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-bold text-app">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="input w-full px-3 py-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-app">Tax GSTIN / VAT Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="input w-full px-3 py-2 text-xs font-mono font-medium"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-app bg-soft/40 p-4 space-y-2 text-soft">
              <span className="font-bold text-app block">Platform Feature Toggles:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-orange" />
                <span>Enable Real-time WebSocket Satellite GPS Telemetry</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-orange" />
                <span>Enforce Mandatory KYC Driver License Verification Before Key Release</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-orange" />
                <span>Automatic Return Fuel Deficit & Excess Mileage Penalty Calculation</span>
              </label>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-xs font-bold shadow-md">
              Update Enterprise Settings
            </button>
          </form>
        </div>
      </div>
    </PortalShell>
  );
}
