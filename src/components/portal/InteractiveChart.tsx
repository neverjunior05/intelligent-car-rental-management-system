"use client";

import { useState } from "react";

// -----------------------------------------------------------------------------
// Area Curve Trend Chart (Revenue & Bookings)
// -----------------------------------------------------------------------------
export function RevenueTrendChart({
  data,
  height = 240,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 100);
  const min = 0;
  const paddingX = 40;
  const paddingY = 30;
  const width = 600;

  // Compute SVG Points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.value - min) / (max - min)) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  // Construct smooth bezier path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full select-none overflow-visible">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b00" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          const val = Math.round(min + pct * (max - min));
          return (
            <g key={idx}>
              <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" opacity="0.08" strokeDasharray="3 3" />
              <text x={paddingX - 8} y={y + 3} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
                ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={fillD} fill="url(#areaGradient)" />

        {/* Vibrant Trend Line */}
        <path d={pathD} fill="none" stroke="#ff6b00" strokeWidth="3" strokeLinecap="round" />

        {/* Interactive Data Dots */}
        {points.map((p, i) => {
          const isHovered = hoverIndex === i;
          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <circle cx={p.x} cy={p.y} r={isHovered ? "7" : "4"} fill="#ff6b00" stroke="#ffffff" strokeWidth={isHovered ? "2.5" : "1.5"} />
              <text x={p.x} y={height - 10} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">
                {p.label}
              </text>
            </g>
          );
        })}

        {/* Tooltip Overlay */}
        {hoverIndex !== null && (
          <g transform={`translate(${points[hoverIndex].x}, ${points[hoverIndex].y - 28})`} className="pointer-events-none animate-fade-in">
            <rect x="-45" y="-18" width="90" height="22" rx="6" fill="#0a0a0a" stroke="#ff6b00" strokeWidth="1" />
            <text x="0" y="-4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
              ₹{points[hoverIndex].value.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Interactive Bar Chart (Bookings by Status / Utilization)
// -----------------------------------------------------------------------------
export function StatusBarChart({
  data,
  height = 200,
}: {
  data: { label: string; count: number; color?: string }[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-3 pt-2">
      {data.map((item, idx) => {
        const pct = Math.round((item.count / max) * 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-app capitalize">{item.label}</span>
              <span className="font-bold text-soft">{item.count}</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-soft overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: item.color || "linear-gradient(90deg, #ff6b00, #ff8c3a)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Donut Fleet Utilization Chart
// -----------------------------------------------------------------------------
export function DonutUtilizationChart({
  available,
  rented,
  reserved,
  maintenance,
}: {
  available: number;
  rented: number;
  reserved: number;
  maintenance: number;
}) {
  const total = available + rented + reserved + maintenance || 1;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  const pRented = (rented / total) * circumference;
  const pAvail = (available / total) * circumference;
  const pRes = (reserved / total) * circumference;
  const pMaint = (maintenance / total) * circumference;

  const oRented = 0;
  const oAvail = pRented;
  const oRes = pRented + pAvail;
  const oMaint = pRented + pAvail + pRes;

  const utilPct = Math.round(((rented + reserved) / total) * 100);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" opacity="0.08" strokeWidth="18" />
          {/* Rented (Orange) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#ff6b00"
            strokeWidth="18"
            strokeDasharray={`${pRented} ${circumference}`}
            strokeDashoffset={-oRented}
            className="transition-all duration-700"
          />
          {/* Available (Emerald) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="18"
            strokeDasharray={`${pAvail} ${circumference}`}
            strokeDashoffset={-oAvail}
            className="transition-all duration-700"
          />
          {/* Reserved (Amber) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="18"
            strokeDasharray={`${pRes} ${circumference}`}
            strokeDashoffset={-oRes}
            className="transition-all duration-700"
          />
          {/* Maintenance (Red) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="18"
            strokeDasharray={`${pMaint} ${circumference}`}
            strokeDashoffset={-oMaint}
            className="transition-all duration-700"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute text-center">
          <span className="text-2xl font-black text-app">{utilPct}%</span>
          <span className="block text-[10px] font-bold uppercase tracking-wider text-soft">Active</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-orange" />
          <span className="text-soft">Rented ({rented})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-soft">Available ({available})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-soft">Reserved ({reserved})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-soft">Maintenance ({maintenance})</span>
        </div>
      </div>
    </div>
  );
}
