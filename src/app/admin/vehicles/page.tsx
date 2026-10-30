"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/portal/Modal";
import Drawer from "@/components/portal/Drawer";
import { useToast } from "@/components/portal/Toast";

export default function AdminVehiclesPage() {
  const { fleet, actions } = useRentalStore();
  const { success, warning } = useToast();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  const [form, setForm] = useState({
    make: "",
    model: "",
    year: 2024,
    vin: "",
    registrationNumber: "",
    category: "Economy",
    fuelType: "petrol" as const,
    transmission: "automatic" as const,
    seats: 5,
    mileage: 12000,
    fuelLevel: 100,
    dailyRate: "2800",
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80&auto=format&fit=crop",
    locationId: 1,
  });

  const filtered = fleet.filter((v) => {
    const matchesCat = categoryFilter === "all" || v.category.toLowerCase() === categoryFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      v.make.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.registrationNumber.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    actions.addVehicle({
      ...form,
      status: "available",
      lat: 40.7128,
      lng: -74.006,
      speed: 0,
      heading: 0,
      currentAddress: "Downtown Central Hub",
    });
    setAddModalOpen(false);
    success("Vehicle Added", `${form.make} ${form.model} added to active fleet.`);
  }

  function handleStatusChange(id: number, nextStatus: any) {
    actions.updateVehicle(id, { status: nextStatus, inMaintenance: nextStatus === "maintenance" });
    success("Status Changed", `Vehicle #${id} status updated to ${nextStatus.toUpperCase()}`);
    if (selectedVehicle?.id === id) {
      setSelectedVehicle({ ...selectedVehicle, status: nextStatus });
    }
  }

  function handleDelete(id: number) {
    if (!confirm("Are you sure you want to decommission and remove this vehicle from fleet?")) return;
    actions.deleteVehicle(id);
    warning("Vehicle Removed", `Vehicle #${id} decommissioned.`);
    setSelectedVehicle(null);
  }

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Enterprise Fleet Inventory Control"
      breadcrumb={[{ label: "Fleet Inventory" }]}
    >
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Master Directory ({fleet.length} Units)</h2>
            <p className="text-xs text-soft">
              Total fleet administration, category assignment, tariff overrides, and maintenance status controls.
            </p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-primary px-4 py-2 text-xs font-bold self-start sm:self-auto shadow-md"
          >
            + Add New Fleet Vehicle
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search by make, model, registration #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full py-2 pl-9 pr-3 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
            {(["all", "economy", "sedan", "suv", "luxury"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`rounded-xl px-3 py-1.5 font-bold capitalize transition shrink-0 cursor-pointer ${
                  categoryFilter === c ? "bg-orange text-white shadow-sm" : "bg-soft text-soft hover:text-app"
                }`}
              >
                {c} ({c === "all" ? fleet.length : fleet.filter((v) => v.category.toLowerCase() === c).length})
              </button>
            ))}
          </div>
        </div>

        {/* Fleet Table */}
        <div className="card rounded-3xl border border-app overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-soft/60 text-soft font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Reg #</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Daily Rate</th>
                  <th className="p-4">Fuel</th>
                  <th className="p-4">Odometer</th>
                  <th className="p-4">Lifecycle State</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-soft/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-lg overflow-hidden bg-soft shrink-0">
                          {v.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={v.imageUrl} alt={v.model} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-app block">{v.make} {v.model}</span>
                          <span className="text-[10px] text-soft">{v.year} · {v.transmission}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-medium text-app">{v.registrationNumber}</td>
                    <td className="p-4 font-semibold text-app">{v.category}</td>
                    <td className="p-4 font-black text-orange">₹{Number(v.dailyRate).toLocaleString()}</td>
                    <td className="p-4 font-medium text-app">{v.fuelLevel}%</td>
                    <td className="p-4 text-soft">{v.mileage.toLocaleString()} km</td>
                    <td className="p-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedVehicle(v)}
                          className="btn-ghost px-2.5 py-1 text-xs font-semibold"
                        >
                          Manage
                        </button>
                        <select
                          value={v.status}
                          onChange={(e) => handleStatusChange(v.id, e.target.value)}
                          className="rounded-lg border border-app bg-soft px-2 py-1 text-[11px] font-bold cursor-pointer"
                        >
                          <option value="available">Available</option>
                          <option value="reserved">Reserved</option>
                          <option value="rented">Rented</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Fleet Vehicle"
        subtitle="Add unit to active commercial fleet inventory"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">Make</label>
              <input
                type="text"
                placeholder="e.g. BMW"
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Model</label>
              <input
                type="text"
                placeholder="e.g. 5 Series"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                className="input w-full px-3 py-2 text-xs font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input w-full px-2.5 py-2 text-xs font-bold cursor-pointer"
              >
                <option value="Economy">Economy</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Daily Rate (₹)</label>
              <input
                type="text"
                value={form.dailyRate}
                onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                className="input w-full px-3 py-2 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">VIN Number</label>
              <input
                type="text"
                placeholder="VIN99201..."
                value={form.vin}
                onChange={(e) => setForm({ ...form, vin: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Registration #</label>
              <input
                type="text"
                placeholder="MH01AB9999"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-app">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="btn-ghost px-4 py-2 font-bold text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary px-5 py-2 font-bold text-xs">
              Save Vehicle
            </button>
          </div>
        </form>
      </Modal>

      {/* Vehicle Operations Drawer */}
      <Drawer
        isOpen={!!selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
        title="Vehicle Profile & Controls"
        subtitle={selectedVehicle ? `${selectedVehicle.make} ${selectedVehicle.model}` : ""}
      >
        {selectedVehicle && (
          <div className="space-y-4 text-xs">
            <div className="h-40 rounded-2xl overflow-hidden bg-soft shadow-inner">
              {selectedVehicle.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedVehicle.imageUrl} alt={selectedVehicle.model} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="rounded-2xl border border-app p-4 space-y-2 text-soft">
              <div className="flex justify-between">
                <span>Registration:</span>
                <strong className="text-app font-mono">{selectedVehicle.registrationNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span>VIN:</span>
                <strong className="text-app font-mono">{selectedVehicle.vin}</strong>
              </div>
              <div className="flex justify-between">
                <span>Current State:</span>
                <strong className="text-orange uppercase">{selectedVehicle.status}</strong>
              </div>
              <div className="flex justify-between">
                <span>Odometer:</span>
                <strong className="text-app">{selectedVehicle.mileage.toLocaleString()} km</strong>
              </div>
              <div className="flex justify-between">
                <span>Fuel Level:</span>
                <strong className="text-app">{selectedVehicle.fuelLevel}%</strong>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleDelete(selectedVehicle.id)}
                className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition cursor-pointer"
              >
                Decommission Vehicle From Fleet
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </PortalShell>
  );
}
