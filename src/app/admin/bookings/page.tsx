"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import { downloadAdminRentalsCsv, downloadAdminRentalsPdf } from "@/lib/exportUtils";
import { useToast } from "@/components/portal/Toast";

export default function AdminBookingsPage() {
  const { bookings, fleet } = useRentalStore();
  const { success } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  function handleDownloadCsv() {
    setDownloading("csv");
    try {
      downloadAdminRentalsCsv(bookings, fleet);
      success("Bookings CSV Exported", `Downloaded complete ledger of ${bookings.length} reservations.`);
    } finally {
      setTimeout(() => setDownloading(null), 500);
    }
  }

  function handleDownloadPdf() {
    setDownloading("pdf");
    try {
      downloadAdminRentalsPdf(bookings, fleet);
      success("Bookings PDF Exported", "Generated official PDF ledger document.");
    } finally {
      setTimeout(() => setDownloading(null), 500);
    }
  }

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="System-Wide Bookings Master"
      breadcrumb={[{ label: "Bookings" }]}
    >
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Global Bookings & Lifecycle Ledger</h2>
            <p className="text-xs text-soft">
              Audit all customer reservations, payment statuses, vehicle handovers, and return logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="card px-3 py-1.5 rounded-xl font-bold text-xs text-orange border border-app">
              {bookings.length} Total Bookings
            </span>
            <button
              onClick={handleDownloadCsv}
              disabled={downloading === "csv"}
              className="btn-ghost px-3.5 py-1.5 text-xs font-bold hover:!border-orange hover:text-orange flex items-center gap-1.5 transition"
              title="Download entire bookings ledger as CSV spreadsheet"
            >
              <span>{downloading === "csv" ? "⏳" : "📥"}</span>
              <span>Download CSV</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading === "pdf"}
              className="btn-primary px-3.5 py-1.5 text-xs font-bold shadow-sm flex items-center gap-1.5"
              title="Download executive audit summary as PDF"
            >
              <span>{downloading === "pdf" ? "⏳" : "📄"}</span>
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Ref #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-soft/30 transition">
                    <td className="p-4 font-mono font-bold text-orange">#{b.bookingCode}</td>
                    <td className="p-4 font-bold text-app">{b.customerName}</td>
                    <td className="p-4 text-app font-medium">{b.vehicleName}</td>
                    <td className="p-4 text-soft">
                      {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-black text-app">₹{b.totalCost.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 text-[10px] capitalize">
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
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
