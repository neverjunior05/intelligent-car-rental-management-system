import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Veloce — Premium Car Rental",
  description:
    "Rent premium cars in minutes. A fast, modern rental experience with an unbeatable fleet.",
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('theme');
    if(!t){ t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light'; }
    if(t === 'dark'){ document.documentElement.classList.add('dark'); }
  } catch(e){}
})();
`;

import AppLayoutShell from "@/components/AppLayoutShell";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <AppLayoutShell>{children}</AppLayoutShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
