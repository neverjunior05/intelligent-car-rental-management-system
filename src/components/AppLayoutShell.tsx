"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AppLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // If the user is on a portal route, we do NOT wrap with the public landing page Navbar and Footer
  // because the portal has its own authenticated application shell (Left Sidebar + Top Bar).
  const isPortalRoute =
    pathname?.startsWith("/customer") ||
    pathname?.startsWith("/staff") ||
    pathname?.startsWith("/maintenance") ||
    pathname?.startsWith("/admin");

  if (isPortalRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
