"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className="relative flex h-9 w-16 items-center rounded-full border border-app bg-soft px-1 transition-colors"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-orange text-sm text-white shadow transition-transform duration-500 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
      <span className="pointer-events-none absolute left-2 text-xs opacity-40">
        ☀️
      </span>
      <span className="pointer-events-none absolute right-2 text-xs opacity-40">
        🌙
      </span>
    </button>
  );
}
