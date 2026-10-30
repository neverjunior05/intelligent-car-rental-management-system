"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalShell from "@/components/portal/PortalShell";
import { useRentalStore } from "@/lib/useRentalStore";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/portal/Toast";
import Drawer from "@/components/portal/Drawer";
import StatusBadge from "@/components/StatusBadge";
import { Vehicle } from "@/lib/types";

const categories = ["All", "Economy", "Sedan", "SUV", "Luxury"];

export default function CustomerFleetPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { fleet, pricing, actions } = useRentalStore();
  const { success, error } = useToast();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [transmission, setTransmission] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [sort, setSort] = useState("recommended");

  // Booking Drawer State
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);

  // Auto-open booking drawer if selected vehicle id is passed via URL query
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get("selected");
    if (selectedId && fleet.length > 0) {
      const found = fleet.find((v) => String(v.id) === selectedId);
      if (found) {
        setBookingVehicle(found);
      }
    }
  }, [fleet]);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 4).toISOString().slice(0, 10)
  );
  const [pickupLoc, setPickupLoc] = useState("Downtown Central Hub");
  const [returnLoc, setReturnLoc] = useState("Downtown Central Hub");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "bank_transfer">("card");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Filter fleet
  const filtered = useMemo(() => {
    let list = fleet.filter((v) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        `${v.make} ${v.model} ${v.category} ${v.color || ""}`.toLowerCase().includes(q);
      const matchesCat = selectedCategory === "All" || v.category === selectedCategory;
      const matchesTrans = !transmission || v.transmission === transmission;
      const matchesFuel = !fuelType || v.fuelType === fuelType;
      return matchesSearch && matchesCat && matchesTrans && matchesFuel;
    });

    if (sort === "price-low") {
      list = [...list].sort((a, b) => +a.dailyRate - +b.dailyRate);
    } else if (sort === "price-high") {
      list = [...list].sort((a, b) => +b.dailyRate - +a.dailyRate);
    }
    return list;
  }, [fleet, search, selectedCategory, transmission, fuelType, sort]);

  // Booking calculations
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const depositAmount = bookingVehicle
    ? bookingVehicle.category === "Luxury"
      ? pricing.luxurySecurityDeposit
      : pricing.standardSecurityDeposit
    : 0;

  const baseRentalCost = bookingVehicle ? rentalDays * Number(bookingVehicle.dailyRate) : 0;
  const totalPayable = baseRentalCost + depositAmount;

  function handleOpenBooking(vehicle: Vehicle) {
    if (vehicle.status !== "available") return;
    setBookingVehicle(vehicle);
  }

  function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingVehicle) return;

    setBookingSubmitting(true);
    try {
      const currentUserId = user?.id || user?.userId || 4;
      const currentUserName = user?.name || "Customer";
      const currentUserEmail = user?.email || "customer@carrent.com";

      const newBooking = actions.createBooking({
        customerId: currentUserId,
        customerName: currentUserName,
        customerEmail: currentUserEmail,
        customerPhone: "+1 (555) 019-2834",
        vehicleId: bookingVehicle.id,
        startDate,
        endDate,
        pickupLocation: pickupLoc,
        returnLocation: returnLoc,
        paymentMethod,
      });

      setBookingVehicle(null);
      success(
        "Reservation Confirmed!",
        `Booking #${newBooking.bookingCode} for ${bookingVehicle.make} ${bookingVehicle.model} is created! View in My Bookings.`
      );
      router.push("/customer/bookings");
    } catch (err: any) {
      error("Booking Failed", err?.message || "Could not complete reservation.");
    } finally {
      setBookingSubmitting(false);
    }
  }

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="Browse Fleet & Instant Booking"
      breadcrumb={[{ label: "Fleet" }]}
    >
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-up">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-app bg-gradient-to-r from-elev via-soft/40 to-elev p-6 sm:p-8 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-3 py-1 text-xs font-bold text-orange mb-2">
              <span className="h-2 w-2 rounded-full bg-orange animate-pulse" />
              Live Fleet Availability
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-app">
              Select Your <span className="text-orange">Ride</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-soft">
              Browse fully serviced vehicles, verify specs, and book instantly from within your portal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold uppercase tracking-wider text-soft block">Available Fleet</span>
              <span className="text-xl font-black text-emerald-500">
                {fleet.filter((v) => v.status === "available").length} / {fleet.length} Units
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card rounded-2xl p-4 sm:p-5 border border-app space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft text-sm">
                🔍
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search make, model, category, or color…"
                className="input w-full py-2.5 pl-10 pr-3 text-xs sm:text-sm font-medium"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="input cursor-pointer px-3 py-2 text-xs font-medium"
              >
                <option value="">Transmission: All</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="input cursor-pointer px-3 py-2 text-xs font-medium"
              >
                <option value="">Fuel: All</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input cursor-pointer px-3 py-2 text-xs font-medium"
              >
                <option value="recommended">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`shrink-0 cursor-pointer rounded-xl px-4 py-1.5 text-xs font-bold transition-all ${
                  selectedCategory === c
                    ? "bg-orange text-white shadow-md shadow-orange/20"
                    : "bg-soft/70 text-soft hover:text-app hover:bg-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles Grid */}
        {filtered.length === 0 ? (
          <div className="card rounded-2xl py-16 text-center border border-app">
            <div className="text-4xl">🚗💨</div>
            <p className="mt-3 text-base font-bold text-app">No vehicles match your criteria</p>
            <p className="text-xs text-soft mt-1">Try resetting or broadening your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((v) => {
              const isAvailable = v.status === "available";

              return (
                <div
                  key={v.id}
                  className="card rounded-3xl overflow-hidden border border-app hover:border-orange/40 transition-all duration-300 flex flex-col group shadow-sm hover:shadow-lg"
                >
                  {/* Vehicle Image Banner */}
                  <div className="relative h-48 overflow-hidden bg-soft">
                    {v.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.imageUrl}
                        alt={`${v.make} ${v.model}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                      {v.category}
                    </span>
                    <div className="absolute right-3 top-3">
                      <StatusBadge status={v.status} />
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-base text-app leading-tight">
                          {v.make} {v.model}
                        </h3>
                        <span className="text-xs text-soft font-normal">{v.year}{v.color ? ` · ${v.color}` : ""}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-soft bg-soft px-2 py-0.5 rounded-md">
                        {v.registrationNumber}
                      </span>
                    </div>

                    {/* Specs Pills */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5 text-[11px] text-soft">
                      <span className="rounded-lg bg-soft/70 px-2 py-1 flex items-center gap-1 capitalize">
                        ⚙️ {v.transmission}
                      </span>
                      <span className="rounded-lg bg-soft/70 px-2 py-1 flex items-center gap-1 capitalize">
                        ⛽ {v.fuelType}
                      </span>
                      <span className="rounded-lg bg-soft/70 px-2 py-1 flex items-center gap-1">
                        👥 {v.seats} Seats
                      </span>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="mt-auto pt-5 border-t border-app/60 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-soft block">Rate per day</span>
                        <span className="text-lg font-black text-orange">
                          ₹{Number(v.dailyRate).toLocaleString()}
                          <span className="text-[11px] font-normal text-soft">/day</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBooking(v)}
                        disabled={!isAvailable}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm cursor-pointer ${
                          isAvailable
                            ? "bg-orange hover:bg-orange/90 text-white shadow-orange/20"
                            : "bg-soft text-soft cursor-not-allowed opacity-60"
                        }`}
                      >
                        {isAvailable ? "Book Now →" : "Reserved"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* Instant Booking Drawer (Stays completely within Customer Portal)   */}
        {/* ------------------------------------------------------------------ */}
        {bookingVehicle && (
          <Drawer
            isOpen={!!bookingVehicle}
            onClose={() => setBookingVehicle(null)}
            title={`Reserve ${bookingVehicle.make} ${bookingVehicle.model}`}
            subtitle="Complete your reservation without leaving your portal"
            width="max-w-lg"
          >
            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              {/* Selected Car Highlight */}
              <div className="flex items-center gap-3 rounded-2xl bg-soft/60 p-3 border border-app">
                {bookingVehicle.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bookingVehicle.imageUrl}
                    alt={bookingVehicle.model}
                    className="h-16 w-20 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h4 className="font-bold text-app text-sm">
                    {bookingVehicle.make} {bookingVehicle.model} ({bookingVehicle.year})
                  </h4>
                  <span className="text-[11px] text-soft">
                    {bookingVehicle.category} · {bookingVehicle.transmission} · {bookingVehicle.fuelType}
                  </span>
                  <div className="font-black text-orange mt-0.5">
                    ₹{Number(bookingVehicle.dailyRate).toLocaleString()} / day
                  </div>
                </div>
              </div>

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-app">Pickup Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-bold text-app">Return Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Hub Pickups */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-app">Pickup Hub</label>
                  <select
                    value={pickupLoc}
                    onChange={(e) => setPickupLoc(e.target.value)}
                    className="input w-full px-3 py-2 text-xs cursor-pointer"
                  >
                    <option value="Downtown Central Hub">Downtown Central Hub</option>
                    <option value="Terminal 1 Airport Depot">Terminal 1 Airport Depot</option>
                    <option value="Westside Mobility Hub">Westside Mobility Hub</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-bold text-app">Return Hub</label>
                  <select
                    value={returnLoc}
                    onChange={(e) => setReturnLoc(e.target.value)}
                    className="input w-full px-3 py-2 text-xs cursor-pointer"
                  >
                    <option value="Downtown Central Hub">Downtown Central Hub</option>
                    <option value="Terminal 1 Airport Depot">Terminal 1 Airport Depot</option>
                    <option value="Westside Mobility Hub">Westside Mobility Hub</option>
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-1.5 block font-bold text-app">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "card", label: "Card", icon: "💳" },
                    { id: "upi", label: "UPI Instant", icon: "⚡" },
                    { id: "bank_transfer", label: "NetBank", icon: "🏦" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`rounded-xl border p-2 text-center transition cursor-pointer ${
                        paymentMethod === p.id
                          ? "border-orange bg-orange/10 text-orange font-bold"
                          : "border-app bg-soft/50 text-soft hover:bg-soft"
                      }`}
                    >
                      <div className="text-base">{p.icon}</div>
                      <div className="text-[10px] mt-0.5">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Summary Breakdown */}
              <div className="rounded-2xl border border-app bg-soft/40 p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-soft">
                  <span>Duration</span>
                  <span className="font-bold text-app">{rentalDays} day(s)</span>
                </div>
                <div className="flex justify-between text-soft">
                  <span>Base Daily Rate</span>
                  <span className="font-bold text-app">₹{Number(bookingVehicle.dailyRate).toLocaleString()} × {rentalDays}</span>
                </div>
                <div className="flex justify-between text-soft">
                  <span>Base Rental Subtotal</span>
                  <span className="font-bold text-app">₹{baseRentalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-soft">
                  <span>Refundable Security Deposit</span>
                  <span className="font-bold text-app">₹{depositAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-app/60 pt-2 flex justify-between font-black text-sm text-app">
                  <span>Total Payable</span>
                  <span className="text-orange">₹{totalPayable.toLocaleString()}</span>
                </div>
                <span className="text-[10px] text-soft block">
                  * Security deposit is released within 24 hours of successful vehicle return.
                </span>
              </div>

              {/* Renter Details Confirmation */}
              <div className="rounded-xl border border-app/60 bg-soft/30 p-2.5 text-[11px] text-soft flex items-center justify-between">
                <span>Renter: <b className="text-app">{user?.name || "Customer"}</b></span>
                <span>Email: <b className="text-app">{user?.email || "customer@carrent.com"}</b></span>
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="btn-primary w-full py-3 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {bookingSubmitting ? "Creating Reservation…" : `Confirm & Book (₹${totalPayable.toLocaleString()})`}
              </button>
            </form>
          </Drawer>
        )}
      </div>
    </PortalShell>
  );
}
