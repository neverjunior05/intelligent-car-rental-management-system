"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";

type JobCategory = "all" | "operations" | "engineering" | "maintenance" | "concierge";

interface JobPosting {
  id: string;
  title: string;
  category: JobCategory;
  categoryLabel: string;
  location: string;
  type: string;
  compensation: string;
  description: string;
  requirements: string[];
}

const jobs: JobPosting[] = [
  {
    id: "ops-lead",
    title: "Fleet Operations Manager",
    category: "operations",
    categoryLabel: "Operations",
    location: "Downtown Flagship Hub",
    type: "Full-Time",
    compensation: "$85k – $110k + Bonus",
    description: "Oversee fleet turnaround logistics, digital handover protocols, and lead front-desk service agents.",
    requirements: ["3+ years in premium mobility/hospitality", "Track record of on-time turnaround SLAs", "Valid driver license"],
  },
  {
    id: "ev-diag",
    title: "Senior EV & Diagnostics Specialist",
    category: "maintenance",
    categoryLabel: "Maintenance",
    location: "Metro Workshop Center",
    type: "Full-Time",
    compensation: "$75k – $95k + Overtime",
    description: "Perform scheduled safety checkups, battery health telematics calibration, and mechanical inspections across hybrid & EV models.",
    requirements: ["Certified Automotive Technician (ASE / EV)", "Diagnostics experience with Tesla, Porsche or BMW", "Clean driving record"],
  },
  {
    id: "full-stack",
    title: "Staff Software Engineer (Fleet Telematics)",
    category: "engineering",
    categoryLabel: "Engineering",
    location: "Remote / Hybrid (NYC)",
    type: "Full-Time",
    compensation: "$140k – $175k + Equity",
    description: "Architect our real-time vehicle booking engine, telemetry ingest pipelines, and customer mobile experience using Next.js, Node & PostgreSQL.",
    requirements: ["5+ years modern TypeScript & web frameworks", "Experience with IoT / telematics or real-time systems", "Passionate about seamless UX"],
  },
  {
    id: "concierge-rep",
    title: "VIP Concierge & Client Specialist",
    category: "concierge",
    categoryLabel: "Customer Success",
    location: "Airport Hub & On-Demand",
    type: "Full-Time / Shifts",
    compensation: "$60k – $75k + Tips & Bonus",
    description: "Deliver high-touch handover experiences for executive renters, coordinate bespoke vehicle delivery, and manage 24/7 client inquiries.",
    requirements: ["Hospitality or luxury retail background", "Exceptional written and oral communication", "Passionate about fine cars"],
  },
  {
    id: "dispatch-agent",
    title: "Front-Desk Handover Coordinator",
    category: "operations",
    categoryLabel: "Operations",
    location: "Airport Terminal Hub",
    type: "Full-Time",
    compensation: "$55k – $68k",
    description: "Facilitate digital customer check-ins, verify digital KYC IDs, and perform pre-trip vehicle walk-around inspections.",
    requirements: ["Customer-first attitude", "Comfort with digital tablet applications", "Clean driving abstract"],
  },
  {
    id: "maint-tech",
    title: "Fleet Detailing & Prep Specialist",
    category: "maintenance",
    categoryLabel: "Maintenance",
    location: "Downtown Flagship Hub",
    type: "Full-Time",
    compensation: "$48k – $60k",
    description: "Perform pristine ceramic wash, cabin sterilization, and pre-rental vehicle readiness detailing.",
    requirements: ["High attention to detail", "Prior high-end automotive detailing experience", "Reliable and self-motivated"],
  },
];

const perks = [
  { icon: "🏎️", title: "Annual Driving Stipend", desc: "$3,000 yearly credit to drive any car in our fleet for personal getaways." },
  { icon: "🩺", title: "Comprehensive Health", desc: "100% premium coverage for medical, dental, and vision for you and dependents." },
  { icon: "📈", title: "Equity & Performance Bonus", desc: "Meaningful ownership in Veloce with bi-annual performance bonuses." },
  { icon: "🌴", title: "Flexible PTO & Recharge", desc: "Unlimited paid time off with mandatory 2-week minimum recharge vacations." },
  { icon: "📚", title: "Learning & Certification", desc: "$2,000 annual education budget for EV certifications, tech conferences, and courses." },
  { icon: "⚡", title: "Modern Tech & Gear", desc: "Top-of-the-line MacBook Pro, custom ergonomic setup, and company phone stipend." },
];

export default function CareersPage() {
  const [selectedCat, setSelectedCat] = useState<JobCategory>("all");
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
  const [applicantForm, setApplicantForm] = useState({ name: "", email: "", resumeUrl: "", note: "" });
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const filteredJobs = selectedCat === "all" ? jobs : jobs.filter((j) => j.category === selectedCat);

  function handleApplySubmit(e: React.FormEvent) {
    e.preventDefault();
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setApplyingJob(null);
      setApplicantForm({ name: "", email: "", resumeUrl: "", note: "" });
    }, 2500);
  }

  return (
    <div className="space-y-24 py-4 sm:py-8">
      {/* ---------------- HERO ---------------- */}
      <section className="relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2.5rem] border border-app bg-soft/50 px-5 sm:px-12 py-16 sm:py-24 text-center">
        <div className="pointer-events-none absolute -top-20 left-1/3 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-1/4 h-80 w-80 rounded-full bg-orange/15 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange" />
            </span>
            We&apos;re Hiring Across 4 Hubs
          </span>

          <h1 className="mt-5 text-3xl sm:text-6xl font-black tracking-tight text-app leading-[1.1]">
            Build the future of{" "}
            <span className="bg-gradient-to-r from-orange-400 via-orange to-amber-500 bg-clip-text text-transparent">
              fleet mobility
            </span>
            .
          </h1>

          <p className="mt-5 text-base sm:text-lg text-soft leading-relaxed max-w-2xl mx-auto">
            Join a passionate crew of automotive obsessives, software craftspeople, and hospitality
            leaders reshaping how the world drives premium automobiles.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <a href="#open-positions" className="btn-primary px-7 py-3 text-sm sm:text-base">
              View Open Positions ({jobs.length}) ↓
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- PERKS & BENEFITS ---------------- */}
      <section>
        <Reveal className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-orange">
            Life at Veloce
          </span>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-app">
            Perks engineered for high performance.
          </h2>
          <p className="mt-2 text-sm text-soft">
            We take world-class care of our team so our team can take world-class care of our drivers.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {perks.map((p, i) => (
            <Reveal key={p.title} delay={i * 80} direction="up">
              <div className="card group h-full rounded-3xl border border-app bg-elev p-7 transition-all duration-300 hover:-translate-y-2 hover:border-orange hover:shadow-xl hover:shadow-orange/15">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/10 text-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {p.icon}
                </div>
                <h3 className="mt-5 text-base font-bold text-app">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-soft">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- OPEN POSITIONS ---------------- */}
      <section id="open-positions" className="scroll-mt-24">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange">
              Opportunities
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-app">
              Open Positions
            </h2>
            <p className="mt-1 text-sm text-soft">
              Find your lane and help us elevate the rental experience.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Roles" },
              { id: "operations", label: "Operations" },
              { id: "maintenance", label: "Maintenance" },
              { id: "engineering", label: "Engineering" },
              { id: "concierge", label: "Customer Success" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id as JobCategory)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedCat === cat.id
                    ? "bg-orange text-white shadow-md shadow-orange/30"
                    : "border border-app bg-elev text-soft hover:bg-soft hover:text-app"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 space-y-4">
          {filteredJobs.map((job, i) => (
            <Reveal key={job.id} delay={i * 60} direction="up">
              <div className="card rounded-3xl border border-app bg-elev p-6 sm:p-7 transition-all duration-300 hover:border-orange/60 hover:shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-orange/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange">
                        {job.categoryLabel}
                      </span>
                      <span className="text-xs text-soft">·</span>
                      <span className="text-xs text-soft">{job.location}</span>
                      <span className="text-xs text-soft">·</span>
                      <span className="text-xs font-medium text-app">{job.type}</span>
                    </div>

                    <h3 className="mt-2 text-xl font-bold text-app">{job.title}</h3>
                    <p className="mt-1 text-xs text-soft max-w-2xl leading-relaxed">
                      {job.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.requirements.map((req) => (
                        <span
                          key={req}
                          className="inline-flex items-center gap-1 rounded-full border border-app bg-soft px-2.5 py-0.5 text-[11px] text-soft"
                        >
                          <span className="text-orange text-[10px]">✓</span> {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                    <span className="font-mono text-xs font-bold text-app">
                      {job.compensation}
                    </span>
                    <button
                      type="button"
                      onClick={() => setApplyingJob(job)}
                      className="btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer"
                    >
                      Apply Now →
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- APPLICATION MODAL ---------------- */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="card w-full max-w-lg rounded-3xl border border-app bg-elev p-6 sm:p-8 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setApplyingJob(null)}
              className="absolute right-5 top-5 text-soft hover:text-app text-lg cursor-pointer"
            >
              ✕
            </button>

            {appliedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-500">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-app">Application Received!</h3>
                <p className="text-xs text-soft max-w-sm mx-auto">
                  Thank you for applying to <span className="font-bold text-app">{applyingJob.title}</span>.
                  Our talent team will review your profile and reach out within 48 hours.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange">
                  Job Application
                </span>
                <h3 className="mt-1 text-xl font-bold text-app">{applyingJob.title}</h3>
                <p className="text-xs text-soft">
                  {applyingJob.location} · {jobTypeDescription(applyingJob.type)}
                </p>

                <form onSubmit={handleApplySubmit} className="mt-5 space-y-3.5">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-app">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Miller"
                      value={applicantForm.name}
                      onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })}
                      className="input w-full px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-app">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="jordan@example.com"
                      value={applicantForm.email}
                      onChange={(e) => setApplicantForm({ ...applicantForm, email: e.target.value })}
                      className="input w-full px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-app">
                      LinkedIn or Portfolio URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={applicantForm.resumeUrl}
                      onChange={(e) => setApplicantForm({ ...applicantForm, resumeUrl: e.target.value })}
                      className="input w-full px-3.5 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-app">
                      Quick Note on Why Veloce?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us a little about your passion for cars or high performance..."
                      value={applicantForm.note}
                      onChange={(e) => setApplicantForm({ ...applicantForm, note: e.target.value })}
                      className="input w-full px-3.5 py-2 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-2.5 text-sm font-bold shadow-md cursor-pointer mt-2"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- BOTTOM BANNER ---------------- */}
      <Reveal direction="fade">
        <section className="animated-gradient relative -mx-3 sm:-mx-4 overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] px-6 sm:px-12 py-14 sm:py-18 text-center text-white">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Don&apos;t see an exact match?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto">
            We are always eager to meet driven mechanics, engineers, and hospitality specialists.
          </p>
          <div className="mt-7 flex justify-center gap-4">
            <Link href="/contact" className="btn-primary px-8 py-3.5 text-sm sm:text-base">
              Send an Open Inquiry →
            </Link>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

function jobTypeDescription(type: string) {
  return `${type} · Comprehensive Health & Driving Credit Included`;
}
