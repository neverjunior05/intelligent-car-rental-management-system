"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import Drawer from "@/components/portal/Drawer";

import { useAuth } from "@/components/AuthProvider";

export default function CustomerPaymentsPage() {
  const { user } = useAuth();
  const { bookings } = useRentalStore();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const currentUserId = user?.id || user?.userId;
  const currentUserEmail = user?.email?.toLowerCase();

  const myBookings = bookings.filter((b) =>
    (currentUserId && b.customerId === currentUserId) ||
    (currentUserEmail && b.customerEmail?.toLowerCase() === currentUserEmail)
  );
  const totalPaid = myBookings.reduce((sum, b) => sum + (b.paymentStatus === "paid" ? b.totalCost : 0), 0);
  const totalDeposits = myBookings.filter((b) => b.status === "active").reduce((sum, b) => sum + (b.depositAmount || 0), 0);

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="Payments & Invoices"
      breadcrumb={[{ label: "Payments" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Billing & Payment Invoices</h2>
            <p className="text-xs text-soft">
              Transparent digital receipts, security deposit hold status, and downloadable invoices.
            </p>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Lifetime Spent</span>
            <span className="text-2xl font-black text-app mt-2 block">₹{totalPaid.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">All accounts cleared</span>
          </div>

          <div className="card rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Active Deposit Hold</span>
            <span className="text-2xl font-black text-orange mt-2 block">₹{totalDeposits.toLocaleString()}</span>
            <span className="text-[11px] text-soft mt-1 block">Released 24h after vehicle return</span>
          </div>

          <div className="card rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-soft block">Outstanding Balance</span>
            <span className="text-2xl font-black text-emerald-500 mt-2 block">₹0.00</span>
            <span className="text-[11px] text-soft mt-1 block">Zero overdue charges</span>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="card rounded-3xl border border-app overflow-hidden">
          <div className="p-5 border-b border-app">
            <h3 className="font-bold text-app text-sm">Trip Invoices & Payment Ledger</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/50 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Car Model</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {myBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-soft/30 transition">
                    <td className="p-4 font-mono font-bold text-orange">INV-{b.id}</td>
                    <td className="p-4 font-bold text-app">{b.vehicleName}</td>
                    <td className="p-4 text-soft">
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 capitalize font-medium text-app">{b.paymentMethod}</td>
                    <td className="p-4 font-bold text-app">₹{b.totalCost.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-500 capitalize">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="btn-ghost px-3 py-1 text-xs font-semibold"
                      >
                        View & Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Drawer */}
      <Drawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Tax Invoice"
        subtitle={`Invoice #INV-${selectedBooking?.id}`}
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-app bg-soft p-4 space-y-1.5">
              <div className="flex justify-between font-bold text-sm text-app">
                <span>Veloce Car Rental Co.</span>
                <span className="text-emerald-500 font-bold">PAID ✓</span>
              </div>
              <p className="text-soft">GSTIN: 27AABCV1234F1Z9</p>
              <p className="text-soft">Customer: {selectedBooking.customerName}</p>
            </div>

            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <div className="flex justify-between py-1 border-b border-app">
                <span>Vehicle:</span>
                <span className="font-bold text-app">{selectedBooking.vehicleName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Base Rental:</span>
                <span className="font-bold text-app">₹{selectedBooking.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Security Deposit (Refundable):</span>
                <span className="font-bold text-app">₹{selectedBooking.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>GST (18% Included):</span>
                <span className="font-bold text-app">₹{(selectedBooking.baseCost * 0.18).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-app border-t border-app">
                <span>Total Paid:</span>
                <span className="text-orange">₹{selectedBooking.totalCost.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="btn-primary w-full py-2.5 text-xs font-bold"
            >
              🖨️ Print / Download PDF
            </button>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
