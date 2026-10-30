"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  Driver,
  Payment,
  Invoice,
  Handover,
  ReturnRecord,
} from "@/lib/types";

interface Detail {
  drivers: Driver[];
  payments: Payment[];
  invoice: Invoice | null;
  handover: Handover | null;
  return: ReturnRecord | null;
}

interface DamageComparison {
  preExisting: { id: number; description: string; severity: string }[];
  newDamage: { id: number; description: string; severity: string }[];
  estimatedCharge: number;
}

export default function BookingActions({
  bookingId,
  vehicleId,
  status,
  onChange,
}: {
  bookingId: number;
  vehicleId: number;
  status: string;
  onChange: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [damage, setDamage] = useState<DamageComparison | null>(null);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"overview" | "handover" | "return" | "damage">(
    "overview",
  );

  const [ho, setHo] = useState({
    fuelLevel: "100",
    odometer: "0",
    condition: "Good",
    accessories: "Spare tyre, jack, first-aid kit",
    signature: "",
  });
  const [ret, setRet] = useState({
    fuelLevel: "100",
    odometer: "0",
    condition: "Good",
    notes: "",
    needsMaintenance: false,
  });
  const [dmg, setDmg] = useState({
    description: "",
    severity: "minor",
    isPreExisting: true,
  });

  const load = useCallback(async () => {
    const d = await api<Detail>(`/api/bookings/${bookingId}`);
    setDetail(d);
    try {
      const cmp = await api<DamageComparison>(
        `/api/damage?bookingId=${bookingId}`,
      );
      setDamage(cmp);
    } catch {
      /* ignore */
    }
  }, [bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  async function transition(next: string) {
    setMsg("");
    try {
      await api(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      onChange();
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function verifyDriver(id: number) {
    await api(`/api/drivers/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ verified: true }),
    });
    load();
  }

  async function submitHandover() {
    setMsg("");
    try {
      await api("/api/handover", {
        method: "POST",
        body: JSON.stringify({ bookingId, ...ho }),
      });
      setMsg("Handover recorded.");
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function submitReturn() {
    setMsg("");
    try {
      await api("/api/returns", {
        method: "POST",
        body: JSON.stringify({ bookingId, ...ret }),
      });
      setMsg("Return recorded & invoice generated.");
      onChange();
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function addDamage() {
    setMsg("");
    try {
      await api("/api/damage", {
        method: "POST",
        body: JSON.stringify({ vehicleId, bookingId, ...dmg }),
      });
      setDmg({ description: "", severity: "minor", isPreExisting: true });
      load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  const nextActions: Record<string, { to: string; label: string }[]> = {
    pending: [
      { to: "confirmed", label: "Confirm" },
      { to: "cancelled", label: "Cancel" },
    ],
    confirmed: [{ to: "active", label: "Activate (Pickup)" }],
    active: [],
    completed: [],
    cancelled: [],
  };

  return (
    <div className="mt-4 rounded-lg border border-app bg-soft p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {(["overview", "handover", "return", "damage"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1 text-xs font-medium capitalize ${
              tab === t ? "bg-orange text-white" : "bg-elev text-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {msg && (
        <p className="mb-3 rounded bg-blue-100 p-2 text-xs text-blue-800">
          {msg}
        </p>
      )}

      {tab === "overview" && detail && (
        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            {(nextActions[status] ?? []).map((a) => (
              <button
                key={a.to}
                onClick={() => transition(a.to)}
                className="rounded bg-orange px-3 py-1 text-xs font-semibold text-white hover:opacity-90"
              >
                {a.label}
              </button>
            ))}
          </div>

          <div>
            <h4 className="font-semibold">Drivers</h4>
            {detail.drivers.length === 0 && (
              <p className="text-soft">No drivers registered.</p>
            )}
            {detail.drivers.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between border-b border-app py-1"
              >
                <span>
                  {d.name} · Lic {d.licenseNumber} · ID {d.idNumber}
                </span>
                {d.verified ? (
                  <span className="text-xs font-semibold text-green-600">
                    ✓ Verified
                  </span>
                ) : (
                  <button
                    onClick={() => verifyDriver(d.id)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Verify
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-semibold">Payments</h4>
            {detail.payments.map((p) => (
              <p key={p.id} className="text-soft">
                ₹{Number(p.amount).toLocaleString()} · {p.method} · {p.status}
              </p>
            ))}
          </div>

          {detail.invoice && (
            <div className="rounded bg-elev p-3">
              <h4 className="font-semibold">Invoice</h4>
              <p>Base: ₹{Number(detail.invoice.baseCost).toLocaleString()}</p>
              <p>Fuel: ₹{Number(detail.invoice.fuelCharge).toLocaleString()}</p>
              <p>
                Extra mileage: ₹
                {Number(detail.invoice.extraMileageCharge).toLocaleString()}
              </p>
              <p>
                Damage: ₹
                {Number(detail.invoice.damageCharge).toLocaleString()}
              </p>
              <p className="font-bold">
                Total: ₹
                {Number(detail.invoice.totalAmount).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "handover" && (
        <div className="space-y-2 text-sm">
          {detail?.handover ? (
            <p className="text-green-700">
              Handover already recorded (odometer {detail.handover.odometer} km,
              fuel {detail.handover.fuelLevel}%).
            </p>
          ) : (
            <>
              <Field
                label="Fuel level %"
                value={ho.fuelLevel}
                onChange={(v) => setHo({ ...ho, fuelLevel: v })}
              />
              <Field
                label="Odometer km"
                value={ho.odometer}
                onChange={(v) => setHo({ ...ho, odometer: v })}
              />
              <Field
                label="Condition"
                value={ho.condition}
                onChange={(v) => setHo({ ...ho, condition: v })}
              />
              <Field
                label="Accessories"
                value={ho.accessories}
                onChange={(v) => setHo({ ...ho, accessories: v })}
              />
              <Field
                label="Signature (name)"
                value={ho.signature}
                onChange={(v) => setHo({ ...ho, signature: v })}
              />
              <button
                onClick={submitHandover}
                className="rounded bg-orange px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Record Handover
              </button>
            </>
          )}
        </div>
      )}

      {tab === "return" && (
        <div className="space-y-2 text-sm">
          {detail?.return ? (
            <p className="text-green-700">
              Return already recorded (odometer {detail.return.odometer} km).
            </p>
          ) : !detail?.handover ? (
            <p className="text-amber-600">Record the handover first.</p>
          ) : (
            <>
              <Field
                label="Fuel level %"
                value={ret.fuelLevel}
                onChange={(v) => setRet({ ...ret, fuelLevel: v })}
              />
              <Field
                label="Odometer km"
                value={ret.odometer}
                onChange={(v) => setRet({ ...ret, odometer: v })}
              />
              <Field
                label="Condition"
                value={ret.condition}
                onChange={(v) => setRet({ ...ret, condition: v })}
              />
              <Field
                label="Notes"
                value={ret.notes}
                onChange={(v) => setRet({ ...ret, notes: v })}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={ret.needsMaintenance}
                  onChange={(e) =>
                    setRet({ ...ret, needsMaintenance: e.target.checked })
                  }
                />
                Send vehicle to maintenance
              </label>
              <button
                onClick={submitReturn}
                className="rounded bg-orange px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Record Return & Generate Invoice
              </button>
            </>
          )}
        </div>
      )}

      {tab === "damage" && (
        <div className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h4 className="font-semibold">Pre-existing damage</h4>
              {damage?.preExisting.length ? (
                damage.preExisting.map((d) => (
                  <p key={d.id} className="text-soft">
                    • {d.description} ({d.severity})
                  </p>
                ))
              ) : (
                <p className="text-soft">None</p>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-red-600">New damage (return)</h4>
              {damage?.newDamage.length ? (
                damage.newDamage.map((d) => (
                  <p key={d.id} className="text-soft">
                    • {d.description} ({d.severity})
                  </p>
                ))
              ) : (
                <p className="text-soft">None</p>
              )}
              {damage && damage.estimatedCharge > 0 && (
                <p className="mt-1 font-semibold text-red-600">
                  Estimated damage charge: ₹
                  {damage.estimatedCharge.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="rounded bg-elev p-3">
            <h4 className="mb-2 font-semibold">Record damage</h4>
            <Field
              label="Description"
              value={dmg.description}
              onChange={(v) => setDmg({ ...dmg, description: v })}
            />
            <div className="mt-2 flex gap-3">
              <select
                value={dmg.severity}
                onChange={(e) => setDmg({ ...dmg, severity: e.target.value })}
                className="rounded border border-app input px-2 py-1 text-xs"
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={dmg.isPreExisting}
                  onChange={(e) =>
                    setDmg({ ...dmg, isPreExisting: e.target.checked })
                  }
                />
                Pre-existing
              </label>
              <button
                onClick={addDamage}
                disabled={!dmg.description}
                className="rounded bg-orange px-3 py-1 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-0.5 block text-xs text-soft">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-app input px-2 py-1 text-sm"
      />
    </div>
  );
}
