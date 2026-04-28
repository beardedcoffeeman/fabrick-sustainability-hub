"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Material {
  id: string;
  name: string;
  category: string;
  currentIndex: number;
  previousMonthIndex: number;
  yearAgoIndex: number;
  momChange: number;
  yoyChange: number;
  trend: "up" | "down" | "stable";
  unit: string;
  sparkline: number[];
  sparklineLabels: string[];
}

interface SourceInfo {
  name: string;
  publisher: string;
  url: string;
  releaseDate: string;
  dataPeriod: string;
  indexBase: string;
  nextRelease: string;
}

interface ApiResp {
  materials: Material[];
  source: SourceInfo;
}

// Hand-curated mapping from DBT material id → embodied carbon (kgCO2e/kg)
// Pulled from ICE Database v4.1 typical values. Used for the cost-vs-carbon
// scatter only; real specifications should use the carbon calculator.
const ICE_CARBON: Record<string, { kgCO2eKg: number; sourceNote: string }> = {
  "structural-steel": {
    kgCO2eKg: 1.55,
    sourceNote: "ICE v4.1 - UK structural steel sections (mixed routes)",
  },
  "rebar-steel": {
    kgCO2eKg: 1.99,
    sourceNote: "ICE v4.1 - reinforcing steel bar (UK average)",
  },
  "softwood-imported": {
    kgCO2eKg: 0.31,
    sourceNote: "ICE v4.1 - sawn softwood timber (cradle-to-gate)",
  },
  "plywood-imported": {
    kgCO2eKg: 0.45,
    sourceNote: "ICE v4.1 - plywood",
  },
  "builders-woodwork": {
    kgCO2eKg: 0.55,
    sourceNote: "ICE v4.1 - engineered timber joinery",
  },
  "timber-doors-windows": {
    kgCO2eKg: 0.6,
    sourceNote: "ICE v4.1 - timber-framed window/door",
  },
  "readymix-concrete": {
    kgCO2eKg: 0.13,
    sourceNote: "ICE v4.1 - ready-mix C30/37 concrete",
  },
  cement: {
    kgCO2eKg: 0.83,
    sourceNote: "ICE v4.1 - Portland cement, average UK production",
  },
  "precast-concrete": {
    kgCO2eKg: 0.18,
    sourceNote: "ICE v4.1 - pre-cast concrete products",
  },
  "concrete-blocks-bricks": {
    kgCO2eKg: 0.107,
    sourceNote: "ICE v4.1 - concrete blocks (medium-density)",
  },
  "sand-gravel-incl-levy": {
    kgCO2eKg: 0.0048,
    sourceNote: "ICE v4.1 - natural aggregates",
  },
  "sand-gravel-excl-levy": {
    kgCO2eKg: 0.0048,
    sourceNote: "ICE v4.1 - natural aggregates",
  },
  "asphalt-bituminous": {
    kgCO2eKg: 0.066,
    sourceNote: "ICE v4.1 - bituminous mix (asphalt)",
  },
  insulation: {
    kgCO2eKg: 1.28,
    sourceNote: "ICE v4.1 - mineral wool insulation",
  },
  "plastic-pipes-rigid": {
    kgCO2eKg: 2.59,
    sourceNote: "ICE v4.1 - PVC pipe (rigid)",
  },
  "plastic-pipes-flexible": {
    kgCO2eKg: 3.1,
    sourceNote: "ICE v4.1 - flexible plastic piping",
  },
  "plastic-doors-windows": {
    kgCO2eKg: 2.43,
    sourceNote: "ICE v4.1 - uPVC window/door",
  },
  "metal-doors-windows": {
    kgCO2eKg: 5.6,
    sourceNote: "ICE v4.1 - aluminium-framed window/door",
  },
  "central-heating-boilers": {
    kgCO2eKg: 1.95,
    sourceNote: "ICE v4.1 - fabricated steel + components (boiler)",
  },
  "paint-solvent": {
    kgCO2eKg: 2.91,
    sourceNote: "ICE v4.1 - solvent-based paint",
  },
  "paint-water": {
    kgCO2eKg: 2.12,
    sourceNote: "ICE v4.1 - water-based paint",
  },
};

function buildCommentary(materials: Material[], source: SourceInfo): string {
  const sorted = [...materials].sort((a, b) => b.yoyChange - a.yoyChange);
  const topRiser = sorted[0];
  const topFaller = sorted[sorted.length - 1];
  const upCount = materials.filter((m) => m.yoyChange > 0).length;
  const downCount = materials.filter((m) => m.yoyChange < 0).length;
  const direction =
    upCount > downCount
      ? `${upCount} of ${materials.length} indices have risen year-on-year`
      : `${downCount} of ${materials.length} indices have fallen year-on-year`;

  return `For the ${source.dataPeriod} reference month, ${direction}. ${topRiser.name} is up ${topRiser.yoyChange.toFixed(1)}% YoY - the largest move in the basket - while ${topFaller.name} is down ${Math.abs(topFaller.yoyChange).toFixed(1)}%. Buyers timing major orders should weigh near-term momentum (month-on-month) against the 12-month direction; specifiers can use the cost-vs-carbon view below to favour materials that are both lower-priced and lower-carbon than category alternatives.`;
}

function MiniSparkline({ data, trend }: { data: number[]; trend: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  const stroke =
    trend === "up" ? "#E7467A" : trend === "down" ? "#10B981" : "#8A8A9A";
  return (
    <ResponsiveContainer width="100%" height={28}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
        <Area
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.5}
          fill={`url(#spark-${trend})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MaterialPricesAnalysis() {
  const [data, setData] = useState<ApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/material-prices")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: ApiResp) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(String(e));
      });
    return () => {
      active = false;
    };
  }, []);

  const sortedByYoY = useMemo(() => {
    if (!data) return { risers: [], fallers: [] };
    const sorted = [...data.materials].sort((a, b) => b.yoyChange - a.yoyChange);
    return {
      risers: sorted.filter((m) => m.yoyChange > 0).slice(0, 5),
      fallers: sorted.filter((m) => m.yoyChange < 0).slice(-5).reverse(),
    };
  }, [data]);

  const scatterData = useMemo(() => {
    if (!data) return [];
    return data.materials
      .filter((m) => ICE_CARBON[m.id])
      .map((m) => ({
        name: m.name,
        carbon: ICE_CARBON[m.id].kgCO2eKg,
        index: m.currentIndex,
        category: m.category,
      }));
  }, [data]);

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-warm-gray border border-cream-dark">
        Couldn&rsquo;t load material price analysis: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl bg-white p-12 flex items-center justify-center text-warm-gray border border-cream-dark">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading analysis…
      </div>
    );
  }

  const commentary = buildCommentary(data.materials, data.source);

  return (
    <div className="space-y-6">
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
          Source: {data.source.publisher} - {data.source.name}, {data.source.dataPeriod}.
          Index base {data.source.indexBase}. Next release {data.source.nextRelease}.
        </p>
      </div>

      {/* Biggest movers - risers / fallers */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-pink" />
            <h3 className="font-bold text-navy">Biggest risers (YoY)</h3>
          </div>
          {sortedByYoY.risers.length === 0 ? (
            <p className="text-sm text-warm-gray italic">
              No materials are up year-on-year in this release.
            </p>
          ) : (
            <ol className="space-y-3">
              {sortedByYoY.risers.map((m) => (
                <li
                  key={m.id}
                  className="grid grid-cols-[1fr_70px_120px] items-center gap-3 border-b border-cream pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">{m.name}</p>
                    <p className="text-[10px] text-warm-gray">{m.category}</p>
                  </div>
                  <MiniSparkline data={m.sparkline} trend={m.trend} />
                  <div className="text-right">
                    <p className="text-base font-bold text-pink tabular-nums">
                      +{m.yoyChange.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-warm-gray">
                      vs {m.yearAgoIndex.toFixed(0)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-4 w-4 text-teal" />
            <h3 className="font-bold text-navy">Biggest fallers (YoY)</h3>
          </div>
          {sortedByYoY.fallers.length === 0 ? (
            <p className="text-sm text-warm-gray italic">
              No materials are down year-on-year in this release.
            </p>
          ) : (
            <ol className="space-y-3">
              {sortedByYoY.fallers.map((m) => (
                <li
                  key={m.id}
                  className="grid grid-cols-[1fr_70px_120px] items-center gap-3 border-b border-cream pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">{m.name}</p>
                    <p className="text-[10px] text-warm-gray">{m.category}</p>
                  </div>
                  <MiniSparkline data={m.sparkline} trend={m.trend} />
                  <div className="text-right">
                    <p className="text-base font-bold text-teal tabular-nums">
                      {m.yoyChange.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-warm-gray">
                      vs {m.yearAgoIndex.toFixed(0)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Cost vs carbon scatter - the consultant insight */}
      <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
        <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-pink" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink">
                Fabrick Analysis
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-navy">
              Cost vs carbon
            </h3>
            <p className="text-xs text-warm-gray mt-1 max-w-2xl">
              Where each material sits on price index (today) vs typical
              embodied carbon (ICE v4.1). Bottom-left is the sweet spot:
              cheaper than category average and lower-carbon.
            </p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 36 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" />
              <XAxis
                type="number"
                dataKey="index"
                name="Price index"
                domain={["dataMin - 5", "dataMax + 5"]}
                label={{
                  value: "Price index (2015 = 100)",
                  position: "bottom",
                  offset: 18,
                  fill: "#8A8A9A",
                  fontSize: 11,
                }}
                tick={{ fill: "#8A8A9A", fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="carbon"
                name="Embodied carbon"
                scale="log"
                domain={["auto", "auto"]}
                label={{
                  value: "Embodied carbon (kgCO₂e/kg, log)",
                  angle: -90,
                  position: "left",
                  offset: 14,
                  fill: "#8A8A9A",
                  fontSize: 11,
                }}
                tick={{ fill: "#8A8A9A", fontSize: 11 }}
              />
              <ZAxis range={[120, 120]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0].payload as {
                    name: string;
                    category: string;
                    index: number;
                    carbon: number;
                  };
                  return (
                    <div className="rounded-lg bg-charcoal text-white px-3 py-2 text-xs shadow-lg">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{p.category}</p>
                      <p className="mt-1">Price index: {p.index.toFixed(1)}</p>
                      <p>Embodied carbon: {p.carbon} kgCO₂e/kg</p>
                    </div>
                  );
                }}
              />
              <Scatter data={scatterData} fill="#00BFA5" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-[10px] text-warm-gray italic">
          Embodied carbon values are typical category averages from ICE Database
          v4.1. Real specifications vary by mix design, recycled content and
          supplier - use the Carbon Calculator for project-level analysis.
        </p>
      </div>

      {/* Substitution savings ladder - context for high-impact swaps */}
      <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
        <div className="flex items-center gap-2 mb-3">
          <ArrowDown className="h-4 w-4 text-teal" />
          <h3 className="font-bold text-navy">High-impact substitutions</h3>
        </div>
        <p className="text-xs text-warm-gray mb-4 max-w-2xl">
          The biggest carbon wins on most projects come from a small number of
          structural swaps. Typical ICE v4.1 values for the cradle-to-gate
          carbon saving - actual savings depend on supplier and project.
        </p>
        <ul className="space-y-3 text-sm">
          {[
            {
              from: "CEM I cement",
              to: "GGBS-blend cement (50%)",
              saving: "~40% kgCO₂e/kg",
              note: "Available at scale; minimal cost premium.",
            },
            {
              from: "Structural steel (mixed)",
              to: "Recycled-content steel (≥90%)",
              saving: "~50% kgCO₂e/kg",
              note: "Specify EAF route in tender documents.",
            },
            {
              from: "Concrete frame",
              to: "Engineered timber (CLT)",
              saving: "~70% kgCO₂e/kg",
              note: "Suits low-rise commercial and residential up to 8 storeys.",
            },
            {
              from: "Virgin aggregate",
              to: "Recycled aggregate",
              saving: "~30% kgCO₂e/kg",
              note: "Often cheaper too - good source of joint cost+carbon win.",
            },
            {
              from: "Mineral wool insulation",
              to: "Wood-fibre insulation",
              saving: "~80% kgCO₂e/kg",
              note: "Higher upfront cost; often offset by improved hygrothermal performance.",
            },
          ].map((s) => (
            <li
              key={s.from}
              className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-2 md:gap-4 items-center border-b border-cream pb-3 last:border-0 last:pb-0"
            >
              <span className="text-warm-gray">
                <span className="font-semibold text-navy">From:</span> {s.from}
              </span>
              <ArrowUp className="hidden md:block h-3 w-3 text-warm-gray rotate-90" />
              <span className="text-warm-gray">
                <span className="font-semibold text-navy">To:</span> {s.to}
              </span>
              <span className="text-right">
                <span className="font-bold text-teal text-base">{s.saving}</span>
                <span className="block text-[10px] text-warm-gray">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footnote: stable indices */}
      {data.materials.filter((m) => m.trend === "stable").length > 0 && (
        <div className="rounded-2xl bg-white p-6 border border-charcoal/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Minus className="h-4 w-4 text-warm-gray" />
            <h3 className="font-bold text-navy">Stable</h3>
          </div>
          <p className="text-xs text-warm-gray mb-3">
            Indices moving by less than 1.5% YoY in the latest release.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.materials
              .filter((m) => m.trend === "stable")
              .map((m) => (
                <li key={m.id} className="text-sm">
                  <span className="font-semibold text-navy">{m.name}</span>
                  <span className="text-warm-gray">
                    {" "}
                    · {m.yoyChange >= 0 ? "+" : ""}
                    {m.yoyChange.toFixed(1)}% YoY
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
