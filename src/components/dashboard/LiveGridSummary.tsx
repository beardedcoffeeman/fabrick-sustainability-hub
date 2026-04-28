"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

interface IntensityData {
  current: {
    intensity: { forecast: number; actual: number; index: string };
  };
  generation: {
    generationmix: Array<{ fuel: string; perc: number }>;
  };
  forecast: Array<{
    from: string;
    intensity: { forecast: number; actual: number; index: string };
  }>;
}

const INDEX_BG: Record<string, string> = {
  "very low": "bg-emerald-500/20 text-emerald-300",
  low: "bg-emerald-500/20 text-emerald-300",
  moderate: "bg-amber-500/20 text-amber-200",
  high: "bg-pink/20 text-pink",
  "very high": "bg-pink/30 text-pink",
};

const INDEX_COLOUR: Record<string, string> = {
  "very low": "#10B981",
  low: "#10B981",
  moderate: "#F59E0B",
  high: "#E7467A",
  "very high": "#E7467A",
};

export function LiveGridSummary() {
  const [data, setData] = useState<IntensityData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/carbon-intensity")
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((d: IntensityData) => {
          if (active) setData(d);
        })
        .catch((e) => {
          if (active) setError(String(e));
        });
    };
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-warm-gray border border-cream-dark">
        Live grid read unavailable.
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-8 flex items-center justify-center text-warm-gray border border-cream-dark">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading live read…
      </div>
    );
  }

  const intensity = data.current.intensity;
  const value = intensity.actual ?? intensity.forecast;
  const indexLabel = intensity.index;
  const colour = INDEX_COLOUR[indexLabel] ?? "#8A8A9A";

  const renewables = data.generation.generationmix
    .filter((g) => ["wind", "solar", "hydro", "biomass"].includes(g.fuel))
    .reduce((sum, g) => sum + g.perc, 0);

  // 12 next half-hours of forecast (next 6 hours)
  const next12 = data.forecast.slice(0, 12);
  const maxF = Math.max(...next12.map((f) => f.intensity.forecast), 1);

  return (
    <div className="rounded-2xl bg-charcoal p-6 md:p-7 text-white">
      <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        {/* Left: value */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-2">
            UK grid right now
          </p>
          <div className="flex items-baseline gap-3">
            <span
              className="font-[family-name:var(--font-playfair)] text-6xl md:text-7xl font-bold leading-none tabular-nums"
              style={{ color: colour }}
            >
              {value.toFixed(0)}
            </span>
            <span className="text-sm text-gray-400">gCO₂/kWh</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${INDEX_BG[indexLabel] ?? "bg-white/10 text-white"}`}
            >
              {indexLabel}
            </span>
            <span className="text-xs text-gray-400 tabular-nums">
              <span className="text-teal font-semibold">
                {renewables.toFixed(0)}%
              </span>{" "}
              renewable mix
            </span>
          </div>
        </div>

        {/* Right: next 6h forecast bars */}
        <div className="border-t md:border-t-0 md:border-l border-white/10 md:pl-6 pt-5 md:pt-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Next 6 hours
            </p>
            <Link
              href="/dashboard"
              className="text-[10px] text-teal hover:text-white inline-flex items-center gap-1 font-semibold uppercase tracking-wider"
            >
              Full live read
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-end gap-1 h-16">
            {next12.map((f) => {
              const v = f.intensity.actual ?? f.intensity.forecast;
              const heightPct = (v / maxF) * 100;
              const c = INDEX_COLOUR[f.intensity.index] ?? "#8A8A9A";
              return (
                <div
                  key={f.from}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: c,
                    opacity: 0.85,
                  }}
                  title={`${new Date(f.from).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}: ${v.toFixed(0)} gCO₂/kWh`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-gray-500">
            Source: National Grid ESO. Refreshes every 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
