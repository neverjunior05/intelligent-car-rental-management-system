"use client";

import { useState } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useToast } from "@/components/portal/Toast";

export default function CustomerSupportPage() {
  const { success, warning } = useToast();
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDesc, setTicketDesc] = useState("");

  function handleSOS() {
    warning(
      "Roadside Emergency Triggered!",
      "Dispatch has received your telemetry coordinates. A support team is en route. Contacting 1800-VELOCE-CARE."
    );
  }

  function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    success("Support Ticket Submitted", "Ticket #TCK-9412 opened. Our 24/7 concierge will reply within 15 minutes.");
    setTicketSubject("");
    setTicketDesc("");
  }

  return (
    <PortalShell
      activeRole="customer"
      pageTitle="Support & Roadside Concierge"
      breadcrumb={[{ label: "Support" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-up">
        {/* Emergency SOS Banner */}
        <div className="rounded-3xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-red-900/20 to-red-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              24/7 Priority Emergency Hotline
            </div>
            <h3 className="text-xl font-black text-white">Need Immediate Roadside Assistance?</h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Flat tire, engine diagnostics, battery jump, or towing services.
            </p>
          </div>
          <button
            onClick={handleSOS}
            className="rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 text-xs tracking-wider uppercase shadow-lg shadow-red-600/30 transition cursor-pointer"
          >
            🚨 Trigger SOS Dispatch
          </button>
        </div>

        {/* FAQs + Submit Ticket Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Support Ticket */}
          <div className="card rounded-3xl p-6 border border-app">
            <h3 className="font-bold text-app text-sm mb-1">Open a Concierge Ticket</h3>
            <p className="text-xs text-soft mb-4">Questions about billing, rental extension, or vehicle features?</p>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-bold text-app">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding deposit release"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  required
                  className="input w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block font-bold text-app">Message Details</label>
                <textarea
                  rows={4}
                  placeholder="Describe your inquiry in detail..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  required
                  className="input w-full px-3 py-2 text-xs"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-2.5 text-xs font-bold shadow-md">
                Submit Support Request
              </button>
            </form>
          </div>

          {/* Quick FAQs */}
          <div className="card rounded-3xl p-6 border border-app space-y-3 text-xs">
            <h3 className="font-bold text-app text-sm mb-2">Frequently Asked Questions</h3>

            <div className="rounded-xl border border-app bg-soft/40 p-3">
              <span className="font-bold text-app block">When is the security deposit refunded?</span>
              <p className="mt-1 text-soft text-[11px] leading-relaxed">
                Security deposits are held as pre-authorizations and automatically released back to your card within 24 hours of successful vehicle check-in.
              </p>
            </div>

            <div className="rounded-xl border border-app bg-soft/40 p-3">
              <span className="font-bold text-app block">What is the fuel policy?</span>
              <p className="mt-1 text-soft text-[11px] leading-relaxed">
                All vehicles are handed over 100% full and must be returned with a full tank to avoid automated refuel deficit charges.
              </p>
            </div>

            <div className="rounded-xl border border-app bg-soft/40 p-3">
              <span className="font-bold text-app block">Can I extend my ongoing rental?</span>
              <p className="mt-1 text-soft text-[11px] leading-relaxed">
                Yes! Head to your Active Rental Cockpit and tap &quot;Request Extension&quot; before your scheduled return time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
