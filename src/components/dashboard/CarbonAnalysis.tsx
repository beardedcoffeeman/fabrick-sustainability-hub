"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, TrendingDown, TrendingUp, Sparkles, Calendar } from "lucide-react";
import { CarbonHeatmap } from "./CarbonHeatmap";

interface Cell {
  dayOfWeek: number;
  hourOfDay: number;
  avg: number;
  count: number;
  min: number;
  max: number;
}

interface BestWindow {
  dayOfWeek: number;
  hourOfDay: number;
  avg: number;
  vsOverallPct: number;
}

interface HistoricalData {
  lookbackDays: number;
  fetchedAt: string;
  samples: number;
  overallAvg: number;
  cells: Cell[];
  bestCells: BestWindow[];
  worstCells: BestWindow[];
  source: { name: string; url: string; note: string };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

/**
 * Find the cleanest contiguous N-hour windows in a typical week,
 * restricted to days the user has marked as available.
 * Treats the 168-cell week as circular (Sun 11pm → Mon 12am is contiguous).
 * Returns top `topN` windows ranked by mean carbon intensity.
 */
function findCleanestWindows(
  cells: Cell[],
  windowHours: number,
  allowedDays: Set<number>,
  topN = 3
): Array<{ startDow: number; startHod: number; avg: number; vsOverallPct: number }> {
  // Build a 168-element flat array indexed [dow*24 + hod]
  const flat: Array<Cell | null> = Array(168).fill(null);
  cells.forEach((c) => {
    flat[c.dayOfWeek * 24 + c.hourOfDay] = c;
  });

  const overallAvg =
    cells
      .filter((c) => c.count > 0)
      .reduce((s, c) => s + c.avg, 0) /
    Math.max(
      1,
      cells.filter((c) => c.count > 0).length
    );

  const candidates: Array<{ start: number; avg: number }> = [];
  for (let start = 0; start < 168; start++) {
    let sum = 0;
    let valid = 0;
    let allDaysAllowed = true;
    for (let i = 0; i < windowHours; i++) {
      const idx = (start + i) % 168;
      const dow = Math.floor(idx / 24);
      if (!allowedDays.has(dow)) {
        allDaysAllowed = false;
        break;
      }
      const cell = flat[idx];
      if (cell && cell.count > 0) {
        sum += cell.avg;
        valid += 1;
      }
    }
    if (allDaysAllowed && valid === windowHours) {
      candidates.push({ start, avg: sum / windowHours });
    }
  }

  candidates.sort((a, b) => a.avg - b.avg);

  // Filter near-duplicates (windows that overlap heavily) so we surface
  // genuinely distinct options, not the same low-carbon block 4 times.
  const distinct: typeof candidates = [];
  for (const c of candidates) {
    if (distinct.length >= topN) break;
    const overlap = distinct.some(
      (d) => Math.abs(d.start - c.start) < windowHours
    );
    if (!overlap) distinct.push(c);
  }

  return distinct.map((d) => ({
    startDow: Math.floor(d.start / 24),
    startHod: d.start % 24,
    avg: d.avg,
    vsOverallPct: ((d.avg - overallAvg) / overallAvg) * 100,
  }));
}

function buildCommentary(data: HistoricalData): string {
  if (!data.bestCells.length || !data.worstCells.length) return "";
  const best = data.bestCells[0];
  const worst = data.worstCells[0];
  const swing = ((worst.avg - best.avg) / best.avg) * 100;

  // Are best windows clustered around weekends or weekdays?
  const weekendCount = data.bestCells.filter(
    (c) => c.dayOfWeek === 0 || c.dayOfWeek === 6
  ).length;
  const weekendBias =
    weekendCount >= 6
      ? "weekends"
      : weekendCount <= 1
        ? "weekdays"
        : "spread across the week";

  return `Over the last ${data.lookbackDays} days the cleanest window was ${DAY_NAMES[best.dayOfWeek]} ${formatHour(best.hourOfDay)} at ${best.avg.toFixed(0)} gCO₂/kWh - ${Math.abs(best.vsOverallPct).toFixed(0)}% below the rolling average. The highest-carbon window was ${DAY_NAMES[worst.dayOfWeek]} ${formatHour(worst.hourOfDay)} at ${worst.avg.toFixed(0)} gCO₂/kWh, a ${swing.toFixed(0)}% swing. Low-carbon windows cluster on ${weekendBias}, with overnight wind output dragging early morning hours down. Schedule grid-powered plant operations into those windows where project timelines allow.`;
}

const WINDOW_DURATIONS = [2, 4, 6, 8, 12];

const REGION_OPTIONS: Array<{ slug: string | null; label: string }> = [
  { slug: null, label: "UK (whole grid)" },
  { slug: "north-scotland", label: "North Scotland" },
  { slug: "south-scotland", label: "South Scotland" },
  { slug: "north-west-england", label: "North West England" },
  { slug: "north-east-england", label: "North East England" },
  { slug: "yorkshire", label: "Yorkshire" },
  { slug: "north-wales-merseyside", label: "North Wales & Merseyside" },
  { slug: "south-wales", label: "South Wales" },
  { slug: "west-midlands", label: "West Midlands" },
  { slug: "east-midlands", label: "East Midlands" },
  { slug: "east-england", label: "East England" },
  { slug: "south-west-england", label: "South West England" },
  { slug: "south-england", label: "South England" },
  { slug: "london", label: "London" },
  { slug: "south-east-england", label: "South East England" },
];

export function CarbonAnalysis() {
  const [data, setData] = useState<HistoricalData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(90);
  const [windowHours, setWindowHours] = useState(8);
  const [regionSlug, setRegionSlug] = useState<string | null>(null);
  const [allowedDays, setAllowedDays] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3, 4, 5, 6])
  );

  const toggleDay = (day: number) => {
    setAllowedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        // Always keep at least one day on.
        if (next.size > 1) next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const bestWindows = useMemo(() => {
    if (!data) return [];
    return findCleanestWindows(data.cells, windowHours, allowedDays, 3);
  }, [data, windowHours, allowedDays]);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    const url = regionSlug
      ? `/api/carbon-intensity/historical?days=${days}&region=${regionSlug}`
      : `/api/carbon-intensity/historical?days=${days}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: HistoricalData) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, [days, regionSlug]);

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-warm-gray border border-cream-dark">
        Couldn&rsquo;t load grid analysis: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-12 flex items-center justify-center text-warm-gray border border-cream-dark">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading {days}-day grid analysis…
      </div>
    );
  }

  const commentary = buildCommentary(data);

  return (
    <div className="space-y-6">
      {/* Region + lookback controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <label htmlFor="region-select" className="text-warm-gray">
            Region:
          </label>
          <select
            id="region-select"
            value={regionSlug ?? ""}
            onChange={(e) => setRegionSlug(e.target.value || null)}
            className="rounded-full bg-white border border-cream-dark px-3 py-1 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/40 hover:border-charcoal/30 cursor-pointer"
          >
            {REGION_OPTIONS.map((r) => (
              <option key={r.slug ?? "gb"} value={r.slug ?? ""}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-warm-gray">Lookback:</span>
          {[30, 90, 180, 365].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                days === d
                  ? "bg-charcoal text-white"
                  : "bg-white text-warm-gray border border-cream-dark hover:border-charcoal/30"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <CarbonHeatmap
        cells={data.cells}
        overallAvg={data.overallAvg}
        lookbackDays={data.lookbackDays}
      />

      {/* Fabrick commentary */}
      <div className="rounded-2xl bg-charcoal p-6 md:p-8 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-pink" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink">
            Fabrick Analysis
          </span>
        </div>
        <p className="text-base md:text-lg leading-relaxed text-white/90 max-w-3xl">
          {commentary}
        </p>
        <p className="mt-4 text-[11px] text-gray-400">
          {data.source.note}
        </p>
      </div>

      {/* Best-window finder */}
      <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-teal" />
          <h3 className="font-bold text-navy">
            Find the cleanest window for your work
          </h3>
        </div>
        <p className="text-sm text-warm-gray mb-4 max-w-2xl">
          How many continuous hours do you need, and which days work for your
          project? We&rsquo;ll find the cleanest matching window in a typical
          UK week from the {data.lookbackDays}-day pattern.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-warm-gray">Hours needed:</span>
          {WINDOW_DURATIONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setWindowHours(h)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                windowHours === h
                  ? "bg-charcoal text-white"
                  : "bg-cream text-warm-gray border border-cream-dark hover:border-charcoal/30"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs font-semibold text-warm-gray">Days available:</span>
          {DAY_NAMES.map((label, dow) => {
            const on = allowedDays.has(dow);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(dow)}
                aria-pressed={on}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  on
                    ? "bg-teal text-white"
                    : "bg-cream text-warm-gray/60 border border-cream-dark line-through"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() =>
              setAllowedDays(
                allowedDays.size === 5 &&
                  !allowedDays.has(0) &&
                  !allowedDays.has(6)
                  ? new Set([0, 1, 2, 3, 4, 5, 6])
                  : new Set([1, 2, 3, 4, 5])
              )
            }
            className="ml-1 rounded-full px-3 py-1 text-[11px] font-semibold text-warm-gray border border-cream-dark hover:border-charcoal/30 transition-colors"
          >
            {allowedDays.size === 5 &&
            !allowedDays.has(0) &&
            !allowedDays.has(6)
              ? "Include weekends"
              : "Weekdays only"}
          </button>
        </div>

        {bestWindows.length === 0 ? (
          <p className="text-sm text-warm-gray italic">
            No {windowHours}-hour window fits the days you&rsquo;ve selected.
            Try adding a day or shortening the window.
          </p>
        ) : (
          <div className="space-y-2">
            {bestWindows.map((w, i) => {
              const endHod = (w.startHod + windowHours) % 24;
              const endDow = (w.startDow + Math.floor((w.startHod + windowHours) / 24)) % 7;
              const sameDay = endDow === w.startDow;
              return (
                <div
                  key={`${w.startDow}-${w.startHod}`}
                  className="flex items-center justify-between gap-4 rounded-xl bg-cream/50 px-4 py-3 border border-cream-dark"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-white text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-navy">
                        {DAY_NAMES[w.startDow]} {formatHour(w.startHod)}
                        {" "}
                        <span className="text-warm-gray font-normal">
                          → {sameDay ? "" : `${DAY_NAMES[endDow]} `}
                          {formatHour(endHod)}
                        </span>
                      </p>
                      <p className="text-[11px] text-warm-gray">
                        {windowHours}-hour window
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal tabular-nums">
                      {w.avg.toFixed(0)}
                      <span className="text-xs text-warm-gray font-normal ml-1">
                        gCO₂/kWh
                      </span>
                    </p>
                    <p className="text-[10px] text-warm-gray">
                      {w.vsOverallPct.toFixed(0)}% vs avg
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Best & worst windows */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-teal" />
            <h3 className="font-bold text-navy">
              Cleanest 10 windows
            </h3>
          </div>
          <ol className="space-y-2 text-sm">
            {data.bestCells.map((c, i) => (
              <li
                key={`${c.dayOfWeek}-${c.hourOfDay}`}
                className="flex items-center justify-between border-b border-cream last:border-0 pb-2 last:pb-0"
              >
                <span className="flex items-center gap-3">
                  <span className="text-warm-gray/60 tabular-nums w-4">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-navy">
                    {DAY_NAMES[c.dayOfWeek]}{" "}
                    <span className="text-warm-gray font-normal">
                      {formatHour(c.hourOfDay)}
                    </span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="font-bold text-teal tabular-nums">
                    {c.avg.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-warm-gray ml-1">
                    gCO₂/kWh
                  </span>
                  <span className="block text-[10px] text-warm-gray">
                    {c.vsOverallPct.toFixed(0)}% vs avg
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-pink" />
            <h3 className="font-bold text-navy">
              Highest-carbon 10 windows
            </h3>
          </div>
          <ol className="space-y-2 text-sm">
            {data.worstCells.map((c, i) => (
              <li
                key={`${c.dayOfWeek}-${c.hourOfDay}`}
                className="flex items-center justify-between border-b border-cream last:border-0 pb-2 last:pb-0"
              >
                <span className="flex items-center gap-3">
                  <span className="text-warm-gray/60 tabular-nums w-4">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-navy">
                    {DAY_NAMES[c.dayOfWeek]}{" "}
                    <span className="text-warm-gray font-normal">
                      {formatHour(c.hourOfDay)}
                    </span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="font-bold text-pink tabular-nums">
                    {c.avg.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-warm-gray ml-1">
                    gCO₂/kWh
                  </span>
                  <span className="block text-[10px] text-warm-gray">
                    +{c.vsOverallPct.toFixed(0)}% vs avg
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
