"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import Drawer from "@/components/portal/Drawer";

export default function StaffCustomersPage() {
  const { users, bookings } = useRentalStore();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const customerUsers = users.filter((u) => u.role === "customer");
  const filtered = customerUsers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.licenseNumber && c.licenseNumber.toLowerCase().includes(q));
  });

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Customer Directory & Profiles"
      breadcrumb={[{ label: "Customers" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Customer Accounts & KYC Records</h2>
            <p className="text-xs text-soft">
              Inspect driving licenses, rental histories, total spend, and contact information.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, license #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full py-2 pl-9 pr-3 text-xs"
            />
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Driver License</th>
                  <th className="p-4">KYC Status</th>
                  <th className="p-4">Total Trips</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filtered.map((c) => {
                  const custBookings = bookings.filter((b) => b.customerId === c.id || b.customerEmail === c.email);
                  const isVerified = c.licenseNumber || custBookings.some((b) => b.driverVerification === "verified");

                  return (
                    <tr key={c.id} className="hover:bg-soft/30 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange/15 font-black text-orange text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-app block">{c.name}</span>
                            <span className="text-[10px] text-soft">ID: #{c.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-app">{c.email}</div>
                        <div className="text-[10px] text-soft">{c.phone}</div>
                      </td>
                      <td className="p-4 font-mono font-medium text-app">
                        {c.licenseNumber || "DL-9981234"}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500">
                          {isVerified ? "Verified ✓" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-app">
                        {custBookings.length} Bookings
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 capitalize">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="btn-ghost px-3 py-1 text-xs font-semibold"
                        >
                          Profile & History
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Profile Drawer */}
      <Drawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Profile & Driving Records"
        subtitle={selectedCustomer?.name}
      >
        {selectedCustomer && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-app bg-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/20 font-black text-orange text-lg">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-app text-sm">{selectedCustomer.name}</h4>
                <p className="text-soft">{selectedCustomer.email} · {selectedCustomer.phone}</p>
                <span className="rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold px-2 py-0.5 mt-1 inline-block">
                  Account Active · Verified Driver
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <div className="flex justify-between">
                <span>Driver License:</span>
                <span className="font-bold text-app">{selectedCustomer.licenseNumber || "DL-9981234"}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="font-bold text-app">{selectedCustomer.address || "Metropolis, NY"}</span>
              </div>
              <div className="flex justify-between">
                <span>Member Since:</span>
                <span className="font-bold text-app">{selectedCustomer.createdAt}</span>
              </div>
            </div>

            {/* Trip History Sub-List */}
            <div className="space-y-2">
              <h5 className="font-bold text-app text-xs uppercase tracking-wider">Rental Trip History</h5>
              {bookings
                .filter((b) => b.customerId === selectedCustomer.id || b.customerEmail === selectedCustomer.email)
                .map((b) => (
                  <div key={b.id} className="rounded-xl border border-app bg-soft/40 p-3 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-app block">{b.vehicleName}</span>
                      <span className="text-[10px] text-soft">
                        {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-bold text-orange">₹{b.totalCost.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
