"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, SessionUser } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Logo from "@/components/Logo";

type RoleType = "customer" | "staff" | "maintenance" | "admin";

interface RoleOption {
  id: RoleType;
  label: string;
  description: string;
  icon: string;
  placeholder: string;
}

const ROLES: RoleOption[] = [
  {
    id: "customer",
    label: "Customer",
    description: "Renters & Personal bookings",
    icon: "👤",
    placeholder: "name@example.com",
  },
  {
    id: "staff",
    label: "Staff",
    description: "Front desk & operations",
    icon: "📋",
    placeholder: "staff@example.com",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Workshop & diagnostics",
    icon: "🔧",
    placeholder: "maint@example.com",
  },
  {
    id: "admin",
    label: "Admin",
    description: "System & fleet administration",
    icon: "🛡️",
    placeholder: "admin@example.com",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleType>("customer");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentRole = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ user: SessionUser & { role: string } }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      await refresh();
      const userRole = data.user.role;

      // Navigate authenticated user to their role-appropriate portal
      router.push(
        userRole === "admin"
          ? "/admin"
          : userRole === "staff"
            ? "/staff"
            : userRole === "maintenance"
              ? "/maintenance"
              : "/customer",
      );
    } catch (err) {
      setError((err as Error).message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="-my-5 sm:-my-8 flex min-h-[calc(100dvh-4.25rem)] items-center justify-center px-3 py-2">
      <div className="card w-full max-w-[420px] rounded-2xl border border-app bg-elev p-5 sm:p-7 shadow-xl animate-fade-up">
        <div className="flex flex-col items-center text-center">
          <Logo size={36} />
          <h1 className="mt-3 text-xl sm:text-2xl font-black tracking-tight text-app">
            Sign In
          </h1>
          <p className="mt-1 text-xs text-soft">
            Select your account type and enter your credentials.
          </p>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3.5">
          {/* Role Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-soft">
              User Type
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex w-full items-center justify-between rounded-xl border border-app bg-soft/50 px-3.5 py-2 text-left text-sm font-medium transition hover:border-app hover:bg-soft cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange/30"
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="flex items-center gap-2">
                <span className="text-sm">{currentRole.icon}</span>
                <span className="font-bold text-app text-sm">{currentRole.label}</span>
                <span className="text-[11px] text-soft hidden sm:inline">
                  — {currentRole.description}
                </span>
              </span>
              <svg
                className={`h-4 w-4 text-soft transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-orange" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-app bg-elev p-1 shadow-2xl backdrop-blur-xl animate-fade-in">
                <div className="space-y-0.5">
                  {ROLES.map((role) => {
                    const isSelected = role.id === selectedRole;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.id);
                          setDropdownOpen(false);
                          setError("");
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-orange/15 text-orange font-bold"
                            : "text-app hover:bg-soft"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{role.icon}</span>
                          <div>
                            <div className="font-bold">{role.label}</div>
                            <div className="text-[10px] text-soft font-normal">
                              {role.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <svg
                            className="h-3.5 w-3.5 text-orange"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-soft">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={currentRole.placeholder}
              className="input w-full px-3.5 py-2 text-sm font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-soft">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-medium text-soft hover:text-app cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="input w-full px-3.5 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-500 font-medium animate-fade-in">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm font-bold shadow-md disabled:opacity-50 mt-1"
          >
            {loading ? "Signing in…" : `Sign In as ${currentRole.label}`}
          </button>
        </form>

        <div className="mt-4 pt-3.5 border-t border-app/60 text-center text-xs text-soft">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-orange hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
