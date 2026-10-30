"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "What happens if my incoming flight is delayed?",
    a: "All airport reservations include complimentary flight tracking. Simply provide your flight number when reserving, and your vehicle is held without late penalty until you arrive.",
  },
  {
    q: "Is comprehensive collision & roadside insurance included?",
    a: "Yes. Every Veloce rental comes standard with full comprehensive damage cover, third-party liability protection, and 24/7 nationwide roadside assistance.",
  },
  {
    q: "Can I request door-to-door delivery of my vehicle?",
    a: "Absolutely. Our concierge team delivers vehicles to private residences, hotels, and private aviation terminals within a 35-mile radius of any flagship hub.",
  },
  {
    q: "What credentials do I need for digital key handover?",
    a: "You only need a valid government-issued driver's license and a major payment card. Our digital checkout lets you pre-verify your ID in under 60 seconds.",
  },
  {
    q: "What is your fuel / EV charging handover policy?",
    a: "We handover all petrol and diesel vehicles with a 100% full tank, and electric vehicles with at least 90% charge. Simply return with similar levels, or take advantage of prepaid fuel at market pump price.",
  },
];

const hubs = [
  {
    city: "Downtown Flagship Hub",
    address: "450 Grand Avenue, Financial District",
    hours: "Open 24/7",
    phone: "+1 (800) 835-6231",
    type: "Full Concierge & EV Superchargers",
  },
  {
    city: "Metro International Airport (JFK/SFO/ORD)",
    address: "Terminal 4 Express Fleet Deck",
    hours: "Daily: 5:00 AM – 1:00 AM",
    phone: "+1 (800) 835-6232",
    type: "Flight Tracked Curbside Handover",
  },
  {
    city: "Tech Park & Executive Depot",
    address: "1200 Innovation Way, Suite 100",
    hours: "Mon – Sat: 7:00 AM – 9:00 PM",
    phone: "+1 (800) 835-6233",
    type: "Corporate & Long-Term Leases",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "general", message: "" });
    }, 1000);
  }

  return (
    <div className="space-y-24 py-4 sm:py-8">
      {/* ---------------- HERO ---------------- */}
      <section className="relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2.5rem] border border-app bg-soft/50 px-5 sm:px-12 py-16 sm:py-24 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/4 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/3 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange" />
            </span>
            24/7 Client Care & Hotline
          </span>

          <h1 className="mt-5 text-3xl sm:text-6xl font-black tracking-tight text-app leading-[1.1]">
            We&apos;re here whenever you{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange to-amber-500 bg-clip-text text-transparent">
              need us
            </span>
            .
          </h1>

          <p className="mt-5 text-base sm:text-lg text-soft leading-relaxed max-w-2xl mx-auto">
            From booking inquiries and airport meet-and-greets to immediate roadside assistance,
            our concierge team is standing by around the clock.
          </p>
        </div>
      </section>

      {/* ---------------- QUICK CONTACT CARDS ---------------- */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: "🚨",
            title: "Roadside Emergency",
            info: "+1 (800) 835-6231",
            desc: "Immediate 24/7 dispatch & towing",
            cta: "Call Dispatch",
            href: "tel:+18008356231",
          },
          {
            icon: "🛎️",
            title: "Concierge Desk",
            info: "concierge@veloce.com",
            desc: "Custom bookings & delivery",
            cta: "Send Email",
            href: "mailto:concierge@veloce.com",
          },
          {
            icon: "💬",
            title: "Instant Chat",
            info: "WhatsApp Hotline",
            desc: "Live replies in < 2 minutes",
            cta: "Chat Now",
            href: "https://wa.me/18008356231",
          },
          {
            icon: "📍",
            title: "Flagship Hub",
            info: "450 Grand Avenue, NY",
            desc: "Open 24 hours daily",
            cta: "View Hubs",
            href: "#locations",
          },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 70} direction="up">
            <div className="card group flex flex-col justify-between h-full rounded-3xl border border-app bg-elev p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-orange hover:shadow-xl hover:shadow-orange/15">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/10 text-2xl transition-transform duration-300 group-hover:scale-110">
                  {c.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-app">{c.title}</h3>
                <div className="mt-1 font-mono text-sm font-bold text-orange">{c.info}</div>
                <p className="mt-1 text-xs text-soft">{c.desc}</p>
              </div>
              <div className="mt-5 pt-3 border-t border-app/60">
                <a
                  href={c.href}
                  className="text-xs font-bold text-app group-hover:text-orange transition-colors flex items-center gap-1"
                >
                  <span>{c.cta}</span>
                  <span>→</span>
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ---------------- FORM & FAQ SPLIT ---------------- */}
      <section className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Contact Form (7 cols) */}
        <Reveal direction="left" className="lg:col-span-7">
          <div className="card rounded-3xl border border-app bg-elev p-7 sm:p-9 shadow-xl relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-orange/10 blur-3xl" />

            <span className="text-xs font-bold uppercase tracking-widest text-orange">
              Direct Message
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-app">
              Send us a message
            </h2>
            <p className="mt-1 text-xs text-soft">
              Our concierge team will respond within 60 minutes during active hours.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-3 animate-fade-in">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-500/20 text-2xl text-emerald-500">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-app">Message Received!</h3>
                <p className="text-xs text-soft max-w-sm mx-auto">
                  Thank you for reaching out. A dedicated concierge specialist will review your request and reply to your email shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="btn-ghost px-5 py-2 text-xs font-bold mt-2"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-soft">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Vance"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input w-full px-3.5 py-2.5 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-soft">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="elena@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input w-full px-3.5 py-2.5 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-soft">
                    Subject / Topic
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input w-full px-3.5 py-2.5 text-sm font-medium cursor-pointer"
                  >
                    <option value="general">General Inquiry & Reservations</option>
                    <option value="corporate">Corporate Fleet & Long-Term Rental</option>
                    <option value="concierge">Special Delivery / Airport Meet & Greet</option>
                    <option value="feedback">Feedback & Review</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-soft">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you need assistance with..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input w-full px-3.5 py-2.5 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-sm font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Transmitting…" : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </Reveal>

        {/* FAQs Accordion (5 cols) */}
        <Reveal direction="right" className="lg:col-span-5 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange">
              Common Inquiries
            </span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-app">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={f.q}
                  className="rounded-2xl border border-app bg-elev p-4 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between text-left cursor-pointer gap-2"
                  >
                    <span className="text-sm font-bold text-app">{f.q}</span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft text-xs font-bold transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-orange" : "text-soft"
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs leading-relaxed text-soft animate-fade-in border-t border-app/50 pt-2.5">
                      {f.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* ---------------- FLEET LOCATIONS ---------------- */}
      <section id="locations" className="scroll-mt-24">
        <Reveal className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-orange">
            Network
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-app">
            Flagship Hub Locations
          </h2>
          <p className="mt-1 text-sm text-soft">
            Pick up in person or request direct delivery from any of our metropolitan facilities.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {hubs.map((hub, i) => (
            <Reveal key={hub.city} delay={i * 90} direction="up">
              <div className="card h-full rounded-3xl border border-app bg-elev p-6 flex flex-col justify-between transition-all duration-300 hover:border-orange hover:shadow-xl">
                <div>
                  <span className="rounded-md bg-orange/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange">
                    {hub.type}
                  </span>
                  <h3 className="mt-3 text-lg font-black text-app">{hub.city}</h3>
                  <p className="mt-1 text-xs text-soft">{hub.address}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-app/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-soft">
                    <span>Operating Hours:</span>
                    <span className="font-semibold text-app">{hub.hours}</span>
                  </div>
                  <div className="flex items-center justify-between text-soft">
                    <span>Direct Desk:</span>
                    <span className="font-mono font-bold text-orange">{hub.phone}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- BOTTOM BANNER ---------------- */}
      <Reveal direction="fade">
        <section className="animated-gradient relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] px-6 sm:px-12 py-14 sm:py-18 text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Need a car right now?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            Browse our live inventory with instant checkout and drive off in minutes.
          </p>
          <div className="mt-7 flex justify-center gap-4">
            <Link href="/vehicles" className="btn-primary px-8 py-3.5 text-sm sm:text-base">
              Explore Live Fleet →
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
