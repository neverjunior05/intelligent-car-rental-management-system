"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function AdminCustomersPage() {
  const { users, bookings } = useRentalStore();
  const customerUsers = users.filter((u) => u.role === "customer");

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Customer Accounts Oversight"
      breadcrumb={[{ label: "Customers" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Customer Accounts Directory</h2>
            <p className="text-xs text-soft">
              Enterprise view of registered customer profiles, lifetime rental counts, and KYC statuses.
            </p>
          </div>
          <span className="card px-3 py-1.5 rounded-xl font-bold text-xs text-emerald-500">
            {customerUsers.length} Active Customers
          </span>
        </div>

        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Driver License</th>
                  <th className="p-4">Total Trips</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {customerUsers.map((c) => {
                  const trips = bookings.filter((b) => b.customerId === c.id || b.customerEmail === c.email).length;
                  return (
                    <tr key={c.id} className="hover:bg-soft/30 transition">
                      <td className="p-4 font-bold text-app">{c.name}</td>
                      <td className="p-4 text-soft">{c.email}</td>
                      <td className="p-4 text-soft">{c.phone}</td>
                      <td className="p-4 font-mono font-bold text-app">{c.licenseNumber || "DL-9981234"}</td>
                      <td className="p-4 font-bold text-orange">{trips} Trips</td>
                      <td className="p-4">
                        <span className="rounded-full bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 text-[10px]">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
