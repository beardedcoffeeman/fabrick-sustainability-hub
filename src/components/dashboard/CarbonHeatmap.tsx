"use client";

import { useRef, useState, useMemo } from "react";
import { Download } from "lucide-react";

interface Cell {
  dayOfWeek: number; // 0 = Sun
  hourOfDay: number; // 0–23
  avg: number;
  count: number;
  min: number;
  max: number;
}

interface CarbonHeatmapProps {
  cells: Cell[];
  overallAvg: number;
  lookbackDays?: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Order rows Mon → Sun for typical UK reading. We reorder the visual but keep
// the underlying dayOfWeek index unchanged.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

// Colour scale: low carbon = teal-green, high carbon = pink/red.
// Output is hex; we interpolate through a small palette tuned to look at home
// against the cream/charcoal Fabrick palette.
const COLOUR_STOPS = [
  { stop: 0, hex: [16, 185, 129] }, // teal-green (low)
  { stop: 0.4, hex: [217, 217, 119] }, // cream-yellow
  { stop: 0.7, hex: [243, 149, 92] }, // amber
  { stop: 1, hex: [231, 70, 122] }, // pink (high)
];

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function colourFor(value: number, min: number, max: number): string {
  if (max === min) return `rgb(${COLOUR_STOPS[0].hex.join(",")})`;
  const t = Math.min(Math.max((value - min) / (max - min), 0), 1);
  let lo = COLOUR_STOPS[0];
  let hi = COLOUR_STOPS[COLOUR_STOPS.length - 1];
  for (let i = 0; i < COLOUR_STOPS.length - 1; i++) {
    if (t >= COLOUR_STOPS[i].stop && t <= COLOUR_STOPS[i + 1].stop) {
      lo = COLOUR_STOPS[i];
      hi = COLOUR_STOPS[i + 1];
      break;
    }
  }
  const localT = (t - lo.stop) / (hi.stop - lo.stop);
  const r = lerp(lo.hex[0], hi.hex[0], localT);
  const g = lerp(lo.hex[1], hi.hex[1], localT);
  const b = lerp(lo.hex[2], hi.hex[2], localT);
  return `rgb(${r},${g},${b})`;
}

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

export function CarbonHeatmap({ cells, overallAvg, lookbackDays = 90 }: CarbonHeatmapProps) {
  const [hover, setHover] = useState<{ cell: Cell; x: number; y: number } | null>(
    null
  );
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `fabrick-uk-grid-heatmap-${lookbackDays}d-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Heatmap download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  const { min, max } = useMemo(() => {
    const populated = cells.filter((c) => c.count > 0);
    if (populated.length === 0) return { min: 0, max: 1 };
    return {
      min: Math.min(...populated.map((c) => c.avg)),
      max: Math.max(...populated.map((c) => c.avg)),
    };
  }, [cells]);

  const grid = useMemo(() => {
    const map = new Map<string, Cell>();
    cells.forEach((c) => map.set(`${c.dayOfWeek}-${c.hourOfDay}`, c));
    return DAY_ORDER.map((dow) =>
      Array.from({ length: 24 }, (_, hod) =>
        map.get(`${dow}-${hod}`) || {
          dayOfWeek: dow,
          hourOfDay: hod,
          avg: 0,
          count: 0,
          min: 0,
          max: 0,
        }
      )
    );
  }, [cells]);

  return (
    <div ref={captureRef} className="rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-charcoal/[0.06]">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-pink mb-1">
            Fabrick Analysis
          </p>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-navy">
            When is the UK grid cleanest?
          </h3>
          <p className="text-xs text-warm-gray mt-1 max-w-2xl">
            {lookbackDays}-day rolling average of grid carbon, by hour of day
            and day of week. Use the cool zones to schedule the cleanest
            grid-powered work.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[10px] text-warm-gray">
            <span className="font-semibold uppercase tracking-wider">Lower</span>
            <div
              className="h-2 w-24 md:w-32 rounded-full"
              style={{
                background: `linear-gradient(to right, ${colourFor(min, min, max)} 0%, ${colourFor((min + max) / 2, min, max)} 50%, ${colourFor(max, min, max)} 100%)`,
              }}
            />
            <span className="font-semibold uppercase tracking-wider">Higher</span>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-navy transition-colors disabled:opacity-50 print:hidden"
            aria-label="Download heatmap as PNG"
          >
            <Download className="h-3 w-3" />
            {downloading ? "Saving…" : "PNG"}
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-1 -mx-2 px-2">
        <table className="w-full text-[11px] md:text-xs tabular-nums" aria-label="UK grid carbon intensity heatmap by hour and day">
          <thead>
            <tr>
              <th aria-hidden className="w-10" />
              {Array.from({ length: 24 }, (_, h) => (
                <th
                  key={h}
                  className="font-medium text-warm-gray/70 text-center py-1.5 text-[10px]"
                  scope="col"
                >
                  {h % 3 === 0 ? formatHour(h) : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, i) => (
              <tr key={DAY_ORDER[i]}>
                <th
                  scope="row"
                  className="text-right pr-2.5 text-warm-gray font-semibold text-[12px] md:text-[13px]"
                >
                  {DAY_NAMES[DAY_ORDER[i]]}
                </th>
                {row.map((cell) => (
                  <td key={cell.hourOfDay} className="p-px">
                    <div
                      className="h-7 md:h-8 rounded-[3px] cursor-default transition-transform hover:scale-110 hover:ring-2 hover:ring-charcoal/20"
                      style={{
                        backgroundColor:
                          cell.count > 0
                            ? colourFor(cell.avg, min, max)
                            : "var(--color-cream-dark)",
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parent = e.currentTarget
                          .closest(".relative")
                          ?.getBoundingClientRect();
                        if (parent) {
                          setHover({
                            cell,
                            x: rect.left + rect.width / 2 - parent.left,
                            y: rect.top - parent.top,
                          });
                        }
                      }}
                      onMouseLeave={() => setHover(null)}
                      onFocus={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const parent = e.currentTarget
                          .closest(".relative")
                          ?.getBoundingClientRect();
                        if (parent) {
                          setHover({
                            cell,
                            x: rect.left + rect.width / 2 - parent.left,
                            y: rect.top - parent.top,
                          });
                        }
                      }}
                      onBlur={() => setHover(null)}
                      tabIndex={0}
                      aria-label={`${DAY_NAMES[cell.dayOfWeek]} ${formatHour(cell.hourOfDay)}: ${cell.count > 0 ? `${cell.avg.toFixed(0)} gCO2 per kWh average` : "no data"}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Floating tooltip near cursor */}
        {hover && hover.cell.count > 0 && (
          <div
            className="absolute pointer-events-none z-10 rounded-lg bg-charcoal text-white shadow-lg px-3 py-2 text-xs whitespace-nowrap"
            style={{
              left: hover.x,
              top: hover.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="font-semibold">
              {DAY_NAMES[hover.cell.dayOfWeek]} {formatHour(hover.cell.hourOfDay)}
            </p>
            <p className="text-teal text-sm font-bold tabular-nums">
              {hover.cell.avg.toFixed(0)} gCO₂/kWh
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              range {hover.cell.min.toFixed(0)}–{hover.cell.max.toFixed(0)} ·{" "}
              {hover.cell.count} samples
            </p>
            <span
              className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-2 w-2 bg-charcoal rotate-45"
              aria-hidden
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-warm-gray flex-wrap gap-2">
        <span>
          {lookbackDays}-day average{" "}
          <strong className="text-navy">
            {overallAvg.toFixed(0)} gCO₂/kWh
          </strong>
          . Hover any cell for detail.
        </span>
        <span className="text-[10px] uppercase tracking-wider text-warm-gray/70">
          Source: National Grid ESO
        </span>
      </div>
    </div>
  );
}
