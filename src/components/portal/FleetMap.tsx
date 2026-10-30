"use client";

import { useState } from "react";
import { FleetVehicle } from "@/lib/rentalStore";

interface Props {
  vehicles: FleetVehicle[];
  selectedVehicleId?: number;
  onSelectVehicle?: (vehicle: FleetVehicle) => void;
  height?: string;
  zoomToActive?: boolean;
}

export default function FleetMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  height = "520px",
}: Props) {
  const [hovered, setHovered] = useState<FleetVehicle | null>(null);
  const [filter, setFilter] = useState<"all" | "rented" | "available" | "maintenance">("all");

  const filteredVehicles = vehicles.filter((v) => {
    if (filter === "all") return true;
    return v.status === filter;
  });

  const activeVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Map coordinates projection helper (Metropolis grid simulation)
  // Base: lat ~40.7128, lng ~-74.0060 -> ViewBox 0 0 1000 650
  function project(lat: number, lng: number) {
    const minLat = 40.64;
    const maxLat = 40.79;
    const minLng = -74.12;
    const maxLng = -73.90;

    const x = ((lng - minLng) / (maxLng - minLng)) * 900 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 550 + 50;
    return { x: Math.max(30, Math.min(970, x)), y: Math.max(30, Math.min(620, y)) };
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-app bg-[#0a0f1d] text-white shadow-2xl">
      {/* Top Controls Overlay */}
      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl bg-black/60 p-1 backdrop-blur-md border border-white/10 text-xs">
          {(["all", "rented", "available", "maintenance"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition ${
                filter === f
                  ? "bg-orange text-white shadow"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {f} ({f === "all" ? vehicles.length : vehicles.filter((v) => v.status === f).length})
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10 text-xs text-zinc-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Live GPS Satellite Feed (30 Nodes)</span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute right-4 top-4 z-20 hidden md:flex items-center gap-3 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10 text-[11px] text-zinc-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
          Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange ring-2 ring-orange/20" />
          Rented / In Transit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
          Reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-red-400/20" />
          Maintenance
        </span>
      </div>

      {/* Interactive SVG City Grid Map */}
      <svg
        viewBox="0 0 1000 650"
        className="w-full select-none"
        style={{ height }}
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#080c16" stopOpacity="1" />
          </radialGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Background & Grid */}
        <rect width="1000" height="650" fill="url(#mapGlow)" />
        <rect width="1000" height="650" fill="url(#grid)" />

        {/* Metropolis Simulated River */}
        <path
          d="M 50 180 Q 250 240 450 160 T 800 280 T 980 220"
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="32"
          opacity="0.3"
          strokeLinecap="round"
        />
        <path
          d="M 50 180 Q 250 240 450 160 T 800 280 T 980 220"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          opacity="0.4"
        />

        {/* Major Expressways / Arterials */}
        <path d="M 80 50 L 920 600" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <path d="M 80 50 L 920 600" fill="none" stroke="#ff6b00" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />

        <path d="M 120 580 L 880 70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <path d="M 50 340 L 950 340" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <path d="M 500 40 L 500 610" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />

        {/* Central Hubs */}
        <g transform="translate(480, 320)">
          <circle r="36" fill="rgba(255,107,0,0.12)" />
          <circle r="8" fill="#ff6b00" />
          <text y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff" opacity="0.8">
            Downtown Central Hub
          </text>
        </g>
        <g transform="translate(820, 160)">
          <circle r="32" fill="rgba(59,130,246,0.12)" />
          <circle r="7" fill="#3b82f6" />
          <text y="22" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff" opacity="0.8">
            Airport Terminal 2
          </text>
        </g>
        <g transform="translate(220, 520)">
          <circle r="28" fill="rgba(168,85,247,0.12)" />
          <circle r="6" fill="#a855f7" />
          <text y="20" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff" opacity="0.8">
            City South Depot
          </text>
        </g>

        {/* Vehicle Markers */}
        {filteredVehicles.map((v) => {
          const { x, y } = project(v.lat, v.lng);
          const isSelected = selectedVehicleId === v.id;
          const isHovered = hovered?.id === v.id;

          const color =
            v.status === "rented"
              ? "#ff6b00"
              : v.status === "available"
                ? "#10b981"
                : v.status === "reserved"
                  ? "#f59e0b"
                  : "#ef4444";

          return (
            <g
              key={v.id}
              className="cursor-pointer transition-transform duration-200"
              onClick={() => onSelectVehicle?.(v)}
              onMouseEnter={() => setHovered(v)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Pulse effect if moving or selected */}
              {(v.status === "rented" || isSelected) && (
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? "22" : "15"}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.5"
                  opacity="0.6"
                  className="animate-ping"
                />
              )}

              {/* Marker Body */}
              <circle
                cx={x}
                cy={y}
                r={isSelected || isHovered ? "12" : "8"}
                fill={color}
                stroke="#ffffff"
                strokeWidth={isSelected ? "3" : "1.5"}
                className="transition-all duration-200 drop-shadow"
              />

              {/* Vehicle Icon / Number */}
              <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                fontSize={isSelected || isHovered ? "9" : "7"}
                fontWeight="black"
                fill="#ffffff"
              >
                {v.id}
              </text>

              {/* Hover / Selected Label Banner */}
              {(isHovered || isSelected) && (
                <g transform={`translate(${x}, ${y - 20})`} className="animate-fade-in pointer-events-none">
                  <rect
                    x="-65"
                    y="-24"
                    width="130"
                    height="24"
                    rx="6"
                    fill="rgba(10, 15, 29, 0.95)"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-9"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    {v.make} {v.model}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Selected Vehicle Telemetry Drawer (Floating at bottom) */}
      {activeVehicle && (
        <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-white/15 bg-black/80 p-4 backdrop-blur-xl animate-fade-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-16 overflow-hidden rounded-xl bg-zinc-800 shrink-0">
                {activeVehicle.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeVehicle.imageUrl}
                    alt={activeVehicle.model}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg">🚗</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">
                    {activeVehicle.make} {activeVehicle.model} ({activeVehicle.year})
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      activeVehicle.status === "rented"
                        ? "bg-orange/20 text-orange border border-orange/40"
                        : activeVehicle.status === "available"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    {activeVehicle.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Reg: <span className="font-semibold text-zinc-200">{activeVehicle.registrationNumber}</span> · Category:{" "}
                  <span className="font-semibold text-zinc-200">{activeVehicle.category}</span> · Fuel:{" "}
                  <span className="font-semibold text-zinc-200">{activeVehicle.fuelLevel}%</span>
                </p>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Speed</span>
                <span className="font-bold text-emerald-400 text-sm">{activeVehicle.speed} km/h</span>
              </div>
              <div className="rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Odometer</span>
                <span className="font-bold text-white text-sm">{activeVehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className="rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">GPS Status</span>
                <span className="font-bold text-sky-400 text-sm">Online (3D Fix)</span>
              </div>
              <div className="rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Driver</span>
                <span className="font-bold text-orange text-sm truncate max-w-[90px] block">
                  {activeVehicle.currentDriverName || "Idle"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
