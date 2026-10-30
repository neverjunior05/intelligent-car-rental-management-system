"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

export default function Footer() {
  const pathname = usePathname();

  // Only show footer on the landing page
  if (pathname !== "/") {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-app bg-soft">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-soft">
            Premium cars, effortless booking. Drive something extraordinary
            today.
          </p>
        </div>
        <FooterCol
          title="Explore"
          links={[
            { href: "/vehicles", label: "Browse Fleet" },
            { href: "/register", label: "Create Account" },
            { href: "/login", label: "Sign In" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { href: "/about", label: "About Us" },
            { href: "/careers", label: "Careers" },
            { href: "/contact", label: "Contact" },
          ]}
        />
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-app">
            24/7 Support & Dispatch
          </h4>
          <div className="space-y-3 text-sm text-soft">
            <div className="flex items-start gap-2.5">
              <span className="text-orange text-base mt-0.5">📞</span>
              <div>
                <div className="font-bold text-app">+1 (800) 555-VELOCE</div>
                <div className="text-xs text-soft">24/7 Roadside & Helpline</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-orange text-base mt-0.5">📍</span>
              <div>
                <div className="font-bold text-app">Downtown & Airport Hubs</div>
                <div className="text-xs text-soft">Express Vehicle Collection</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-500 text-base mt-0.5">🛡️</span>
              <div>
                <div className="font-bold text-app">Fully Insured Fleet</div>
                <div className="text-xs text-soft">Zero-Liability Damage Cover</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-app/60 flex items-center gap-2.5">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-app bg-card text-soft hover:border-orange hover:text-orange hover:bg-orange/10 transition shadow-sm"
              title="X / Twitter"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-app bg-card text-soft hover:border-orange hover:text-orange hover:bg-orange/10 transition shadow-sm"
              title="Instagram"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-app bg-card text-soft hover:border-orange hover:text-orange hover:bg-orange/10 transition shadow-sm"
              title="LinkedIn"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-app py-5 text-center text-xs text-soft">
        © {new Date().getFullYear()} Veloce Car Rental. Crafted with care.
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide">{title}</h4>
      <ul className="space-y-2 text-sm text-soft">
        {links.map((l, i) => (
          <li key={i}>
            <Link href={l.href} className="link-underline hover:text-app">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
