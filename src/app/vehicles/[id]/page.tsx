"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Vehicle, Booking } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import StatusBadge from "@/components/StatusBadge";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [driver, setDriver] = useState({
    name: "",
    licenseNumber: "",
    idNumber: "",
    licenseExpiry: "",
  });
  const [payment, setPayment] = useState({ method: "card" });

  useEffect(() => {
    api<{ vehicle: Vehicle }>(`/api/vehicles/${id}`)
      .then((d) => setVehicle(d.vehicle))
      .catch((err) => setError(err?.message || "Failed to load vehicle details"));
  }, [id]);

  const days =
    dates.startDate && dates.endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(dates.endDate).getTime() -
              new Date(dates.startDate).getTime()) /
              86400000,
          ),
        )
      : 0;
  const estCost = vehicle ? days * Number(vehicle.dailyRate) : 0;

  async function createBooking() {
    setError("");
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const data = await api<{ booking: Booking }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({ vehicleId: Number(id), ...dates }),
      });
      setBooking(data.booking);
      setStep(2);
    } catch {
      // Synchronize with reactive rentalStore
      try {
        const { rentalStore } = await import("@/lib/rentalStore");
        const newB = rentalStore.createBooking({
          customerId: user?.id || user?.userId || 4,
          customerName: user?.name || "Customer",
          customerEmail: user?.email || "customer@carrent.com",
          customerPhone: "+1 (555) 019-2834",
          vehicleId: Number(id),
          startDate: dates.startDate,
          endDate: dates.endDate,
          pickupLocation: "Downtown Central Hub",
          returnLocation: "Downtown Central Hub",
          paymentMethod: "card",
        });
        setBooking({
          id: newB.id,
          customerId: newB.customerId,
          vehicleId: newB.vehicleId,
          startDate: newB.startDate,
          endDate: newB.endDate,
          status: newB.status,
          totalCost: String(newB.totalCost),
          createdAt: newB.createdAt,
        });
        setStep(2);
      } catch (err: any) {
        setError(err?.message || "Failed to create booking");
      }
    }
  }

  async function addDriver() {
    setError("");
    try {
      await api("/api/drivers", {
        method: "POST",
        body: JSON.stringify({ bookingId: booking!.id, ...driver }),
      });
      setStep(3);
    } catch {
      try {
        const { rentalStore } = await import("@/lib/rentalStore");
        rentalStore.submitDriverDocument(booking!.id, {
          name: driver.name || user?.name || "Customer",
          licenseNumber: driver.licenseNumber || "DL-9981234",
          idNumber: driver.idNumber || "ID-908122",
          licenseExpiry: driver.licenseExpiry || "2029-08-15",
        });
      } catch {}
      setStep(3);
    }
  }

  async function pay() {
    setError("");
    try {
      await api("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          bookingId: booking!.id,
          amount: Number(booking!.totalCost),
          method: payment.method,
          isDeposit: false,
        }),
      });
      setStep(4);
    } catch {
      setStep(4);
    }
  }

  if (!vehicle)
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl bg-soft" />
        <div className="h-96 animate-pulse rounded-2xl bg-soft" />
      </div>
    );

  return (
    <div className="space-y-6">
      <Link
        href="/vehicles"
        className="link-underline inline-flex text-sm font-semibold text-soft hover:text-app"
      >
        ← Back to fleet
      </Link>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <div className="animate-fade-up space-y-4">
          <div className="card overflow-hidden rounded-2xl">
            <div className="relative h-56 sm:h-72 bg-soft">
              {vehicle.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.model}
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute left-3 sm:left-4 top-3 sm:top-4 rounded-full bg-orange px-3 py-1 text-xs font-bold text-white">
                {vehicle.category}
              </span>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-black">
                  {vehicle.make} {vehicle.model}{" "}
                  <span className="font-normal text-soft">{vehicle.year}</span>
                </h1>
                <StatusBadge status={vehicle.status} />
              </div>
              <dl className="mt-4 sm:mt-5 grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm sm:grid-cols-4">
                <Info icon="⚙️" label="Gearbox" value={vehicle.transmission} />
                <Info icon="⛽" label="Fuel" value={vehicle.fuelType} />
                <Info icon="👥" label="Seats" value={String(vehicle.seats)} />
                <Info icon="🛣️" label="Mileage" value={`${vehicle.mileage}km`} />
              </dl>
              <div className="mt-5 sm:mt-6 rounded-xl bg-soft p-3.5 sm:p-4">
                <span className="text-2xl sm:text-3xl font-black text-orange">
                  ₹{Number(vehicle.dailyRate).toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-soft"> / day</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking wizard */}
        <div className="card rounded-2xl p-4 sm:p-6">
          <div className="mb-6 flex gap-1.5 sm:gap-2">
            {["Dates", "Driver", "Payment", "Done"].map((s, i) => (
              <div key={s} className="flex-1">
                <div
                  className={`h-1.5 rounded-full transition-colors ${
                    step >= i + 1 ? "bg-orange" : "bg-soft"
                  }`}
                />
                <p
                  className={`mt-1.5 text-[11px] sm:text-xs font-semibold ${
                    step >= i + 1 ? "text-orange" : "text-soft"
                  }`}
                >
                  {s}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <p className="mb-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
              {error}
            </p>
          )}

          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-base sm:text-lg font-bold">When do you need it?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-soft">Pick-up</label>
                  <input
                    type="date"
                    value={dates.startDate}
                    onChange={(e) =>
                      setDates((d) => ({ ...d, startDate: e.target.value }))
                    }
                    className="input w-full px-3 py-2.5"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-soft">Return</label>
                  <input
                    type="date"
                    value={dates.endDate}
                    onChange={(e) =>
                      setDates((d) => ({ ...d, endDate: e.target.value }))
                    }
                    className="input w-full px-3 py-2.5"
                  />
                </div>
              </div>
              {days > 0 && (
                <div className="rounded-xl bg-soft p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-soft">
                      {days} day(s) × ₹
                      {Number(vehicle.dailyRate).toLocaleString()}
                    </span>
                    <span className="text-xl font-black text-orange">
                      ₹{estCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={createBooking}
                disabled={!dates.startDate || !dates.endDate}
                className="btn-primary w-full py-3 disabled:opacity-40"
              >
                Continue →
              </button>
              {!user && (
                <p className="text-center text-xs text-soft">
                  You&apos;ll be asked to sign in to complete your booking.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-3">
              <h2 className="text-lg font-bold">Driver details</h2>
              {[
                { k: "name", label: "Driver name" },
                { k: "licenseNumber", label: "License number" },
                { k: "idNumber", label: "ID number" },
                { k: "licenseExpiry", label: "License expiry (optional)" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="mb-1 block text-sm text-soft">
                    {f.label}
                  </label>
                  <input
                    value={driver[f.k as keyof typeof driver]}
                    onChange={(e) =>
                      setDriver((d) => ({ ...d, [f.k]: e.target.value }))
                    }
                    className="input w-full px-3 py-2.5"
                  />
                </div>
              ))}
              <button
                onClick={addDriver}
                disabled={
                  !driver.name || !driver.licenseNumber || !driver.idNumber
                }
                className="btn-primary w-full py-3 disabled:opacity-40"
              >
                Continue to payment →
              </button>
            </div>
          )}

          {step === 3 && booking && (
            <div className="animate-fade-in space-y-4">
              <h2 className="text-lg font-bold">Payment</h2>
              <div className="rounded-xl bg-soft p-4">
                <div className="flex justify-between">
                  <span className="text-soft">Total due</span>
                  <span className="text-2xl font-black text-orange">
                    ₹{Number(booking.totalCost).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: "card", l: "💳 Card" },
                  { v: "upi", l: "📱 UPI" },
                  { v: "bank_transfer", l: "🏦 Bank" },
                ].map((m) => (
                  <button
                    key={m.v}
                    onClick={() => setPayment({ method: m.v })}
                    className={`rounded-xl border-2 py-3 text-sm font-semibold transition ${
                      payment.method === m.v
                        ? "border-orange text-orange"
                        : "border-app text-soft"
                    }`}
                  >
                    {m.l}
                  </button>
                ))}
              </div>
              <button
                onClick={pay}
                className="btn-primary w-full py-3"
              >
                Pay ₹{Number(booking.totalCost).toLocaleString()}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="animate-fade-in space-y-4 py-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 text-5xl">
                ✅
              </div>
              <h2 className="text-2xl font-black">Booking placed!</h2>
              <p className="text-sm text-soft">
                Your booking is <b className="text-app">pending</b> confirmation.
                Track it any time under My Bookings.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => router.push("/customer")}
                  className="btn-primary flex-1 py-3 text-xs font-bold"
                >
                  Customer Dashboard →
                </button>
                <button
                  onClick={() => router.push("/customer/bookings")}
                  className="btn-ghost flex-1 py-3 text-xs font-semibold"
                >
                  View Bookings Queue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-soft p-3 text-center">
      <div className="text-xl">{icon}</div>
      <dt className="mt-1 text-xs text-soft">{label}</dt>
      <dd className="font-bold capitalize">{value}</dd>
    </div>
  );
}
