"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const roleLinks: Record<string, { href: string; label: string }[]> = {
  customer: [
    { href: "/customer", label: "Dashboard" },
    { href: "/vehicles", label: "Fleet" },
    { href: "/customer/bookings", label: "My Bookings" },
    { href: "/customer/active-rental", label: "Active Rental" },
  ],
  staff: [
    { href: "/staff", label: "Dashboard" },
    { href: "/staff/bookings", label: "Bookings Queue" },
    { href: "/staff/vehicles", label: "Fleet Inventory" },
    { href: "/staff/handover", label: "Handover" },
  ],
  admin: [
    { href: "/admin", label: "Executive" },
    { href: "/admin/live", label: "Live Fleet" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/reports", label: "Analytics" },
  ],
  maintenance: [
    { href: "/maintenance", label: "Dashboard" },
    { href: "/maintenance/jobs", label: "Work Orders" },
    { href: "/maintenance/queue", label: "Service Queue" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = user ? (roleLinks[user.role] ?? []) : [];

  return (
    <nav
      suppressHydrationWarning
      className={`sticky top-0 z-50 backdrop-blur-xl bg-nav transition-all duration-300 ${
        scrolled ? "border-b border-app py-2 shadow-sm" : "py-3.5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <Link href="/" className="transition-transform hover:scale-[1.03]">
          <Logo />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline text-sm font-medium text-soft transition-colors hover:text-app"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-xs text-soft">
                {user.name.split(" ")[0]} ·{" "}
                <span className="font-semibold capitalize text-orange">
                  {user.role}
                </span>
              </span>
              <button
                onClick={async () => {
                  await logout();
                }}
                className="btn-ghost px-4 py-1.5 text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Link href="/login" className="btn-ghost px-4 py-1.5 text-sm">
                Login
              </Link>
              <Link href="/register" className="btn-primary px-4 py-1.5 text-sm">
                Get Started
              </Link>
            </div>
          )}
          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="btn-ghost flex h-9 w-9 items-center justify-center md:hidden"
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1">
              <span
                className={`h-0.5 w-4 bg-current transition-transform ${open ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`h-0.5 w-4 bg-current transition-opacity ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`h-0.5 w-4 bg-current transition-transform ${open ? "-translate-y-1.5 -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-soft hover:bg-soft hover:text-app"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            {user ? (
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout();
                }}
                className="btn-ghost flex-1 py-2 text-sm"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-ghost flex-1 py-2 text-center text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary flex-1 py-2 text-center text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
