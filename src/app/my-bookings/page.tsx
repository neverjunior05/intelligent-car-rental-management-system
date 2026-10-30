"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Vehicle, Booking } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import Reveal from "@/components/Reveal";

interface Row {
  booking: Booking;
  vehicle: Vehicle | null;
}

export default function MyBookingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ bookings: Row[] }>("/api/bookings");
      if (data.bookings && data.bookings.length > 0) {
        setRows(data.bookings.sort((a, b) => b.booking.id - a.booking.id));
      } else {
        throw new Error("Empty");
      }
    } catch {
      try {
        const { rentalStore } = await import("@/lib/rentalStore");
        const bks = rentalStore.getBookings();
        const fl = rentalStore.getFleet();
        const mapped: Row[] = bks.map((b) => ({
          booking: {
            id: b.id,
            customerId: b.customerId,
            vehicleId: b.vehicleId,
            startDate: b.startDate,
            endDate: b.endDate,
            status: b.status,
            totalCost: String(b.totalCost),
            createdAt: b.createdAt,
          },
          vehicle: (fl.find((v) => v.id === b.vehicleId) as any) || null,
        }));
        setRows(mapped.sort((a, b) => b.booking.id - a.booking.id));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id: number) {
    await api(`/api/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "cancelled" }),
    });
    load();
  }

  if (loading)
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-soft" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="animate-fade-up text-4xl font-black tracking-tight">
        My Bookings
      </h1>
      {rows.length === 0 ? (
        <div className="card rounded-2xl py-20 text-center">
          <div className="text-5xl">🗓️</div>
          <p className="mt-4 text-lg font-semibold">No bookings yet</p>
          <p className="text-soft">Time to find your perfect ride.</p>
          <Link href="/vehicles" className="btn-primary mt-6 inline-block px-6 py-3">
            Browse the Fleet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map(({ booking, vehicle }, i) => (
            <Reveal key={booking.id} delay={i * 60}>
              <div className="card flex flex-wrap items-center gap-4 rounded-2xl p-4">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-soft">
                  {vehicle?.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.model}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold">
                      {vehicle
                        ? `${vehicle.make} ${vehicle.model}`
                        : "Vehicle"}
                    </h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-soft">
                    {new Date(booking.startDate).toLocaleDateString()} →{" "}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-soft">
                    Booking #{booking.id} ·{" "}
                    <span className="font-bold text-orange">
                      ₹{Number(booking.totalCost).toLocaleString()}
                    </span>
                  </p>
                </div>
                {(booking.status === "pending" ||
                  booking.status === "confirmed") && (
                  <button
                    onClick={() => cancel(booking.id)}
                    className="btn-ghost px-4 py-2 text-sm text-red-500 hover:!border-red-500 hover:!text-red-500"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
