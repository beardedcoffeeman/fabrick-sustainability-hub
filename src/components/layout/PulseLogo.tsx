// ---------------------------------------------------------------------------
// The Pulse brand mark: an EKG/signal line (the pulse, the signal before the
// noise) beside the wordmark. Pure inline SVG + brand fonts, so it is crisp
// at any size and needs no image assets. Used in the Navbar; the favicon
// (src/app/icon.svg) is the same mark on a navy tile.
// ---------------------------------------------------------------------------

export function PulseMark({ className = "h-6 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 34 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1 13.5h6.5l3-8 5 15 4-18 3 11h6"
        stroke="#00BFA5"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="31.5" cy="13.5" r="2.5" fill="#FF3D7F" />
    </svg>
  );
}

export function PulseLogo({
  strapline = true,
  light = true,
}: {
  strapline?: boolean;
  light?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <PulseMark className="h-6 w-9 shrink-0" />
      <span className="flex flex-col justify-center leading-none">
        <span
          className={`font-[family-name:var(--font-playfair)] text-[24px] font-bold tracking-tight ${
            light ? "text-white" : "text-navy"
          }`}
        >
          Pulse
        </span>
        {strapline && (
          <span
            className={`hidden sm:block mt-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
              light ? "text-teal" : "text-teal-dark"
            }`}
          >
            The signal before the noise
          </span>
        )}
      </span>
    </span>
  );
}
