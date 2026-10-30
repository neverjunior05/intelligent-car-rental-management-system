"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      await refresh();
      router.push("/vehicles");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="-my-5 sm:-my-8 flex min-h-[calc(100dvh-4.25rem)] items-center justify-center px-4 py-4">
      <div className="card w-full max-w-xl rounded-2xl border border-app bg-elev p-6 sm:p-8 shadow-xl animate-fade-up">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Logo size={38} />
          <h1 className="mt-3.5 text-2xl font-black tracking-tight text-app">
            Create Account
          </h1>
          <p className="mt-1 text-xs text-soft">
            Fill in your details below to register your Veloce rental profile.
          </p>
        </div>

        {/* Spacious 2-Column Form */}
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-app">
                <span>
                  Full Name <span className="text-orange">*</span>
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Johnson"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="input w-full px-3.5 py-2.5 text-sm font-medium transition focus:ring-2 focus:ring-orange/20"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-app">
                <span>
                  Email Address <span className="text-orange">*</span>
                </span>
              </label>
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="input w-full px-3.5 py-2.5 text-sm font-medium transition focus:ring-2 focus:ring-orange/20"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-app">
                  Password <span className="text-orange">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-semibold text-soft hover:text-orange cursor-pointer transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="input w-full px-3.5 py-2.5 text-sm transition focus:ring-2 focus:ring-orange/20"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-app">
                <span>Phone Number</span>
                <span className="text-[10px] font-normal text-soft lowercase">optional</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 234-5678"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="input w-full px-3.5 py-2.5 text-sm transition focus:ring-2 focus:ring-orange/20"
              />
            </div>

            {/* Driver License Number */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-app">
                <span>Driver License #</span>
                <span className="text-[10px] font-normal text-soft lowercase">optional</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DL-8923401"
                value={form.licenseNumber}
                onChange={(e) => set("licenseNumber", e.target.value)}
                className="input w-full px-3.5 py-2.5 text-sm transition focus:ring-2 focus:ring-orange/20"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-app">
                <span>City & Address</span>
                <span className="text-[10px] font-normal text-soft lowercase">optional</span>
              </label>
              <input
                type="text"
                placeholder="e.g. New York, NY"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="input w-full px-3.5 py-2.5 text-sm transition focus:ring-2 focus:ring-orange/20"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500 font-medium animate-fade-in">
              {error}
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-bold shadow-md disabled:opacity-50 mt-2 transition-transform active:scale-[0.99]"
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-5 pt-4 border-t border-app/60 text-center text-xs text-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-orange hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
