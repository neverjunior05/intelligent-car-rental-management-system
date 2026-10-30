"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import Modal from "@/components/portal/Modal";
import { useToast } from "@/components/portal/Toast";

export default function AdminLocationsPage() {
  const { locations, fleet } = useRentalStore();
  const { success } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "Metropolis",
    phone: "",
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddModalOpen(false);
    success("Location Hub Added", `Hub ${form.name} registered.`);
  }

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Location Hubs & Fleet Distribution"
      breadcrumb={[{ label: "Locations" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Rental Hubs & Physical Depots</h2>
            <p className="text-xs text-soft">
              Manage airport branches, downtown pickup points, and logistical repair depots.
            </p>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-primary px-4 py-2 text-xs font-bold self-start sm:self-auto shadow-md"
          >
            + Add Location Hub
          </button>
        </div>

        {/* Hubs Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {locations.map((loc) => {
            const assignedCars = fleet.filter((v) => v.locationId === loc.id);
            return (
              <div key={loc.id} className="card rounded-3xl p-6 border border-app space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-app">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange/15 font-black text-orange text-sm">
                    📍
                  </span>
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                    Active Hub
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-app text-sm">{loc.name}</h3>
                  <p className="text-soft text-xs mt-0.5">{loc.address}, {loc.city}</p>
                  <p className="text-soft text-xs mt-0.5 font-mono">{loc.phone}</p>
                </div>

                <div className="rounded-2xl border border-app bg-soft/40 p-3 flex justify-between items-center text-xs">
                  <span className="text-soft">Assigned Fleet Units:</span>
                  <strong className="text-orange text-sm">{assignedCars.length || loc.fleetCount} Cars</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register New Rental Hub"
        subtitle="Expand physical pickup/return depot network"
      >
        <form onSubmit={handleAdd} className="space-y-4 text-xs">
          <div>
            <label className="mb-1 block font-bold text-app">Hub Name</label>
            <input
              type="text"
              placeholder="e.g. Metro North Expressway Depot"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="input w-full px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="mb-1 block font-bold text-app">Street Address</label>
            <input
              type="text"
              placeholder="e.g. 88 North Highway Blvd"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              className="input w-full px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-bold text-app">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block font-bold text-app">Depot Phone</label>
              <input
                type="text"
                placeholder="+1 555-800-1004"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="input w-full px-3 py-2 text-xs"
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
              Save Hub
            </button>
          </div>
        </form>
      </Modal>
    </PortalShell>
  );
}
