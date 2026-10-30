"use client";

import Link from "next/link";
import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/portal/EmptyState";
import Drawer from "@/components/portal/Drawer";
import { useToast } from "@/components/portal/Toast";

import { useAuth } from "@/components/AuthProvider";

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const { bookings, actions } = useRentalStore();
  const { success } = useToast();

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "active" | "completed" | "cancelled">("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [invoiceDrawerOpen, setInvoiceDrawerOpen] = useState(false);

  const currentUserId = user?.id || user?.userId;
  const currentUserEmail = user?.email?.toLowerCase();

  // Filter for logged-in customer only
  const myBookings = bookings.filter((b) =>
    (currentUserId && b.customerId === currentUserId) ||
    (currentUserEmail && b.customerEmail?.toLowerCase() === currentUserEmail)
  );

  const filtered = myBookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return b.status === "confirmed" || b.status === "pending";
    if (activeTab === "active") return b.status === "active";
    if (activeTab === "completed") return b.status === "completed";
    if (activeTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  function handleCancelBooking(bookingId: number) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    const b = myBookings.find((x) => x.id === bookingId);
    if (!b) return;

    // Update store state
    const all = bookings.map((x) =>
      x.id === bookingId ? { ...x, status: "cancelled" as const } : x
    );
    // Also release vehicle back to available
    const fleet = actions.getFleet();
    const updatedFleet = fleet.map((v) =>
      v.id === b.vehicleId ? { ...v, status: "available" as const, activeBookingId: undefined } : v
    );

    localStorage.setItem("veloce_bookings_v2", JSON.stringify(all));
    localStorage.setItem("veloce_fleet_v2", JSON.stringify(updatedFleet));
    window.dispatchEvent(new CustomEvent("veloce_store_updated", { detail: { key: "bookings" } }));

    actions.logActivity({
      user: user?.name || "Customer",
      role: "customer",
      action: "Booking Cancelled",
      affectedEntity: "booking",
      entityId: b.bookingCode,
      status: "warning",
      details: `Customer cancelled booking #${b.bookingCode}. Vehicle released to AVAILABLE.`,
    });

    success("Booking Cancelled", `Booking #${b.bookingCode} was cancelled successfully.`);
  }

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="My Rental Bookings"
      breadcrumb={[{ label: "Bookings" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Header with New Booking CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Booking History & Queue</h2>
            <p className="text-xs text-soft">View active drives, upcoming reservations, and historical trip receipts.</p>
          </div>
          <Link href="/customer/fleet" className="btn-primary px-5 py-2.5 text-xs font-bold self-start sm:self-auto">
            + Reserve New Car
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-app">
          {(["all", "upcoming", "active", "completed", "cancelled"] as const).map((tab) => {
            const count = myBookings.filter((b) => {
              if (tab === "all") return true;
              if (tab === "upcoming") return b.status === "confirmed" || b.status === "pending";
              if (tab === "active") return b.status === "active";
              if (tab === "completed") return b.status === "completed";
              if (tab === "cancelled") return b.status === "cancelled";
              return false;
            }).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-2 text-xs font-bold capitalize transition shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? "bg-orange text-white shadow-sm"
                    : "text-soft hover:bg-soft hover:text-app"
                }`}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📅"
            title={`No ${activeTab !== "all" ? activeTab : ""} bookings found`}
            description="You don't have any bookings in this category. Ready to hit the road?"
            actionText="Find Your Ride"
            actionHref="/customer/fleet"
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="card rounded-3xl p-5 sm:p-6 transition hover:border-orange/60"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left: Vehicle Image + Core Info */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="h-20 w-32 rounded-2xl overflow-hidden bg-soft shrink-0 shadow-sm">
                      {b.vehicleImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.vehicleImage} alt={b.vehicleName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">🚗</div>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-orange">#{b.bookingCode}</span>
                        <h3 className="font-black text-app text-base">{b.vehicleName}</h3>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="mt-1 text-xs text-soft">
                        <span className="font-semibold text-app">Rental Dates:</span>{" "}
                        {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-soft mt-0.5">
                        <span className="font-semibold text-app">Location:</span> {b.pickupLocation} ·{" "}
                        <span className="font-semibold text-app">Payment:</span>{" "}
                        <span className="text-emerald-500 font-bold capitalize">{b.paymentStatus}</span>
                      </p>
                    </div>
                  </div>

                  {/* Middle / Right: Financials & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between lg:justify-end w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-app">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-soft block">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-app">
                        ₹{b.totalCost.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-soft block">Incl. ₹{b.depositAmount} deposit</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Contextual Actions by State */}
                      {b.status === "active" && (
                        <Link
                          href="/customer/active-rental"
                          className="btn-primary px-4 py-2 text-xs font-bold"
                        >
                          Active Cockpit →
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setInvoiceDrawerOpen(true);
                        }}
                        className="btn-ghost px-3.5 py-2 text-xs font-bold"
                      >
                        Invoice
                      </button>

                      {(b.status === "pending" || b.status === "confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Drawer */}
      <Drawer
        isOpen={invoiceDrawerOpen}
        onClose={() => setInvoiceDrawerOpen(false)}
        title="Official Rental Invoice"
        subtitle={`Booking Ref: ${selectedBooking?.bookingCode}`}
      >
        {selectedBooking && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl border border-app bg-soft p-4 space-y-1.5">
              <div className="flex justify-between font-bold text-sm text-app">
                <span>Veloce Car Rental Co.</span>
                <span className="text-emerald-500 font-bold">PAID ✓</span>
              </div>
              <p className="text-soft">GSTIN: 27AABCV1234F1Z9 · Metropolis Central</p>
              <p className="text-soft">Renter: {selectedBooking.customerName}</p>
            </div>

            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <div className="flex justify-between py-1 border-b border-app">
                <span>Car:</span>
                <span className="font-bold text-app">{selectedBooking.vehicleName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Registration:</span>
                <span className="font-bold text-app">{selectedBooking.vehicleReg}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Base Rental:</span>
                <span className="font-bold text-app">₹{selectedBooking.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Security Deposit:</span>
                <span className="font-bold text-app">₹{selectedBooking.depositAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-app">
                <span>Taxes (18% GST):</span>
                <span className="font-bold text-app">₹{(selectedBooking.baseCost * 0.18).toFixed(0)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-app border-t border-app">
                <span>Total Amount:</span>
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
