"use client";

import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";

export default function AdminCategoriesPage() {
  const { fleet } = useRentalStore();

  const categories = [
    {
      name: "Economy",
      desc: "Compact fuel-efficient hatchbacks and city commuters.",
      baseMin: "₹1,800 / day",
      deposit: "₹3,000",
      count: fleet.filter((v) => v.category === "Economy").length,
      icon: "🚗",
    },
    {
      name: "Sedan",
      desc: "Comfortable executive sedans with premium legroom and refinement.",
      baseMin: "₹3,000 / day",
      deposit: "₹3,000",
      count: fleet.filter((v) => v.category === "Sedan").length,
      icon: "🏎️",
    },
    {
      name: "SUV",
      desc: "Rugged 4x4 and spacious 7-seater vehicles for highways and trails.",
      baseMin: "₹3,600 / day",
      deposit: "₹3,000",
      count: fleet.filter((v) => v.category === "SUV").length,
      icon: "🚙",
    },
    {
      name: "Luxury",
      desc: "Exotic coupes, German sports sedans, and high-performance electrics.",
      baseMin: "₹6,500 / day",
      deposit: "₹8,000",
      count: fleet.filter((v) => v.category === "Luxury").length,
      icon: "✨",
    },
  ];

  return (
    <PortalShell
      activeRole="admin"
      pageTitle="Vehicle Categories & Rate Brackets"
      breadcrumb={[{ label: "Categories" }]}
    >
      <div className="space-y-6 max-w-5xl mx-auto animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-app">Fleet Classification & Segment Multipliers</h2>
            <p className="text-xs text-soft">
              Manage category pricing tiers, minimum security deposit rules, and vehicle allocation.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <div key={cat.name} className="card rounded-3xl p-6 border border-app space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-app">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 className="font-bold text-app text-base">{cat.name} Segment</h3>
                    <p className="text-xs text-soft">{cat.desc}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-app bg-soft/40 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-soft">Active Fleet Count:</span>
                  <strong className="text-orange font-bold">{cat.count} Units</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft">Tariff Range Starts At:</span>
                  <strong className="text-app font-bold">{cat.baseMin}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-soft">Mandatory Escrow Deposit:</span>
                  <strong className="text-emerald-500 font-bold">{cat.deposit}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
