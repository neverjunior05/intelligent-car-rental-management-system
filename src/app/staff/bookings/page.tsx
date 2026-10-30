"use client";

import Link from "next/link";
import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import Drawer from "@/components/portal/Drawer";
import { useToast } from "@/components/portal/Toast";

import { useAuth } from "@/components/AuthProvider";

export default function StaffBookingsPage() {
  const { user } = useAuth();
  const { bookings, actions } = useRentalStore();
  const { success, warning } = useToast();

  const staffName = user?.name || "Rachel Green";

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const filtered = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      b.customerName.toLowerCase().includes(q) ||
      b.vehicleName.toLowerCase().includes(q) ||
      b.bookingCode.toLowerCase().includes(q) ||
      b.vehicleReg.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  function handleConfirm(id: number) {
    actions.confirmBooking(id, staffName);
    success("Booking Confirmed", `Booking #${id} confirmed.`);
    if (selectedBooking?.id === id) {
      setSelectedBooking({ ...selectedBooking, status: "confirmed" });
    }
  }

  function handleCancel(id: number) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    const b = bookings.find((x) => x.id === id);
    if (!b) return;

    const all = bookings.map((x) => (x.id === id ? { ...x, status: "cancelled" as const } : x));
    const fleet = actions.getFleet();
    const updatedFleet = fleet.map((v) =>
      v.id === b.vehicleId ? { ...v, status: "available" as const, activeBookingId: undefined } : v
    );
    localStorage.setItem("veloce_bookings_v2", JSON.stringify(all));
    localStorage.setItem("veloce_fleet_v2", JSON.stringify(updatedFleet));
    window.dispatchEvent(new CustomEvent("veloce_store_updated", { detail: { key: "bookings" } }));

    actions.logActivity({
      user: staffName,
      role: "staff",
      action: "Booking Cancelled",
      affectedEntity: "booking",
      entityId: b.bookingCode,
      status: "warning",
      details: `Staff cancelled booking #${b.bookingCode}. Vehicle released to AVAILABLE.`,
    });

    warning("Booking Cancelled", `Booking #${b.bookingCode} marked cancelled.`);
    if (selectedBooking?.id === id) {
      setSelectedBooking({ ...selectedBooking, status: "cancelled" });
    }
  }

  return (
    <PortalShell
      activeRole="staff"
      pageTitle="Bookings Management Queue"
      breadcrumb={[{ label: "Bookings Queue" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Rental Reservations Master</h2>
            <p className="text-xs text-soft">
              Verify customer KYC, confirm reservations, dispatch keys via handover, and process vehicle returns.
            </p>
          </div>
          <Link href="/staff/handover" className="btn-primary px-4 py-2 text-xs font-bold self-start sm:self-auto">
            + New Vehicle Handover
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search by customer, car, booking code, or registration..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full py-2 pl-9 pr-3 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(["all", "pending", "confirmed", "active", "completed", "cancelled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition shrink-0 cursor-pointer ${
                  statusFilter === s ? "bg-orange text-white shadow-sm" : "bg-soft text-soft hover:text-app"
                }`}
              >
                {s} ({s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length})
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Master Data Table */}
        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">KYC Status</th>
                  <th className="p-4">Rental State</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-soft/30 transition">
                    <td className="p-4 font-mono font-bold text-orange">#{b.bookingCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-app">{b.customerName}</div>
                      <div className="text-[10px] text-soft">{b.customerEmail}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-app">{b.vehicleName}</div>
                      <div className="text-[10px] text-soft">Reg: {b.vehicleReg}</div>
                    </td>
                    <td className="p-4 text-soft">
                      <div>{new Date(b.startDate).toLocaleDateString()}</div>
                      <div className="text-[10px]">to {new Date(b.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          b.driverVerification === "verified"
                            ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                            : b.driverVerification === "under_review"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                              : "bg-red-500/15 text-red-500 border border-red-500/30"
                        }`}
                      >
                        {b.driverVerification}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="p-4 font-bold text-app">₹{b.totalCost.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="btn-ghost px-2.5 py-1 text-xs font-semibold"
                        >
                          Manage
                        </button>
                        {b.status === "pending" && (
                          <button
                            onClick={() => handleConfirm(b.id)}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-xs font-bold"
                          >
                            Confirm
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <Link
                            href={`/staff/handover?bookingId=${b.id}`}
                            className="rounded-lg bg-orange hover:bg-orange-600 text-white px-2.5 py-1 text-xs font-bold"
                          >
                            Handover →
                          </Link>
                        )}
                        {b.status === "active" && (
                          <Link
                            href={`/staff/returns?bookingId=${b.id}`}
                            className="rounded-lg border border-orange text-orange px-2.5 py-1 text-xs font-bold hover:bg-orange hover:text-white transition"
                          >
                            Return →
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Operations Drawer */}
      <Drawer
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Manage Rental Reservation"
        subtitle={`Booking Ref: ${selectedBooking?.bookingCode}`}
        width="max-w-lg"
      >
        {selectedBooking && (
          <div className="space-y-5 text-xs">
            {/* Quick Status Pill */}
            <div className="flex items-center justify-between rounded-2xl border border-app bg-soft p-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-soft block">Current Lifecycle Stage</span>
                <span className="text-base font-black text-app uppercase">{selectedBooking.status}</span>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>

            {/* Customer & KYC Particulars */}
            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <span className="font-bold text-app block border-b border-app pb-1">Customer Particulars:</span>
              <div className="flex justify-between">
                <span>Renter:</span>
                <span className="font-bold text-app">{selectedBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-bold text-app">{selectedBooking.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-bold text-app">{selectedBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Driver License KYC:</span>
                <span className="font-bold text-emerald-500 uppercase">{selectedBooking.driverVerification}</span>
              </div>
            </div>

            {/* Vehicle & Rental Period */}
            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <span className="font-bold text-app block border-b border-app pb-1">Vehicle Assignment:</span>
              <div className="flex justify-between">
                <span>Assigned Model:</span>
                <span className="font-bold text-app">{selectedBooking.vehicleName}</span>
              </div>
              <div className="flex justify-between">
                <span>Registration Number:</span>
                <span className="font-bold text-app">{selectedBooking.vehicleReg}</span>
              </div>
              <div className="flex justify-between">
                <span>Pickup Hub:</span>
                <span className="font-bold text-app">{selectedBooking.pickupLocation}</span>
              </div>
              <div className="flex justify-between">
                <span>Rental Dates:</span>
                <span className="font-bold text-app">
                  {new Date(selectedBooking.startDate).toLocaleDateString()} → {new Date(selectedBooking.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Financials */}
            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <span className="font-bold text-app block border-b border-app pb-1">Financial Billing:</span>
              <div className="flex justify-between">
                <span>Base Rate:</span>
                <span className="font-bold text-app">₹{selectedBooking.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit:</span>
                <span className="font-bold text-app">₹{selectedBooking.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-app border-t border-app pt-2">
                <span>Total Amount:</span>
                <span className="text-orange">₹{selectedBooking.totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-2 pt-2">
              {selectedBooking.status === "pending" && (
                <button
                  onClick={() => handleConfirm(selectedBooking.id)}
                  className="btn-primary w-full py-2.5 text-xs font-bold"
                >
                  ✓ Confirm Reservation
                </button>
              )}

              {selectedBooking.status === "confirmed" && (
                <Link
                  href={`/staff/handover?bookingId=${selectedBooking.id}`}
                  className="btn-primary w-full py-2.5 text-xs font-bold text-center block"
                >
                  Start Digital Handover Workflow →
                </Link>
              )}

              {selectedBooking.status === "active" && (
                <Link
                  href={`/staff/returns?bookingId=${selectedBooking.id}`}
                  className="rounded-xl bg-orange hover:bg-orange-600 text-white font-bold w-full py-2.5 text-xs text-center block"
                >
                  Initiate Vehicle Return Check-in →
                </Link>
              )}

              {(selectedBooking.status === "pending" || selectedBooking.status === "confirmed") && (
                <button
                  onClick={() => handleCancel(selectedBooking.id)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-bold w-full py-2.5 text-xs transition"
                >
                  ✕ Cancel Booking
                </button>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
