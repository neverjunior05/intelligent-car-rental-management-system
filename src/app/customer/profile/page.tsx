"use client";

import { useState, useEffect } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useToast } from "@/components/portal/Toast";
import { useAuth } from "@/components/AuthProvider";

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { success } = useToast();
  const [name, setName] = useState(user?.name || "Customer User");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [address, setAddress] = useState("742 Evergreen Terrace, Metropolis");
  const [emergencyContact, setEmergencyContact] = useState("John Customer (+1 555-019-9988)");

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    success("Profile Updated", "Your contact and emergency details were saved successfully.");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "CU";

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="Account Profile"
      breadcrumb={[{ label: "Profile" }]}
    >
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
        <div className="card rounded-3xl p-6 sm:p-8 border border-app">
          <div className="flex items-center gap-4 pb-6 border-b border-app">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/15 font-black text-orange text-2xl">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold text-app">{user?.name || name}</h2>
              <p className="text-xs text-soft">{user?.email || "customer@carrent.com"} · Verified Driver</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-4 text-xs">
            <div>
              <label className="mb-1 block font-bold text-app">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full px-3.5 py-2.5 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block font-bold text-app">Email Address</label>
                <input
                  type="email"
                  value={user?.email || "customer@carrent.com"}
                  disabled
                  className="input w-full px-3.5 py-2.5 text-xs opacity-60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="mb-1 block font-bold text-app">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input w-full px-3.5 py-2.5 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-bold text-app">Residential Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input w-full px-3.5 py-2.5 text-xs font-medium"
              />
            </div>

            <div>
              <label className="mb-1 block font-bold text-app">Emergency Roadside Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="input w-full px-3.5 py-2.5 text-xs font-medium"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-xs font-bold shadow-md mt-2">
              Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    </PortalShell>
  );
}
