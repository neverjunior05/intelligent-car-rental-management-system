"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Reveal from "@/components/Reveal";
import { api } from "@/lib/api";
import { Vehicle } from "@/lib/types";

const features = [
  { icon: "⚡", title: "Instant Booking", desc: "Reserve your car in under 60 seconds — no paperwork, no waiting." },
  { icon: "🛡️", title: "Fully Insured", desc: "Every rental is covered end-to-end for total peace of mind." },
  { icon: "💸", title: "Best Price Guarantee", desc: "Transparent pricing with zero hidden fees, ever." },
  { icon: "📍", title: "Multiple Pickups", desc: "Grab your ride from downtown hubs or the airport." },
  { icon: "🔧", title: "Serviced Fleet", desc: "Meticulously maintained vehicles you can trust." },
  { icon: "🕐", title: "24/7 Support", desc: "Real humans ready to help, any time of day." },
];

const steps = [
  {
    n: "01",
    tag: "Fleet Discovery",
    title: "Choose Your Ride",
    desc: "Browse our handpicked fleet of luxury sedans, sports coupes, and rugged SUVs with live availability.",
    perks: ["Filter by rate & gearbox", "Odometer & fuel metrics", "High-definition gallery"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    n: "02",
    tag: "Digital Booking",
    title: "Reserve & Verify",
    desc: "Pick your dates, add your verified driver details, and complete payment with 100% transparent pricing.",
    perks: ["Instant digital KYC", "UPI, Card & NetBanking", "Zero hidden charges"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    n: "03",
    tag: "Key Handover",
    title: "Hit the Open Road",
    desc: "Experience digital checklist handover with condition photo sign-off, take the keys, and enjoy the drive.",
    perks: ["Digital damage signoff", "Full-tank handover", "24/7 Roadside hotline"],
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

const brands = ["TOYOTA", "TESLA", "BMW", "MERCEDES", "AUDI", "JEEP", "PORSCHE", "HONDA"];

export default function Home() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Vehicle[]>([]);

  useEffect(() => {
    api<{ vehicles: Vehicle[] }>("/api/vehicles?availableOnly=true")
      .then((d) => setCars(d.vehicles.slice(0, 3)))
      .catch(() => {});
  }, []);

  const dashHref = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "staff"
        ? "/staff"
        : user.role === "maintenance"
          ? "/maintenance"
          : "/vehicles"
    : "/vehicles";

  return (
    <div className="space-y-28">
      {/* ---------------- HERO ---------------- */}
      <section className="relative -mx-3 sm:-mx-4 overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem] px-4 pb-16 sm:pb-24 pt-12 sm:pt-24 text-white">
        <div className="animated-gradient absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(255,107,0,0.5),transparent_45%)]" />

        <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-10 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="pulse-ring absolute inline-flex h-full w-full" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange" />
              </span>
              Now available in your city
            </span>
            <h1 className="mt-5 text-3xl xs:text-4xl sm:text-6xl font-black leading-[1.08] tracking-tight">
              Drive the{" "}
              <span className="bg-gradient-to-r from-[#ff8c3a] to-[#ff6b00] bg-clip-text text-transparent">
                extraordinary
              </span>
              .
            </h1>
            <p className="mt-4 sm:mt-5 max-w-md text-base sm:text-lg text-white/70">
              Premium cars, effortless booking. Pick your ride, set your dates,
              and hit the road in minutes.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link href={dashHref} className="btn-primary text-center px-7 py-3 sm:py-3.5 text-base">
                Browse the Fleet
              </Link>
              {!user && (
                <Link
                  href="/register"
                  className="rounded-xl border border-white/30 text-center px-7 py-3 sm:py-3.5 text-base font-semibold backdrop-blur transition hover:bg-white/10"
                >
                  Create Account
                </Link>
              )}
            </div>
            <div className="mt-8 sm:mt-10 grid grid-cols-3 gap-3 sm:gap-8">
              {[
                { k: "500+", v: "Cars" },
                { k: "50k+", v: "Happy Renters" },
                { k: "4.9★", v: "Avg. Rating" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="text-xl sm:text-2xl font-black text-orange">{s.k}</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wide text-white/60">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating hero car card */}
          <div className="relative hidden lg:block">
            <div className="animate-float">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                <div className="overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900"
                    alt="Featured car"
                    className="h-72 w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between px-2 py-4">
                  <div>
                    <p className="font-bold">Porsche 911 Carrera</p>
                    <p className="text-sm text-white/60">Sport · Automatic</p>
                  </div>
                  <p className="text-xl font-black text-orange">
                    ₹9,500
                    <span className="text-xs font-normal text-white/50">
                      /day
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -top-6 rotate-6 rounded-2xl bg-orange px-4 py-3 text-sm font-bold text-black shadow-xl animate-float [animation-delay:1s]">
              🔥 Trending
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- BRAND MARQUEE ---------------- */}
      <section className="pt-2 sm:pt-4">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.3em] text-soft">
          Trusted brands in our fleet
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
          <div className="flex w-max animate-marquee gap-14">
            {[...brands, ...brands].map((b, i) => (
              <span
                key={i}
                className="text-2xl font-black tracking-tight text-soft opacity-60"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section>
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-black tracking-tight">
            Why renters choose <span className="text-orange">Veloce</span>
          </h2>
          <p className="mt-3 text-soft">
            Everything you need for a seamless rental, and nothing you don&apos;t.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal
              key={f.title}
              delay={i * 70}
              direction={i % 3 === 0 ? "left" : i % 3 === 1 ? "up" : "right"}
            >
              <div className="card group h-full rounded-2xl p-7">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-soft">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED CARS ---------------- */}
      {cars.length > 0 && (
        <section>
          <Reveal className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tight">
                Featured rides
              </h2>
              <p className="mt-2 text-soft">Fresh from the garage, ready to go.</p>
            </div>
            <Link
              href="/vehicles"
              className="btn-ghost hidden px-5 py-2.5 text-sm sm:block"
            >
              View all →
            </Link>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((v, i) => (
              <Reveal key={v.id} delay={i * 90} direction="up">
                <Link href={`/vehicles/${v.id}`} className="card block overflow-hidden rounded-2xl">
                  <div className="relative h-52 overflow-hidden">
                    {v.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.imageUrl}
                        alt={v.model}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-orange px-3 py-1 text-xs font-bold text-white">
                      {v.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold">
                      {v.make} {v.model}
                    </h3>
                    <p className="text-sm text-soft capitalize">
                      {v.transmission} · {v.fuelType} · {v.seats} seats
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-black text-orange">
                        ₹{Number(v.dailyRate).toLocaleString()}
                        <span className="text-xs font-normal text-soft">
                          /day
                        </span>
                      </span>
                      <span className="btn-primary px-4 py-2 text-sm">Book →</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2.5rem] border border-app bg-soft/50 backdrop-blur-xl px-4 sm:px-10 py-16 sm:py-24">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-orange/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-orange/10 blur-3xl" />

        <Reveal className="relative mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange" />
            </span>
            Seamless Process
          </span>
          <h2 className="mt-4 text-3xl sm:text-5xl font-black tracking-tight text-app">
            Three steps to the{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange to-amber-500 bg-clip-text text-transparent">
              open road
            </span>
          </h2>
          <p className="mt-3.5 text-sm sm:text-base text-soft max-w-lg mx-auto">
            From discovering your dream car to key handover — streamlined, fully digital, and completely transparent.
          </p>
        </Reveal>

        {/* Steps Grid */}
        <div className="relative mx-auto mt-12 sm:mt-16 grid max-w-6xl gap-6 sm:gap-8 md:grid-cols-3">
          {/* Subtle connecting dashed line across cards on desktop */}
          <div className="pointer-events-none absolute top-1/2 left-10 right-10 -translate-y-12 hidden md:block border-t-2 border-dashed border-app/80 -z-0" />

          {steps.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 120}
              direction={i === 0 ? "left" : i === 1 ? "up" : "right"}
              className="relative z-10 h-full"
            >
              <div className="card group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-app bg-elev p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:border-orange hover:shadow-2xl hover:shadow-orange/15">
                {/* Ambient corner glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange/10 blur-2xl transition-all duration-500 group-hover:bg-orange/20 group-hover:scale-125" />

                <div>
                  {/* Top Bar: Icon + Step Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange to-orange-600 text-white shadow-lg shadow-orange/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      {s.icon}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-app bg-soft px-3 py-1 font-mono text-xs font-bold text-soft group-hover:border-orange/40 group-hover:text-orange transition-colors">
                      <span>STEP</span>
                      <span className="text-sm text-app font-black">{s.n}</span>
                    </div>
                  </div>

                  {/* Category Tag */}
                  <div className="mt-6">
                    <span className="inline-block rounded-md bg-orange/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange">
                      {s.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-2.5 text-xl font-black tracking-tight text-app transition-colors group-hover:text-orange">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-soft">
                    {s.desc}
                  </p>
                </div>

                {/* Micro Perks List */}
                <div className="mt-7 border-t border-app/60 pt-5 space-y-2.5">
                  {s.perks.map((p) => (
                    <div
                      key={p}
                      className="flex items-center gap-2.5 text-xs font-medium text-soft group-hover:text-app transition-colors"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-orange/15 text-orange font-bold text-[10px]">
                        ✓
                      </span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <Reveal direction="fade">
        <section className="animated-gradient relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] px-5 sm:px-8 py-16 sm:py-20 text-center text-white">
          <h2 className="mx-auto max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Your next adventure is one click away.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/70">
            Join thousands of happy renters and drive away today.
          </p>
          <Link
            href={dashHref}
            className="btn-primary mt-8 inline-block px-8 py-4 text-base"
          >
            Explore Available Cars
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
