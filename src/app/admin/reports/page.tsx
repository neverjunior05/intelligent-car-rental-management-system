"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import { RevenueTrendChart, StatusBarChart, DonutUtilizationChart } from "@/components/portal/InteractiveChart";
import { useToast } from "@/components/portal/Toast";
import { downloadAdminRentalsCsv, downloadAdminRentalsPdf, downloadAdminAllDataJson } from "@/lib/exportUtils";

export default function AdminReportsPage() {
  const { fleet, bookings, users, maintenanceJobs } = useRentalStore();
  const { success } = useToast();

  const [dateRange, setDateRange] = useState("30d");
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === "paid" ? b.totalCost : 0), 0);
  const totalRepairCost = maintenanceJobs.reduce((sum, j) => sum + (j.actualCost || j.estimatedCost || 0), 0);
  const netOperatingProfit = totalRevenue - totalRepairCost;

  function handleExport(format: "csv" | "pdf" | "json") {
    setDownloadingFormat(format);
    try {
      if (format === "csv") {
        downloadAdminRentalsCsv(bookings, fleet);
        success("CSV Ledger Exported", `Full car rentals dataset (${bookings.length} reservations) downloaded directly to your device.`);
      } else if (format === "pdf") {
        downloadAdminRentalsPdf(bookings, fleet);
        success("Executive PDF Generated", "Car rental executive audit document (.pdf) downloaded.");
      } else if (format === "json") {
        downloadAdminAllDataJson(bookings, fleet, users, maintenanceJobs);
        success("Database Backup Exported", "Complete raw JSON data archive downloaded.");
      }
    } finally {
      setTimeout(() => setDownloadingFormat(null), 500);
    }
  }

  const revenueMonthly = [
    { label: "W1", value: 42000 },
    { label: "W2", value: 58000 },
    { label: "W3", value: 69000 },
    { label: "W4", value: 84000 },
  ];

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Enterprise Reports & Financial Analytics"
      breadcrumb={[{ label: "Reports & Analytics" }]}
    >
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Financial Performance & Utilization</h2>
            <p className="text-xs text-soft">
              Detailed commercial analysis on booking volume, repair liabilities, and net revenue yield. Download reports directly to your machine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExport("csv")}
              disabled={downloadingFormat === "csv"}
              className="btn-ghost px-3.5 py-2 text-xs font-bold hover:!border-orange hover:text-orange flex items-center gap-1.5 transition"
              title="Download entire car rental booking ledger as CSV spreadsheet"
            >
              <span>{downloadingFormat === "csv" ? "⏳" : "📥"}</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={downloadingFormat === "pdf"}
              className="btn-primary px-3.5 py-2 text-xs font-bold shadow-md flex items-center gap-1.5"
              title="Download executive audit summary as printable PDF"
            >
              <span>{downloadingFormat === "pdf" ? "⏳" : "🖨️"}</span>
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport("json")}
              disabled={downloadingFormat === "json"}
              className="btn-ghost px-3 py-2 text-xs font-semibold text-soft hover:text-app"
              title="Download raw database backup as JSON"
            >
              Raw JSON 📦
            </button>
          </div>
        </div>

        {/* Financial Executive Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card rounded-2xl p-5 border-l-4 border-l-emerald-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Gross Rental Revenue</span>
            <span className="text-2xl font-black text-app mt-2 block">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">All settled transactions</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-red-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Fleet Maintenance Costs</span>
            <span className="text-2xl font-black text-red-500 mt-2 block">₹{totalRepairCost.toLocaleString()}</span>
            <span className="text-[11px] text-soft mt-1 block">Parts & labor expenditure</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Net Operational Yield</span>
            <span className="text-2xl font-black text-orange mt-2 block">₹{netOperatingProfit.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">Healthy operating margin</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <h3 className="font-bold text-app text-sm pb-2 border-b border-app">Monthly Revenue Growth</h3>
            <RevenueTrendChart data={revenueMonthly} height={220} />
          </div>

          <div className="card rounded-3xl p-6 border border-app space-y-4">
            <h3 className="font-bold text-app text-sm pb-2 border-b border-app">Fleet Allocation Split</h3>
            <DonutUtilizationChart
              available={fleet.filter((v) => v.status === "available").length}
              rented={fleet.filter((v) => v.status === "rented").length}
              reserved={fleet.filter((v) => v.status === "reserved").length}
              maintenance={fleet.filter((v) => v.status === "maintenance").length}
            />
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
