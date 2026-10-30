"use client";

import { useState } from "react";
import { DamagePoint } from "@/lib/rentalStore";

interface Props {
  existingPoints?: DamagePoint[];
  newPoints?: DamagePoint[];
  readOnly?: boolean;
  onAddPoint?: (point: DamagePoint) => void;
  onRemovePoint?: (id: string) => void;
}

type CarArea = DamagePoint["area"];

const AREA_LABELS: Record<CarArea, string> = {
  front_bumper: "Front Bumper",
  hood: "Hood / Bonnet",
  windshield: "Front Windshield",
  left_doors: "Left Side / Doors",
  right_doors: "Right Side / Doors",
  rear_bumper: "Rear Bumper",
  roof: "Vehicle Roof",
  trunk: "Rear Trunk / Tailgate",
  wheels: "Wheels & Alloys",
};

export default function VehicleDamageDiagram({
  existingPoints = [],
  newPoints = [],
  readOnly = false,
  onAddPoint,
  onRemovePoint,
}: Props) {
  const [selectedArea, setSelectedArea] = useState<CarArea | null>(null);
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<DamagePoint["severity"]>("minor");
  const [activeTab, setActiveTab] = useState<"top" | "side">("top");

  function handleAdd() {
    if (!selectedArea || !description || !onAddPoint) return;
    const estCost = severity === "minor" ? 800 : severity === "moderate" ? 2500 : 7500;
    const point: DamagePoint = {
      id: `dmg-${Date.now()}`,
      area: selectedArea,
      description,
      severity,
      isPreExisting: false,
      date: new Date().toISOString().slice(0, 10),
      repairCostEstimate: estCost,
    };
    onAddPoint(point);
    setDescription("");
    setSelectedArea(null);
  }

  const allPoints = [...existingPoints, ...newPoints];

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-soft">Inspection View:</span>
          <div className="inline-flex rounded-lg border border-app bg-soft p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("top")}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                activeTab === "top" ? "bg-orange text-white shadow" : "text-soft hover:text-app"
              }`}
            >
              Top / Overhead
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("side")}
              className={`rounded-md px-3 py-1 font-semibold transition ${
                activeTab === "side" ? "bg-orange text-white shadow" : "text-soft hover:text-app"
              }`}
            >
              Side Profile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
            <span className="text-soft">Pre-existing ({existingPoints.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20" />
            <span className="text-soft font-semibold text-red-500">New Return Damage ({newPoints.length})</span>
          </span>
        </div>
      </div>

      {/* SVG Interactive Silhouette */}
      <div className="relative mx-auto flex max-w-lg items-center justify-center rounded-2xl border border-app bg-soft/40 p-6 backdrop-blur">
        {activeTab === "top" ? (
          <svg viewBox="0 0 300 480" className="h-96 w-auto drop-shadow-md select-none">
            {/* Car body outer shadow */}
            <rect x="70" y="30" width="160" height="420" rx="40" fill="currentColor" opacity="0.04" />

            {/* Front Bumper Area */}
            <path
              d="M 85 45 Q 150 15 215 45 L 210 80 Q 150 65 90 80 Z"
              fill={selectedArea === "front_bumper" ? "rgba(255,107,0,0.4)" : "rgba(200,200,200,0.15)"}
              stroke={selectedArea === "front_bumper" ? "#ff6b00" : "currentColor"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("front_bumper")}
            />
            <text x="150" y="55" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">
              Front Bumper
            </text>

            {/* Hood */}
            <path
              d="M 90 85 Q 150 70 210 85 L 205 160 Q 150 150 95 160 Z"
              fill={selectedArea === "hood" ? "rgba(255,107,0,0.4)" : "rgba(200,200,200,0.12)"}
              stroke={selectedArea === "hood" ? "#ff6b00" : "currentColor"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("hood")}
            />
            <text x="150" y="125" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" opacity="0.8">
              Hood / Engine
            </text>

            {/* Front Windshield */}
            <path
              d="M 95 165 Q 150 155 205 165 L 195 210 Q 150 205 105 210 Z"
              fill={selectedArea === "windshield" ? "rgba(255,107,0,0.4)" : "rgba(59,130,246,0.15)"}
              stroke={selectedArea === "windshield" ? "#ff6b00" : "#3b82f6"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("windshield")}
            />
            <text x="150" y="190" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.7">
              Windshield
            </text>

            {/* Left Doors / Body */}
            <path
              d="M 68 180 L 100 180 L 100 320 L 68 320 Z"
              fill={selectedArea === "left_doors" ? "rgba(255,107,0,0.4)" : "rgba(200,200,200,0.1)"}
              stroke={selectedArea === "left_doors" ? "#ff6b00" : "currentColor"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("left_doors")}
            />
            <text x="84" y="255" textAnchor="middle" fontSize="9" fill="currentColor" transform="rotate(-90 84 255)">
              Left Doors
            </text>

            {/* Right Doors / Body */}
            <path
              d="M 200 180 L 232 180 L 232 320 L 200 320 Z"
              fill={selectedArea === "right_doors" ? "rgba(255,107,0,0.4)" : "rgba(200,200,200,0.1)"}
              stroke={selectedArea === "right_doors" ? "#ff6b00" : "currentColor"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("right_doors")}
            />
            <text x="216" y="255" textAnchor="middle" fontSize="9" fill="currentColor" transform="rotate(90 216 255)">
              Right Doors
            </text>

            {/* Roof */}
            <rect
              x="105"
              y="215"
              width="90"
              height="100"
              rx="12"
              fill={selectedArea === "roof" ? "rgba(255,107,0,0.4)" : "rgba(200,200,200,0.15)"}
              stroke={selectedArea === "roof" ? "#ff6b00" : "currentColor"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("roof")}
            />
            <text x="150" y="270" textAnchor="middle" fontSize="11" fontWeight="bold" fill="currentColor" opacity="0.8">
              Roof
            </text>

            {/* Trunk */}
            <path
              d="M 100 325 Q 150 320 200 325 L 195 385 Q 150 395 105 385 Z"
              fill={selectedArea === "trunk" ? "rgba(255,107,0,0.4)" : "rgba(200,200,200,0.12)"}
              stroke={selectedArea === "trunk" ? "#ff6b00" : "currentColor"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("trunk")}
            />
            <text x="150" y="360" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">
              Trunk
            </text>

            {/* Rear Bumper */}
            <path
              d="M 90 390 Q 150 400 210 390 L 215 425 Q 150 455 85 425 Z"
              fill={selectedArea === "rear_bumper" ? "rgba(255,107,0,0.4)" : "rgba(200,200,200,0.15)"}
              stroke={selectedArea === "rear_bumper" ? "#ff6b00" : "currentColor"}
              strokeWidth="1.5"
              className={readOnly ? "" : "cursor-pointer transition hover:opacity-80"}
              onClick={() => !readOnly && setSelectedArea("rear_bumper")}
            />
            <text x="150" y="418" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">
              Rear Bumper
            </text>

            {/* 4 Wheels */}
            <rect x="52" y="90" width="16" height="50" rx="6" fill="#1f2937" stroke="#9ca3af" strokeWidth="1" />
            <rect x="232" y="90" width="16" height="50" rx="6" fill="#1f2937" stroke="#9ca3af" strokeWidth="1" />
            <rect x="52" y="340" width="16" height="50" rx="6" fill="#1f2937" stroke="#9ca3af" strokeWidth="1" />
            <rect x="232" y="340" width="16" height="50" rx="6" fill="#1f2937" stroke="#9ca3af" strokeWidth="1" />

            {/* Render Damage Hotspot Badges */}
            {allPoints.map((pt, i) => {
              const coords: Record<CarArea, { cx: number; cy: number }> = {
                front_bumper: { cx: 150, cy: 65 },
                hood: { cx: 150, cy: 110 },
                windshield: { cx: 150, cy: 180 },
                left_doors: { cx: 84, cy: 250 },
                right_doors: { cx: 216, cy: 250 },
                roof: { cx: 150, cy: 250 },
                trunk: { cx: 150, cy: 350 },
                rear_bumper: { cx: 150, cy: 410 },
                wheels: { cx: 60, cy: 115 },
              };
              const c = coords[pt.area] || { cx: 150, cy: 250 };
              const isPre = pt.isPreExisting;
              return (
                <g key={pt.id || i} className="cursor-pointer">
                  <circle
                    cx={c.cx + (i % 2 === 0 ? -12 : 12)}
                    cy={c.cy}
                    r="9"
                    fill={isPre ? "#3b82f6" : "#ef4444"}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <text
                    cx={c.cx + (i % 2 === 0 ? -12 : 12)}
                    cy={c.cy + 3}
                    x={c.cx + (i % 2 === 0 ? -12 : 12)}
                    y={c.cy + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    !
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          /* Side Profile View */
          <svg viewBox="0 0 500 200" className="h-48 w-full select-none">
            {/* Side car outline */}
            <path
              d="M 30 140 L 470 140 L 460 90 L 400 80 L 330 30 L 170 30 L 110 80 L 40 90 Z"
              fill="rgba(200,200,200,0.12)"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Windows */}
            <path
              d="M 180 40 L 320 40 L 380 80 L 130 80 Z"
              fill="rgba(59,130,246,0.15)"
              stroke="#3b82f6"
              strokeWidth="1.5"
            />
            {/* Wheels */}
            <circle cx="110" cy="140" r="30" fill="#1f2937" stroke="#ff6b00" strokeWidth="2" />
            <circle cx="110" cy="140" r="14" fill="#4b5563" />
            <circle cx="390" cy="140" r="30" fill="#1f2937" stroke="#ff6b00" strokeWidth="2" />
            <circle cx="390" cy="140" r="14" fill="#4b5563" />
            <text x="250" y="115" textAnchor="middle" fontSize="12" fontWeight="bold" fill="currentColor">
              Side Body & Door Panels
            </text>
          </svg>
        )}
      </div>

      {/* Record Damage Input Form (when an area is selected) */}
      {!readOnly && selectedArea && (
        <div className="card rounded-2xl border border-orange/40 bg-orange/5 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange">
              Recording Damage for: {AREA_LABELS[selectedArea]}
            </span>
            <button
              type="button"
              onClick={() => setSelectedArea(null)}
              className="text-xs text-soft hover:text-app"
            >
              Cancel
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[11px] font-semibold text-soft">Issue Description</label>
              <input
                type="text"
                placeholder="e.g. Scratched clearcoat, 5cm dent, cracked plastic..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full px-3 py-2 text-xs font-medium"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-soft">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="input w-full px-2.5 py-2 text-xs cursor-pointer"
              >
                <option value="minor">Minor (Est. ₹800)</option>
                <option value="moderate">Moderate (Est. ₹2,500)</option>
                <option value="severe">Severe (Est. ₹7,500)</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!description}
              className="btn-primary px-4 py-1.5 text-xs font-bold disabled:opacity-50"
            >
              + Add Damage Point
            </button>
          </div>
        </div>
      )}

      {/* List of Marked Damage Points */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-soft">
          Recorded Inspection Logs ({allPoints.length})
        </h4>
        {allPoints.length === 0 ? (
          <p className="rounded-xl border border-dashed border-app p-3 text-center text-xs text-soft">
            No damages recorded. Vehicle is in clean condition.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {allPoints.map((pt) => (
              <div
                key={pt.id}
                className={`flex items-start justify-between rounded-xl border p-3 text-xs ${
                  pt.isPreExisting
                    ? "border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-200"
                    : "border-red-500/30 bg-red-500/5 text-red-900 dark:text-red-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        pt.isPreExisting ? "bg-blue-500" : "bg-red-500"
                      }`}
                    />
                    <span>{AREA_LABELS[pt.area]}</span>
                    <span className="capitalize text-[10px] opacity-75">({pt.severity})</span>
                  </div>
                  <p className="mt-1 text-[11px] opacity-90">{pt.description}</p>
                  <p className="mt-1 font-semibold text-[10px] text-orange">
                    Charge Estimate: ₹{pt.repairCostEstimate.toLocaleString()}
                  </p>
                </div>
                {!readOnly && onRemovePoint && !pt.isPreExisting && (
                  <button
                    type="button"
                    onClick={() => onRemovePoint(pt.id)}
                    className="text-red-500 hover:text-red-700 font-bold ml-2"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
