"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Vehicle } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/components/AuthProvider";
import PortalShell from "@/components/portal/PortalShell";

const empty = {
  make: "",
  model: "",
  year: "2024",
  vin: "",
  registrationNumber: "",
  category: "Economy",
  fuelType: "petrol",
  transmission: "automatic",
  seats: "5",
  mileage: "0",
  fuelLevel: "100",
  dailyRate: "2000",
  imageUrl: "",
};

export default function StaffVehiclesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const data = await api<{ vehicles: Vehicle[] }>("/api/vehicles");
    setVehicles(data.vehicles);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/api/vehicles", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm(empty);
      setShowForm(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function changeStatus(id: number, status: string) {
    try {
      await api(`/api/vehicles/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function del(id: number) {
    if (!confirm("Delete this vehicle?")) return;
    await api(`/api/vehicles/${id}`, { method: "DELETE" });
    load();
  }

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const role = user?.role === "admin" ? "admin" : "staff";
  const dashboardHref = role === "admin" ? "/admin" : "/staff";

  return (
    <PortalShell
      activeRole={role}
      pageTitle="Fleet Inventory & Vehicle Management"
      breadcrumb={[
        { label: "Dashboard", href: dashboardHref },
        { label: "Fleet Inventory" },
      ]}
    >
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-up">
        {/* Top bar with back button and action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href={dashboardHref}
              className="group inline-flex items-center gap-2 rounded-xl border border-app bg-card px-3.5 py-2 text-xs font-bold text-soft hover:text-app hover:border-orange/50 transition shadow-sm"
              title="Return to Staff Dashboard"
            >
              <span className="transition-transform group-hover:-translate-x-1 font-bold">←</span>
              <span>Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-app">Fleet Inventory</h1>
              <p className="text-xs text-soft">
                Manage operational fleet, update vehicle deployment statuses, and add new cars.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm((s) => !s)}
            className="btn-primary px-4 py-2 text-xs font-bold shadow-sm self-start sm:self-auto"
          >
            {showForm ? "✕ Close Form" : "+ Add Vehicle"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={create}
            className="grid gap-3 card rounded-2xl p-5 sm:grid-cols-3 border border-app"
          >
            {[
              ["make", "Make"],
              ["model", "Model"],
              ["year", "Year"],
              ["vin", "VIN"],
              ["registrationNumber", "Registration #"],
              ["seats", "Seats"],
              ["mileage", "Mileage (km)"],
              ["fuelLevel", "Fuel level %"],
              ["dailyRate", "Daily rate ₹"],
              ["imageUrl", "Image URL"],
            ].map(([k, label]) => (
              <div key={k}>
                <label className="mb-1 block text-xs text-soft">
                  {label}
                </label>
                <input
                  value={form[k as keyof typeof form]}
                  onChange={(e) => set(k, e.target.value)}
                  className="w-full rounded-lg border border-app input px-2 py-1.5 text-sm"
                />
              </div>
            ))}
            <div>
              <label className="mb-1 block text-xs text-soft">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full rounded-lg border border-app input px-2 py-1.5 text-sm"
              >
                <option>Economy</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Luxury</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-soft">Fuel</label>
              <select
                value={form.fuelType}
                onChange={(e) => set("fuelType", e.target.value)}
                className="w-full rounded-lg border border-app input px-2 py-1.5 text-sm"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-soft">
                Transmission
              </label>
              <select
                value={form.transmission}
                onChange={(e) => set("transmission", e.target.value)}
                className="w-full rounded-lg border border-app input px-2 py-1.5 text-sm"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            {error && (
              <p className="col-span-full text-sm text-red-600">{error}</p>
            )}
            <div className="col-span-full">
              <button className="btn-primary px-5 py-2 text-sm">
                Save Vehicle
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto card rounded-2xl border border-app shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-soft text-left text-soft border-b border-app">
              <tr>
                <th className="p-3">Vehicle</th>
                <th className="p-3">Reg #</th>
                <th className="p-3">Rate</th>
                <th className="p-3">Mileage</th>
                <th className="p-3">Fuel</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t border-app hover:bg-soft/30 transition">
                  <td className="p-3 font-medium">
                    {v.make} {v.model} {v.year}
                  </td>
                  <td className="p-3 font-mono text-xs">{v.registrationNumber}</td>
                  <td className="p-3 font-bold text-orange">₹{Number(v.dailyRate).toLocaleString()}</td>
                  <td className="p-3">{v.mileage} km</td>
                  <td className="p-3">{v.fuelLevel}%</td>
                  <td className="p-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <select
                        value={v.status}
                        onChange={(e) => changeStatus(v.id, e.target.value)}
                        className="rounded border border-app input px-1 py-0.5 text-xs font-semibold"
                      >
                        <option value="available">available</option>
                        <option value="reserved">reserved</option>
                        <option value="rented">rented</option>
                        <option value="returned">returned</option>
                        <option value="maintenance">maintenance</option>
                      </select>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => del(v.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-soft">
          Note: status changes follow the vehicle state machine and will be
          rejected if the transition is invalid.
        </p>
      </div>
    </PortalShell>
  );
}
