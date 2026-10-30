"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";

const stats = [
  { value: "500+", label: "Premium Fleet", sub: "Hand-picked luxury & electric" },
  { value: "50,000+", label: "Happy Drivers", sub: "Across 14 operational hubs" },
  { value: "99.8%", label: "On-Time Dispatch", sub: "Verified zero-delay handover" },
  { value: "4.9 ★", label: "Customer Rating", sub: "Over 12,000 verified reviews" },
];

const values = [
  {
    icon: "🛡️",
    title: "Obsessive Standards",
    desc: "Every car in our fleet undergoes an exhaustive 48-point safety and diagnostics inspection prior to every booking.",
  },
  {
    icon: "💎",
    title: "Transparent Luxury",
    desc: "No fine print, no hidden fuel penalties, no surprise checkout surcharges. What you see is precisely what you pay.",
  },
  {
    icon: "⚡",
    title: "60-Second Digital Desk",
    desc: "From license verification to digital key access, our proprietary technology gets you from phone to driver seat in seconds.",
  },
  {
    icon: "🌿",
    title: "Eco-Forward Mobility",
    desc: "Over 40% of our fleet is fully electric or advanced hybrid, paired with carbon offset contributions on every rental mile.",
  },
];

const milestones = [
  {
    year: "2021",
    title: "The Genesis",
    desc: "Founded with an initial boutique collection of 15 performance sedans and a mission to eradicate rental counter friction.",
  },
  {
    year: "2023",
    title: "Digital Handover Engine",
    desc: "Launched our automated digital inspection telemetry, eliminating physical paperwork and cutting check-in times by 80%.",
  },
  {
    year: "2025",
    title: "Hybrid & EV Fleet Surge",
    desc: "Expanded to 300+ eco-luxury vehicles, opening dedicated rapid-charging hubs across metropolitan airports.",
  },
  {
    year: "2026",
    title: "Autonomous Fleet Intelligence",
    desc: "Introduced real-time fleet telematics, smart maintenance dispatch, and dynamic cross-city delivery options.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-24 py-4 sm:py-8">
      {/* ---------------- HERO ---------------- */}
      <section className="relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2.5rem] border border-app bg-soft/50 px-5 sm:px-12 py-16 sm:py-24 text-center">
        {/* Ambient Glow Orbs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange" />
            </span>
            About Veloce
          </span>

          <h1 className="mt-5 text-3xl sm:text-6xl font-black tracking-tight text-app leading-[1.1]">
            Redefining the{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange to-amber-500 bg-clip-text text-transparent">
              open road
            </span>{" "}
            experience.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-soft leading-relaxed max-w-2xl mx-auto">
            We believe renting a premium automobile should feel just as exhilarating as driving it.
            No counter queues, no vague vehicle models, just pristine machines delivered on demand.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/vehicles" className="btn-primary px-7 py-3 text-sm sm:text-base">
              Explore Our Fleet →
            </Link>
            <Link href="/contact" className="btn-ghost px-7 py-3 text-sm sm:text-base">
              Contact Concierge
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- STATS TICKER ---------------- */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} direction="up">
            <div className="card h-full rounded-3xl border border-app bg-elev p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-orange/50 hover:shadow-xl hover:shadow-orange/10">
              <div className="text-3xl sm:text-4xl font-black text-orange">{s.value}</div>
              <div className="mt-1.5 text-sm font-bold text-app">{s.label}</div>
              <div className="mt-1 text-xs text-soft">{s.sub}</div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ---------------- MISSION & STORY ---------------- */}
      <section className="grid gap-8 lg:grid-cols-2 items-center">
        <Reveal direction="left">
          <div className="space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-orange">
              Our Genesis
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-app">
              Born out of frustration with ordinary car rentals.
            </h2>
            <p className="text-sm sm:text-base text-soft leading-relaxed">
              Traditional car rental was broken: long queues at airport counters, unexpected insurance upsells,
              and arriving at the lot only to receive &ldquo;or similar&rdquo; vehicles that bore zero resemblance
              to what you actually booked.
            </p>
            <p className="text-sm sm:text-base text-soft leading-relaxed">
              Veloce was built from the ground up to restore the romance of driving. When you select a
              Porsche 911 Carrera or a Tesla Model S in our catalog, that exact car is prepared,
              detailed, and held exclusively for you.
            </p>
            <div className="pt-2 flex items-center gap-6">
              <div>
                <div className="text-xl font-black text-app">100% Guaranteed</div>
                <div className="text-xs text-soft">Exact Model Matching</div>
              </div>
              <div className="h-8 w-px bg-app" />
              <div>
                <div className="text-xl font-black text-app">Zero Queues</div>
                <div className="text-xs text-soft">Digital Keyless Pickup</div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal direction="right">
          <div className="relative overflow-hidden rounded-3xl border border-app bg-elev p-8 shadow-2xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-orange/15 blur-3xl" />
            <h3 className="text-xl font-black text-app">Our Three Core Commitments</h3>
            <div className="mt-6 space-y-5">
              {[
                {
                  title: "Pure Mechanical Integrity",
                  desc: "Every car is maintained strictly at certified factory centers with genuine OEM parts.",
                },
                {
                  title: "Transparent All-Inclusive Pricing",
                  desc: "Comprehensive collision coverage, 24/7 roadside assistance, and city tax are included upfront.",
                },
                {
                  title: "Bespoke Concierge Delivery",
                  desc: "Have your vehicle delivered directly to private hangars, hotels, or corporate offices.",
                },
              ].map((c, i) => (
                <div key={c.title} className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-orange/15 text-xs font-black text-orange">
                    0{i + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-app">{c.title}</h4>
                    <p className="mt-1 text-xs text-soft leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- VALUES ---------------- */}
      <section>
        <Reveal className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-orange">
            What Drives Us
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-app">
            Principles that guide every mile.
          </h2>
          <p className="mt-2 text-sm text-soft">
            We hold ourselves to the highest benchmark in customer delight and mechanical readiness.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 90} direction="up">
              <div className="card group h-full rounded-3xl border border-app bg-elev p-6 transition-all duration-300 hover:-translate-y-2 hover:border-orange hover:shadow-xl hover:shadow-orange/15">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/10 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {v.icon}
                </div>
                <h3 className="mt-5 text-base font-bold text-app">{v.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-soft">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- TIMELINE ---------------- */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-app bg-soft/40 p-6 sm:p-12">
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-orange">
            Our Journey
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-app">
            Milestones of innovation.
          </h2>
        </Reveal>

        <div className="relative mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m, i) => (
              <Reveal key={m.year} delay={i * 100} direction="up">
                <div className="card flex flex-col justify-between h-full rounded-2xl border border-app bg-elev p-6">
                  <div>
                    <span className="inline-block font-mono text-2xl font-black text-orange">
                      {m.year}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-app">{m.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-soft">{m.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- BOTTOM CTA ---------------- */}
      <Reveal direction="fade">
        <section className="animated-gradient relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] px-6 sm:px-12 py-14 sm:py-18 text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to get behind the wheel?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            Select your preferred model from our 30-car fleet and book your keys in under a minute.
          </p>
          <div className="mt-7 flex justify-center gap-4">
            <Link href="/vehicles" className="btn-primary px-8 py-3.5 text-sm sm:text-base">
              Browse Available Fleet
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
