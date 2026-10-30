"use client";

export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2 select-none" suppressHydrationWarning>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Veloce logo"
        suppressHydrationWarning
      >
        <defs>
          <linearGradient id="lgo" x1="0" y1="0" x2="48" y2="48">
            <stop stopColor="#ff8c3a" />
            <stop offset="1" stopColor="#ff6b00" />
          </linearGradient>
        </defs>
        {/* rounded badge */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="13"
          fill="url(#lgo)"
          suppressHydrationWarning
        />
        {/* speedy car silhouette + motion lines */}
        <path
          d="M11 30.5c0-1 .8-1.8 1.8-1.8h1.1l2.6-4.4c.5-.9 1.5-1.5 2.6-1.5h8.6c.9 0 1.8.4 2.4 1.1l3.1 3.6 3 .8c1 .3 1.6 1.1 1.6 2.1v1.3c0 .8-.6 1.4-1.4 1.4h-1.2"
          className="logo-white-stroke"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          suppressHydrationWarning
        />
        <circle
          cx="17.5"
          cy="31.5"
          r="2.7"
          className="logo-wheel-fill logo-white-stroke"
          strokeWidth="1.6"
          suppressHydrationWarning
        />
        <circle
          cx="31.5"
          cy="31.5"
          r="2.7"
          className="logo-wheel-fill logo-white-stroke"
          strokeWidth="1.6"
          suppressHydrationWarning
        />
        <path
          d="M6 20h9M4 24h6"
          className="logo-white-stroke"
          strokeWidth="2.2"
          strokeLinecap="round"
          suppressHydrationWarning
        />
      </svg>
      <span className="text-lg font-extrabold tracking-tight">
        Veloce<span className="text-orange">.</span>
      </span>
    </span>
  );
}
