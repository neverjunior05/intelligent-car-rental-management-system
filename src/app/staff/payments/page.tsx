"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function StaffPaymentsPage() {
  const { bookings } = useRentalStore();
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === "paid" ? b.totalCost : 0), 0);

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Payments & Cash Receipts"
      breadcrumb={[{ label: "Payments" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Rental Payments & Deposit Escrow</h2>
            <p className="text-xs text-soft">
              Real-time payment records, digital payment reconciliation, and security deposit holds.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Shift Receipts</span>
            <span className="text-2xl font-black text-emerald-500 mt-2 block">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] text-soft mt-1 block">100% digital reconciliation</span>
          </div>

          <div className="card rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Security Deposits Held</span>
            <span className="text-2xl font-black text-orange mt-2 block">₹14,000</span>
            <span className="text-[11px] text-soft mt-1 block">Escrow hold on active drives</span>
          </div>

          <div className="card rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Pending Invoices</span>
            <span className="text-2xl font-black text-app mt-2 block">0</span>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">All bookings settled</span>
          </div>
        </div>

        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="p-5 border-b border-app">
            <h4 className="font-bold text-app text-sm">Payment Transaction Ledger</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Txn Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-soft/30 transition">
                    <td className="p-4 font-mono font-bold text-orange">TXN-{b.id}8291</td>
                    <td className="p-4 font-bold text-app">{b.customerName}</td>
                    <td className="p-4 text-soft">{b.vehicleName}</td>
                    <td className="p-4 capitalize font-medium text-app">{b.paymentMethod}</td>
                    <td className="p-4 font-bold text-app">₹{b.totalCost.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 capitalize">
                        {b.paymentStatus}
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
