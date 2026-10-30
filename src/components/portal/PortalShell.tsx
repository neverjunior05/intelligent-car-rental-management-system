"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { useRentalStore } from "@/lib/useRentalStore";
import { ToastProvider, useToast } from "@/components/portal/Toast";

interface PortalShellProps {
  children: ReactNode;
  activeRole: "customer" | "staff" | "maintenance" | "admin";
  pageTitle: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function PortalShell(props: PortalShellProps) {
  return (
    <ToastProvider>
      <PortalShellInner {...props} />
    </ToastProvider>
  );
}

function PortalShellInner({
  children,
  activeRole,
  pageTitle,
  breadcrumb = [],
}: PortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { notifications, bookings, maintenanceJobs, actions } = useRentalStore();
  const { info } = useToast();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Role-based route guard: ensure user only accesses their assigned portal
  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = "/login";
      } else if (user.role !== activeRole) {
        const target =
          user.role === "admin"
            ? "/admin"
            : user.role === "staff"
              ? "/staff"
              : user.role === "maintenance"
                ? "/maintenance"
                : "/customer";
        router.replace(target);
      }
    }
  }, [user, loading, activeRole, router]);

  // Role navigations
  const currentUserId = user?.id || user?.userId;
  const currentUserEmail = user?.email?.toLowerCase();

  const roleNavItems: Record<string, { label: string; href: string; icon: string; badge?: number }[]> = {
    customer: [
      { label: "Dashboard", href: "/customer", icon: "📊" },
      { label: "Browse Fleet", href: "/customer/fleet", icon: "🚗" },
      {
        label: "My Bookings",
        href: "/customer/bookings",
        icon: "📅",
        badge: bookings.filter((b) => {
          const isMine =
            (currentUserId && b.customerId === currentUserId) ||
            (currentUserEmail && b.customerEmail?.toLowerCase() === currentUserEmail);
          return isMine && (b.status === "pending" || b.status === "confirmed");
        }).length,
      },
      {
        label: "Active Rental",
        href: "/customer/active-rental",
        icon: "🔑",
        badge: bookings.filter((b) => {
          const isMine =
            (currentUserId && b.customerId === currentUserId) ||
            (currentUserEmail && b.customerEmail?.toLowerCase() === currentUserEmail);
          return isMine && b.status === "active";
        }).length,
      },
      { label: "Payments & Invoices", href: "/customer/payments", icon: "💳" },
      { label: "KYC Documents", href: "/customer/documents", icon: "🪪" },
      { label: "Profile", href: "/customer/profile", icon: "👤" },
      { label: "Support & Roadside", href: "/customer/support", icon: "🛟" },
    ],
    staff: [
      { label: "Dashboard", href: "/staff", icon: "📊" },
      { label: "Bookings Queue", href: "/staff/bookings", icon: "📅", badge: bookings.filter((b) => b.status === "pending").length },
      { label: "Customers", href: "/staff/customers", icon: "👥" },
      { label: "Fleet Inventory", href: "/staff/vehicles", icon: "🚙" },
      { label: "Digital Handover", href: "/staff/handover", icon: "📋" },
      { label: "Vehicle Returns", href: "/staff/returns", icon: "🔄" },
      { label: "Damage Management", href: "/staff/damage", icon: "⚠️" },
      { label: "Payments", href: "/staff/payments", icon: "💰" },
      { label: "Staff Profile", href: "/staff/profile", icon: "👤" },
    ],
    maintenance: [
      { label: "Dashboard", href: "/maintenance", icon: "📊" },
      { label: "Service Queue", href: "/maintenance/queue", icon: "⏳", badge: maintenanceJobs.filter((j) => j.status === "pending").length },
      { label: "Work Orders", href: "/maintenance/jobs", icon: "🔧", badge: maintenanceJobs.filter((j) => j.status === "in_progress").length },
      { label: "Vehicle History", href: "/maintenance/history", icon: "📜" },
      { label: "Diagnostics & Records", href: "/maintenance/records", icon: "🔬" },
      { label: "Documents", href: "/maintenance/documents", icon: "📁" },
      { label: "Profile", href: "/maintenance/profile", icon: "👤" },
    ],
    admin: [
      { label: "Executive Dashboard", href: "/admin", icon: "📈" },
      { label: "Live Operations & GPS", href: "/admin/live", icon: "🛰️" },
      { label: "User Management", href: "/admin/users", icon: "🛡️" },
      { label: "Customer Profiles", href: "/admin/customers", icon: "👥" },
      { label: "Staff & Crews", href: "/admin/staff", icon: "👔" },
      { label: "Fleet Inventory", href: "/admin/vehicles", icon: "🚗" },
      { label: "Categories & Rates", href: "/admin/categories", icon: "🏷️" },
      { label: "Bookings Master", href: "/admin/bookings", icon: "📅" },
      { label: "Pricing Engine", href: "/admin/pricing", icon: "⚙️" },
      { label: "Location Hubs", href: "/admin/locations", icon: "📍" },
      { label: "Maintenance Control", href: "/admin/maintenance", icon: "🔧" },
      { label: "Reports & Analytics", href: "/admin/reports", icon: "📊" },
      { label: "Audit & Activity Log", href: "/admin/activity", icon: "📜" },
      { label: "System Settings", href: "/admin/settings", icon: "🎛️" },
    ],
  };

  const navItems = roleNavItems[activeRole] || [];
  const roleNotifications = notifications.filter((n) => {
    const matchesRole =
      n.targetRole === activeRole || (!n.targetRole && activeRole === "admin") || n.targetRole === "all";
    const safeAction =
      !n.actionUrl ||
      n.actionUrl.startsWith("/" + activeRole) ||
      n.actionUrl === "/vehicles" ||
      n.actionUrl === "/customer/fleet";
    return matchesRole && safeAction;
  });
  const unreadNotifs = roleNotifications.filter((n) => !n.read).length;

  const roleColors: Record<string, { badge: string; text: string; label: string }> = {
    customer: { badge: "bg-orange/15 text-orange border-orange/30", text: "text-orange", label: "Customer Portal" },
    staff: { badge: "bg-blue-500/15 text-blue-500 border-blue-500/30", text: "text-blue-500", label: "Staff Operations" },
    maintenance: { badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30", text: "text-emerald-500", label: "Fleet Maintenance" },
    admin: { badge: "bg-purple-500/15 text-purple-400 border-purple-500/30", text: "text-purple-400", label: "System Administrator" },
  };

  const roleMeta = roleColors[activeRole];

  if (loading || !user || user.role !== activeRole) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange border-t-transparent" />
          <p className="text-xs text-soft font-medium">Verifying portal access…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex flex-col md:flex-row antialiased selection:bg-orange selection:text-white">
      {/* -------------------------------------------------------------------- */}
      {/* LEFT SIDEBAR (Desktop)                                               */}
      {/* -------------------------------------------------------------------- */}
      <aside
        className={`hidden md:flex flex-col border-r border-app bg-elev transition-all duration-300 sticky top-0 h-screen z-40 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-app">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <Logo size={28} />
            {!collapsed && (
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-orange via-orange-400 to-amber-500 bg-clip-text text-transparent">
                VELOCE
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-soft hover:bg-soft hover:text-app transition cursor-pointer"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Current Role Indicator */}
        <div className="px-3 py-3 border-b border-app/60">
          <div
            className={`flex items-center gap-2 rounded-xl border p-2 text-xs ${roleMeta.badge}`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
            </span>
            {!collapsed && (
              <span className="font-bold truncate uppercase tracking-wider text-[11px]">
                {roleMeta.label}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-orange text-white shadow-md shadow-orange/20"
                    : "text-soft hover:bg-soft hover:text-app"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-orange/20 text-orange"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Profile Card */}
        <div className="p-3 border-t border-app">
          <div className="flex items-center justify-between rounded-2xl bg-soft/60 p-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange/15 font-black text-orange text-xs">
                {user ? user.name.charAt(0) : "U"}
              </div>
              {!collapsed && (
                <div className="truncate text-xs">
                  <div className="font-bold text-app truncate">{user?.name || "Veloce User"}</div>
                  <div className="text-[10px] text-soft capitalize">{activeRole}</div>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={async () => {
                  await logout();
                }}
                className="rounded-lg p-1.5 text-soft hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                title="Logout"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* -------------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA                                                    */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 h-16 border-b border-app bg-elev/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Mobile hamburger + Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden rounded-xl p-2 text-soft hover:bg-soft cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              {breadcrumb.length > 0 ? (
                <div className="flex items-center gap-1.5 text-[11px] text-soft">
                  <Link href="/" className="hover:text-app">Home</Link>
                  <span>/</span>
                  <span className="capitalize">{activeRole}</span>
                  {breadcrumb.map((b, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span>/</span>
                      {b.href ? (
                        <Link href={b.href} className="hover:text-app">{b.label}</Link>
                      ) : (
                        <span className="font-semibold text-app">{b.label}</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : null}
              <h1 className="text-base sm:text-lg font-black tracking-tight text-app">{pageTitle}</h1>
            </div>
          </div>

          {/* Right: Quick Search + Notifications + Theme Toggle + User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search (hidden on small mobile) */}
            <div className="relative hidden lg:block w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-soft text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search fleet, bookings, KYC…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full py-1.5 pl-8 pr-3 text-xs"
              />
            </div>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setNotifDrawerOpen(true)}
              className="relative rounded-xl p-2 text-soft hover:bg-soft hover:text-app transition cursor-pointer"
              title="Notifications"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange text-[9px] font-black text-white ring-2 ring-elev">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <ThemeToggle />

            {/* View Landing Page link */}
            <Link
              href="/"
              className="hidden sm:inline-flex rounded-xl border border-app bg-soft/50 px-3 py-1.5 text-xs font-semibold text-soft hover:text-app hover:bg-soft transition"
            >
              Public Site ↗
            </Link>
          </div>
        </header>



        {/* MAIN PAGE BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* MOBILE DRAWER NAVIGATION                                             */}
      {/* -------------------------------------------------------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-elev p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-app">
              <Logo size={28} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-1.5 text-soft hover:bg-soft cursor-pointer"
              >
                ✕
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold ${
                      isActive ? "bg-orange text-white" : "text-soft hover:bg-soft"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="rounded-full bg-orange/20 px-2 py-0.5 text-[10px] font-bold text-orange">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-app">
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="btn-ghost w-full py-2 text-xs font-bold text-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* NOTIFICATIONS DRAWER                                                 */}
      {/* -------------------------------------------------------------------- */}
      {notifDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNotifDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-elev border-l border-app shadow-2xl flex flex-col animate-fade-in">
              <div className="flex items-center justify-between p-5 border-b border-app">
                <div>
                  <h3 className="font-bold text-app text-sm">Notifications</h3>
                  <p className="text-xs text-soft">Real-time alerts & lifecycle updates</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => actions.markAllNotificationsRead()}
                    className="text-[11px] font-semibold text-orange hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={() => setNotifDrawerOpen(false)}
                    className="rounded-xl p-1 text-soft hover:bg-soft cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {roleNotifications.length === 0 ? (
                  <p className="text-center text-xs text-soft py-10">No notifications yet.</p>
                ) : (
                  roleNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-2xl border p-3 text-xs transition ${
                        n.read
                          ? "border-app bg-soft/40 opacity-70"
                          : "border-orange/30 bg-orange/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-app">{n.title}</span>
                        <span className="text-[10px] text-soft">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-soft leading-relaxed">{n.message}</p>
                      {n.actionUrl && (
                        <Link
                          href={n.actionUrl}
                          onClick={() => setNotifDrawerOpen(false)}
                          className="mt-2 inline-block font-semibold text-orange hover:underline text-[11px]"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
