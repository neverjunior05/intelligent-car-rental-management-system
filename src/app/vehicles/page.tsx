"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Vehicle } from "@/lib/types";
import Reveal from "@/components/Reveal";

const categories = ["All", "Economy", "Sedan", "SUV", "Luxury"];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [sort, setSort] = useState("recommended");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ vehicles: Vehicle[] }>(
        "/api/vehicles?availableOnly=true",
      );
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      console.warn("API request failed, loading local fleet:", err);
      try {
        const { mockVehicles } = await import("@/lib/mockVehicles");
        setVehicles(mockVehicles.filter((v) => v.status === "available"));
      } catch {
        setError(err?.message || "Failed to load vehicles");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${v.make} ${v.model} ${v.category}`.toLowerCase().includes(q);
      const matchesCat = cat === "All" || v.category === cat;
      const matchesT = !transmission || v.transmission === transmission;
      const matchesF = !fuelType || v.fuelType === fuelType;
      return matchesSearch && matchesCat && matchesT && matchesF;
    });
    if (sort === "price-low")
      list = [...list].sort((a, b) => +a.dailyRate - +b.dailyRate);
    if (sort === "price-high")
      list = [...list].sort((a, b) => +b.dailyRate - +a.dailyRate);
    return list;
  }, [vehicles, search, cat, transmission, fuelType, sort]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="text-4xl font-black tracking-tight">
          Find your <span className="text-orange">perfect ride</span>
        </h1>
        <p className="mt-2 text-soft">
          {vehicles.length} premium cars ready to book right now.
        </p>
      </div>

      {/* Search + filters */}
      <div className="card sticky top-16 sm:top-20 z-30 space-y-3 sm:space-y-4 rounded-2xl p-3.5 sm:p-5">
        <div className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft">
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search make, model or category…"
              className="input w-full py-2.5 sm:py-3 pl-10 pr-3 text-sm sm:text-base"
            />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
            <select
              value={transmission}
              onChange={(e) => setTransmission(e.target.value)}
              className="input cursor-pointer px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm"
            >
              <option value="">Gearbox</option>
              <option value="automatic">Auto</option>
              <option value="manual">Manual</option>
            </select>
            <select
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="input cursor-pointer px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm"
            >
              <option value="">Fuel</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input cursor-pointer px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm"
            >
              <option value="recommended">Sort</option>
              <option value="price-low">Price: Low</option>
              <option value="price-high">Price: High</option>
            </select>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 cursor-pointer rounded-full px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                cat === c
                  ? "bg-orange text-white shadow-lg shadow-orange/30"
                  : "bg-soft text-soft hover:text-app"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {error && vehicles.length === 0 ? (
        <div className="card rounded-2xl py-12 px-6 text-center border border-amber-500/30 bg-amber-500/5">
          <div className="text-4xl">⚠️</div>
          <p className="mt-3 text-lg font-semibold text-app">Could not connect to fleet database</p>
          <p className="mt-1 text-sm text-soft">{error}</p>
          <button
            onClick={() => load()}
            className="btn-primary mt-5 inline-block"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-soft"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card rounded-2xl py-20 text-center">
          <div className="text-5xl">🚗💨</div>
          <p className="mt-4 text-lg font-semibold">No cars match your search</p>
          <p className="text-soft">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-soft">
            Showing <b className="text-app">{filtered.length}</b> vehicles
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v, i) => (
              <Reveal key={v.id} delay={(i % 6) * 60}>
                <VehicleCard v={v} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function VehicleCard({ v }: { v: Vehicle }) {
  return (
    <Link
      href={`/vehicles/${v.id}`}
      className="card group flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative h-48 overflow-hidden bg-soft">
        {v.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={v.imageUrl}
            alt={`${v.make} ${v.model}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {v.category}
        </span>
        {v.fuelType === "electric" && (
          <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
            ⚡ EV
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between">
          <h3 className="font-bold leading-tight">
            {v.make} {v.model}
            <span className="ml-1 font-normal text-soft">{v.year}</span>
          </h3>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-soft">
          <Spec icon="⚙️" label={v.transmission} />
          <Spec icon="⛽" label={v.fuelType} />
          <Spec icon="👥" label={`${v.seats} seats`} />
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-xl font-black text-orange">
            ₹{Number(v.dailyRate).toLocaleString()}
            <span className="text-xs font-normal text-soft">/day</span>
          </span>
          <span className="btn-primary px-4 py-2 text-sm">Book Now →</span>
        </div>
      </div>
    </Link>
  );
}

function Spec({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-lg bg-soft px-2 py-1 capitalize">
      {icon} {label}
    </span>
  );
}
