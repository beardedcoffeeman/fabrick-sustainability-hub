/**
 * Per-section decorative visual for the "What we have built" homepage cards.
 * SVG illustrations sit in a coloured top panel above each card's content.
 */

export type BuiltKind =
  | "dashboard"
  | "materials"
  | "regulations"
  | "knowledge"
  | "research";

const PALETTE: Record<BuiltKind, { bg: string; primary: string; accent: string }> = {
  dashboard:   { bg: "#00A389", primary: "#FFFFFF", accent: "#FF3D7F" }, // teal-dark + white + pink accent bar
  materials:   { bg: "#FF3D7F", primary: "#FFE5EE", accent: "#2D2D3F" }, // pink + soft + navy accent
  regulations: { bg: "#2D2D3F", primary: "#FFFFFF", accent: "#00BFA5" }, // navy + white + teal accent
  knowledge:   { bg: "#1A1A2E", primary: "#F0EBE3", accent: "#00BFA5" }, // charcoal + cream + teal
  research:    { bg: "#00BFA5", primary: "#FFFFFF", accent: "#FF3D7F" }, // teal + white + pink peak
};

export function BuiltCardVisual({ kind }: { kind: BuiltKind }) {
  const c = PALETTE[kind];

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: c.bg, height: 120 }}
    >
      <svg
        viewBox="0 0 320 120"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {kind === "dashboard" && (
          <g>
            {/* Faint grid */}
            <line x1="0" y1="100" x2="320" y2="100" stroke={c.primary} strokeOpacity="0.18" strokeWidth="1" />
            <line x1="0" y1="75" x2="320" y2="75" stroke={c.primary} strokeOpacity="0.12" strokeWidth="1" />
            <line x1="0" y1="50" x2="320" y2="50" stroke={c.primary} strokeOpacity="0.08" strokeWidth="1" />
            {/* 6 bars, one accent */}
            {[
              { x: 30, h: 42 },
              { x: 80, h: 60 },
              { x: 130, h: 30 },
              { x: 180, h: 78 },
              { x: 230, h: 50 },
              { x: 280, h: 38 },
            ].map((b, i) => (
              <rect
                key={i}
                x={b.x}
                y={100 - b.h}
                width="22"
                height={b.h}
                rx="2"
                fill={i === 3 ? c.accent : c.primary}
                fillOpacity={i === 3 ? 1 : 0.85}
              />
            ))}
          </g>
        )}

        {kind === "materials" && (
          <g>
            {/* Wall cross-section: 4 stacked layers */}
            <rect x="40" y="20" width="240" height="18" rx="2" fill={c.primary} fillOpacity="0.92" />
            <rect x="40" y="42" width="240" height="22" rx="2" fill={c.primary} fillOpacity="0.78" />
            <rect x="40" y="68" width="240" height="14" rx="2" fill={c.primary} fillOpacity="0.62" />
            <rect x="40" y="86" width="240" height="22" rx="2" fill={c.accent} fillOpacity="0.85" />
            {/* Annotation tick */}
            <line x1="290" y1="20" x2="290" y2="108" stroke={c.primary} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 3" />
            <line x1="285" y1="20" x2="295" y2="20" stroke={c.primary} strokeOpacity="0.7" strokeWidth="1" />
            <line x1="285" y1="108" x2="295" y2="108" stroke={c.primary} strokeOpacity="0.7" strokeWidth="1" />
          </g>
        )}

        {kind === "regulations" && (
          <g>
            {/* Timeline line */}
            <line x1="20" y1="60" x2="300" y2="60" stroke={c.primary} strokeOpacity="0.5" strokeWidth="2" />
            {/* Milestone dots */}
            {[
              { x: 50, label: "2025", filled: true },
              { x: 130, label: "2027", filled: true },
              { x: 210, label: "2030", filled: false },
              { x: 290, label: "2035", filled: false },
            ].map((m, i) => (
              <g key={i}>
                <circle
                  cx={m.x}
                  cy="60"
                  r={m.filled ? 7 : 5}
                  fill={m.filled ? c.accent : c.bg}
                  stroke={c.primary}
                  strokeWidth="2"
                  strokeOpacity={m.filled ? 0 : 0.85}
                />
                <text
                  x={m.x}
                  y="92"
                  fill={c.primary}
                  fontSize="11"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                  fontWeight="600"
                  textAnchor="middle"
                  opacity="0.85"
                >
                  {m.label}
                </text>
              </g>
            ))}
          </g>
        )}

        {kind === "knowledge" && (
          <g>
            {/* Open book: spine + two pages */}
            <line x1="160" y1="20" x2="160" y2="100" stroke={c.primary} strokeOpacity="0.4" strokeWidth="1" />
            {/* Left page */}
            <rect x="40" y="22" width="115" height="78" rx="3" fill={c.primary} fillOpacity="0.18" />
            {/* Right page */}
            <rect x="165" y="22" width="115" height="78" rx="3" fill={c.primary} fillOpacity="0.18" />
            {/* Text lines on left page */}
            {[34, 46, 58, 70, 82].map((y, i) => (
              <line
                key={`l${i}`}
                x1="50"
                y1={y}
                x2={i === 0 ? 130 : i === 4 ? 100 : 145}
                y2={y}
                stroke={c.primary}
                strokeOpacity={i === 0 ? 0.95 : 0.6}
                strokeWidth={i === 0 ? 2 : 1.5}
              />
            ))}
            {/* Text lines on right page */}
            {[34, 46, 58, 70, 82].map((y, i) => (
              <line
                key={`r${i}`}
                x1="175"
                y1={y}
                x2={i === 0 ? 255 : i === 4 ? 225 : 270}
                y2={y}
                stroke={i === 0 ? c.accent : c.primary}
                strokeOpacity={i === 0 ? 1 : 0.6}
                strokeWidth={i === 0 ? 2 : 1.5}
              />
            ))}
          </g>
        )}

        {kind === "research" && (
          <g>
            {/* Axis */}
            <line x1="20" y1="100" x2="300" y2="100" stroke={c.primary} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 3" />
            {/* Line chart with a peak */}
            <path
              d="M 20 80 Q 60 75 90 70 T 150 60 Q 175 30 200 28 T 260 60 Q 280 70 300 65"
              fill="none"
              stroke={c.primary}
              strokeWidth="2.5"
              strokeOpacity="0.9"
              strokeLinecap="round"
            />
            {/* Peak highlight */}
            <circle cx="200" cy="28" r="6" fill={c.accent} />
            <circle cx="200" cy="28" r="11" fill={c.accent} fillOpacity="0.25" />
            {/* A few baseline dots */}
            <circle cx="60" cy="75" r="2.5" fill={c.primary} fillOpacity="0.7" />
            <circle cx="260" cy="60" r="2.5" fill={c.primary} fillOpacity="0.7" />
          </g>
        )}
      </svg>
    </div>
  );
}
