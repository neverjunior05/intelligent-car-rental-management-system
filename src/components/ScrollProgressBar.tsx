"use client";

import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowTopBtn(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Top progress indicator bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none bg-transparent"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,107,0,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-orange text-white shadow-xl shadow-orange/30 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none ${
          showTopBtn
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </>
  );
}
