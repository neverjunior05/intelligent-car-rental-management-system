"use client";

import Link from "next/link";
import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import { RevenueTrendChart, DonutUtilizationChart, StatusBarChart } from "@/components/portal/InteractiveChart";
import { useToast } from "@/components/portal/Toast";
import { downloadAdminRentalsCsv, downloadAdminRentalsPdf, downloadAdminAllDataJson } from "@/lib/exportUtils";

export default function AdminDashboard() {
  const { fleet, bookings, users, maintenanceJobs } = useRentalStore();
  const { success } = useToast();
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d" | "90d">("30d");
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);

  // Executive KPI calculations
  const totalVehicles = fleet.length;
  const availableVehicles = fleet.filter((v) => v.status === "available").length;
  const rentedVehicles = fleet.filter((v) => v.status === "rented").length;
  const reservedVehicles = fleet.filter((v) => v.status === "reserved").length;
  const maintenanceVehicles = fleet.filter((v) => v.status === "maintenance").length;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === "paid" ? b.totalCost : 0), 0);
  const totalCustomers = users.filter((u) => u.role === "customer").length;
  const totalStaff = users.filter((u) => u.role === "staff" || u.role === "maintenance").length;

  // Chart data feeds
  const revenueTrendData = [
    { label: "Mon", value: 32000 },
    { label: "Tue", value: 45000 },
    { label: "Wed", value: 41000 },
    { label: "Thu", value: 58000 },
    { label: "Fri", value: 72000 },
    { label: "Sat", value: 89000 },
    { label: "Sun", value: 64000 },
  ];

  const bookingStatusData = [
    { label: "Active Rentals", count: rentedVehicles, color: "linear-gradient(90deg, #ff6b00, #ff8c3a)" },
    { label: "Confirmed Upcoming", count: reservedVehicles, color: "linear-gradient(90deg, #3b82f6, #60a5fa)" },
    { label: "Completed Trips", count: bookings.filter((b) => b.status === "completed").length, color: "linear-gradient(90deg, #10b981, #34d399)" },
    { label: "Pending KYC Review", count: bookings.filter((b) => b.status === "pending").length, color: "linear-gradient(90deg, #f59e0b, #fbbf24)" },
  ];

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Administrator Executive Control"
      breadcrumb={[{ label: "Executive Dashboard" }]}
    >
      <div className="space-y-8 animate-fade-up">
        {/* Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-app bg-gradient-to-r from-elev via-soft/40 to-elev p-6 sm:p-8 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400 mb-2">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              Full Enterprise Clearance · System Administrator
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-app">
              Executive Fleet Oversight
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-soft">
              Real-time commercial SaaS metrics, revenue streams, fleet utilization, and cross-role audit.
            </p>
          </div>

          {/* Date Range & Download Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-app bg-soft p-1 text-xs">
              {(["today", "7d", "30d", "90d"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`rounded-lg px-3 py-1 font-bold uppercase transition ${
                    dateRange === r ? "bg-orange text-white shadow" : "text-soft hover:text-app"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Quick Download Rentals Data */}
            <div className="relative">
              <button
                onClick={() => setDownloadMenuOpen((o) => !o)}
                className="btn-ghost px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 hover:!border-orange hover:text-orange transition shadow-sm"
                title="Download car rentals database & reports"
              >
                <span>📥</span>
                <span>Download Rentals Data ▾</span>
              </button>

              {downloadMenuOpen && (
                <div
                  className="absolute right-0 mt-1.5 w-64 rounded-2xl border border-app bg-card p-2 shadow-2xl z-30 animate-fade-up text-xs space-y-1"
                  onClick={() => setDownloadMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      downloadAdminRentalsCsv(bookings, fleet);
                      success("CSV Ledger Downloaded", `Full car rentals ledger (${bookings.length} records) downloaded.`);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left font-bold text-app hover:bg-soft flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">📊</span>
                    <div>
                      <div>Rental Bookings (.csv)</div>
                      <span className="text-[10px] text-soft font-normal block">Excel / Spreadsheet ledger</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      downloadAdminRentalsPdf(bookings, fleet);
                      success("Executive PDF Downloaded", "Official audit report document generated.");
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left font-bold text-app hover:bg-soft flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">📄</span>
                    <div>
                      <div>Executive Audit (.pdf)</div>
                      <span className="text-[10px] text-soft font-normal block">Printable summary document</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      downloadAdminAllDataJson(bookings, fleet, users, maintenanceJobs);
                      success("Master Database Exported", "Complete raw JSON system backup downloaded.");
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left font-bold text-app hover:bg-soft flex items-center gap-2.5 transition"
                  >
                    <span className="text-base">📦</span>
                    <div>
                      <div>Full System Export (.json)</div>
                      <span className="text-[10px] text-soft font-normal block">All cars, bookings & users</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <Link href="/admin/live" className="btn-primary px-4 py-2 text-xs font-bold shadow-md">
              Live Fleet Map ↗
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* EXECUTIVE KPI METRICS (8 Key Indicators)                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="card rounded-2xl p-5 border-l-4 border-l-orange">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Gross Revenue</span>
            <span className="text-2xl font-black text-app mt-2 block">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">↑ 18.4% vs last period</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-emerald-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Active Fleet Size</span>
            <span className="text-2xl font-black text-emerald-500 mt-2 block">{availableVehicles} / {totalVehicles}</span>
            <span className="text-[11px] text-soft mt-1 block">{rentedVehicles} currently on road</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-blue-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">Registered Customers</span>
            <span className="text-2xl font-black text-blue-500 mt-2 block">{totalCustomers} Users</span>
            <span className="text-[11px] text-soft mt-1 block">{totalStaff} operational staff</span>
          </div>

          <div className="card rounded-2xl p-5 border-l-4 border-l-red-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-soft block">In Workshop</span>
            <span className="text-2xl font-black text-red-500 mt-2 block">{maintenanceVehicles} Vehicles</span>
            <span className="text-[11px] text-soft mt-1 block">{maintenanceJobs.filter((j) => j.status === "in_progress").length} active repairs</span>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE DATA VISUALIZATIONS GRID                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Trends Curve Chart (2 cols) */}
          <div className="card rounded-3xl p-6 border border-app lg:col-span-2 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-app">
              <div>
                <h3 className="font-bold text-app text-sm">Revenue Inflow & Projections</h3>
                <p className="text-xs text-soft">Weekly gross bookings billing revenue</p>
              </div>
              <span className="text-xs font-black text-orange">Avg: ₹58,000 / day</span>
            </div>

            <RevenueTrendChart data={revenueTrendData} height={230} />
          </div>

          {/* Fleet Utilization Donut (1 col) */}
          <div className="card rounded-3xl p-6 border border-app space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-app">
              <div>
                <h3 className="font-bold text-app text-sm">Fleet Capacity Split</h3>
                <p className="text-xs text-soft">Live availability distribution</p>
              </div>
            </div>

            <DonutUtilizationChart
              available={availableVehicles}
              rented={rentedVehicles}
              reserved={reservedVehicles}
              maintenance={maintenanceVehicles}
            />
          </div>
        </div>

        {/* Bottom Row: Bookings by Status Breakdown vs Quick Management Shortcuts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bookings Status Breakdown */}
          <div className="card rounded-3xl p-6 border border-app space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-app">
              <div>
                <h3 className="font-bold text-app text-sm">Bookings Pipeline Distribution</h3>
                <p className="text-xs text-soft">Active lifecycle state tracking</p>
              </div>
            </div>

            <StatusBarChart data={bookingStatusData} />
          </div>

          {/* Executive Direct Actions & Shortcuts */}
          <div className="card rounded-3xl p-6 border border-app space-y-4 shadow-sm">
            <h3 className="font-bold text-app text-sm pb-2 border-b border-app">Executive Quick Actions</h3>

            <div className="grid gap-3 grid-cols-2 text-xs">
              <Link
                href="/admin/users"
                className="rounded-2xl border border-app bg-soft/50 p-4 hover:border-orange hover:bg-orange/5 transition block group"
              >
                <span className="text-xl mb-1 block">🛡️</span>
                <span className="font-bold text-app block group-hover:text-orange">Manage Users</span>
                <span className="text-[10px] text-soft">Create staff & technicians</span>
              </Link>

              <Link
                href="/admin/pricing"
                className="rounded-2xl border border-app bg-soft/50 p-4 hover:border-orange hover:bg-orange/5 transition block group"
              >
                <span className="text-xl mb-1 block">⚙️</span>
                <span className="font-bold text-app block group-hover:text-orange">Pricing Engine</span>
                <span className="text-[10px] text-soft">Configure base rates & fees</span>
              </Link>

              <Link
                href="/admin/live"
                className="rounded-2xl border border-app bg-soft/50 p-4 hover:border-orange hover:bg-orange/5 transition block group"
              >
                <span className="text-xl mb-1 block">🛰️</span>
                <span className="font-bold text-app block group-hover:text-orange">Live Operations</span>
                <span className="text-[10px] text-soft">GPS Fleet tracking map</span>
              </Link>

              <Link
                href="/admin/activity"
                className="rounded-2xl border border-app bg-soft/50 p-4 hover:border-orange hover:bg-orange/5 transition block group"
              >
                <span className="text-xl mb-1 block">📜</span>
                <span className="font-bold text-app block group-hover:text-orange">Audit Log</span>
                <span className="text-[10px] text-soft">Review cross-role actions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
