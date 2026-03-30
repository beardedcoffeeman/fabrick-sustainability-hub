"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Info,
  ExternalLink,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from "recharts";

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

interface MaterialPriceEntry {
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

interface MaterialPricesData {
  materials: MaterialPriceEntry[];
  source: {
    name: string;
    publisher: string;
    url: string;
    releaseDate: string;
    dataPeriod: string;
    indexBase: string;
    nextRelease: string;
  };
  fetchedAt: string;
}

// ──────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "down":
      return <TrendingDown className="h-3.5 w-3.5" />;
    default:
      return <Minus className="h-3.5 w-3.5" />;
  }
}

function getChangeColor(change: number): string {
  if (change > 1) return "text-pink";
  if (change < -1) return "text-teal";
  return "text-warm-gray";
}

function getChangeBg(change: number): string {
  if (change > 1) return "bg-pink/10";
  if (change < -1) return "bg-teal/10";
  return "bg-cream-dark";
}

function getSparklineColor(trend: string): string {
  switch (trend) {
    case "up":
      return "#FF3D7F"; // pink
    case "down":
      return "#00BFA5"; // teal
    default:
      return "#8A8A9A"; // warm-gray
  }
}

function getCategoryEmoji(category: string): string {
  switch (category) {
    case "Metals":
      return "metal";
    case "Timber":
      return "timber";
    case "Concrete":
      return "concrete";
    case "Aggregates":
      return "aggregate";
    case "Masonry":
      return "masonry";
    case "Insulation":
      return "insulation";
    default:
      return "material";
  }
}

// ──────────────────────────────────────────────────
// Mini Sparkline Component
// ──────────────────────────────────────────────────

function MiniSparkline({
  data,
  trend,
}: {
  data: number[];
  trend: string;
}) {
  const chartData = data.map((value, i) => ({ value, i }));
  const color = getSparklineColor(trend);
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  // Add a small padding to the domain so the line doesn't clip
  const padding = (maxVal - minVal) * 0.15 || 1;

  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 1, bottom: 2, left: 1 }}>
          <defs>
            <linearGradient id={`grad-${trend}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis domain={[minVal - padding, maxVal + padding]} hide />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${trend})`}
            dot={false}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Material Row Component
// ──────────────────────────────────────────────────

function MaterialRow({
  material,
  index,
}: {
  material: MaterialPriceEntry;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div
          className={`rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md ${
            expanded ? "ring-1 ring-teal/30" : ""
          }`}
        >
          {/* Main row */}
          <div className="flex items-center gap-3">
            {/* Material name and category */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-navy truncate">
                  {material.name}
                </span>
                <span className="text-[10px] text-warm-gray/70 bg-cream rounded-full px-2 py-0.5 shrink-0">
                  {getCategoryEmoji(material.category)}
                </span>
              </div>
              <p className="text-[10px] text-warm-gray mt-0.5">
                {material.unit}
              </p>
            </div>

            {/* Sparkline */}
            <div className="hidden sm:block shrink-0">
              <MiniSparkline data={material.sparkline} trend={material.trend} />
            </div>

            {/* Current index */}
            <div className="text-right shrink-0 w-16">
              <p className="text-lg font-bold text-navy tabular-nums">
                {material.currentIndex.toFixed(1)}
              </p>
            </div>

            {/* MoM change badge */}
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 shrink-0 ${getChangeBg(
                material.momChange
              )} ${getChangeColor(material.momChange)}`}
            >
              {getTrendIcon(material.trend)}
              <span className="text-xs font-semibold tabular-nums">
                {material.momChange > 0 ? "+" : ""}
                {material.momChange.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-cream-dark grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-warm-gray uppercase tracking-wider">
                      Previous Month
                    </p>
                    <p className="text-sm font-semibold text-navy tabular-nums mt-0.5">
                      {material.previousMonthIndex.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-gray uppercase tracking-wider">
                      Year Ago
                    </p>
                    <p className="text-sm font-semibold text-navy tabular-nums mt-0.5">
                      {material.yearAgoIndex.toFixed(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-warm-gray uppercase tracking-wider">
                      YoY Change
                    </p>
                    <p
                      className={`text-sm font-semibold tabular-nums mt-0.5 ${getChangeColor(
                        material.yoyChange
                      )}`}
                    >
                      {material.yoyChange > 0 ? "+" : ""}
                      {material.yoyChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
                {/* Sparkline labels on mobile */}
                <div className="sm:hidden mt-3">
                  <MiniSparkline data={material.sparkline} trend={material.trend} />
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-warm-gray/60">
                      {material.sparklineLabels[0]}
                    </span>
                    <span className="text-[9px] text-warm-gray/60">
                      {material.sparklineLabels[material.sparklineLabels.length - 1]}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────
// Summary Cards
// ──────────────────────────────────────────────────

function SummaryCards({ materials }: { materials: MaterialPriceEntry[] }) {
  const biggestRise = [...materials].sort((a, b) => b.yoyChange - a.yoyChange)[0];
  const biggestFall = [...materials].sort((a, b) => a.yoyChange - b.yoyChange)[0];
  const avgMomChange =
    materials.reduce((sum, m) => sum + m.momChange, 0) / materials.length;

  return (
    <motion.div
      className="grid grid-cols-3 gap-3 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="h-3.5 w-3.5 text-pink" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray">
            Biggest Rise (YoY)
          </span>
        </div>
        <p className="text-lg font-bold text-navy">{biggestRise.name}</p>
        <p className="text-sm font-semibold text-pink tabular-nums">
          +{biggestRise.yoyChange.toFixed(1)}%
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingDown className="h-3.5 w-3.5 text-teal" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray">
            Biggest Fall (YoY)
          </span>
        </div>
        <p className="text-lg font-bold text-navy">{biggestFall.name}</p>
        <p className="text-sm font-semibold text-teal tabular-nums">
          {biggestFall.yoyChange.toFixed(1)}%
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <Minus className="h-3.5 w-3.5 text-warm-gray" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray">
            Avg Monthly Change
          </span>
        </div>
        <p className="text-2xl font-bold text-navy tabular-nums">
          {avgMomChange > 0 ? "+" : ""}
          {avgMomChange.toFixed(2)}%
        </p>
        <p className="text-[10px] text-warm-gray mt-0.5">across all materials</p>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────────────
// Main Widget
// ──────────────────────────────────────────────────

export function MaterialPricesWidget() {
  const [data, setData] = useState<MaterialPricesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/material-prices");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Unable to load material price data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 6 hours (this is monthly data, no urgency)
    const interval = setInterval(fetchData, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Loading skeleton
  if (loading && !data) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-56 bg-cream-dark rounded mb-4" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-cream-dark rounded-xl" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-cream-dark rounded-xl mb-2" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-warm-gray">{error}</p>
        <button
          onClick={fetchData}
          className="mt-2 text-teal underline text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { materials, source } = data;

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <motion.div
        className="rounded-2xl bg-charcoal p-6 text-white"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-teal" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              UK Construction Material Prices
            </span>
          </div>
          <button
            onClick={fetchData}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Material Price Indices
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Index values (2015 = 100) tracking UK construction material costs.
          Data period: {source.dataPeriod}.
        </p>

        {/* Context box */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-navy-light/50 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-300">
              Why material prices matter
            </span>{" "}
            - Construction material costs directly impact project budgets and
            carbon decisions. When steel prices fall, recycled content becomes
            relatively more expensive, risking sustainability trade-offs.
            Tracking these indices helps procurement teams make informed,
            lower-carbon choices without cost surprises.
          </p>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <SummaryCards materials={materials} />

      {/* Material List */}
      <div className="space-y-2">
        {materials.map((material, index) => (
          <MaterialRow key={material.id} material={material} index={index} />
        ))}
      </div>

      {/* Legend */}
      <motion.div
        className="rounded-xl bg-white p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-4 text-[10px] text-warm-gray">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-pink" />
            <span>Price rising (&gt;1% MoM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-teal" />
            <span>Price falling (&gt;1% MoM)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-warm-gray" />
            <span>Stable (within +/-1%)</span>
          </div>
          <span className="text-warm-gray/60">
            Click any row to expand details
          </span>
        </div>
      </motion.div>

      {/* Data Source Attribution */}
      <motion.div
        className="rounded-2xl bg-white p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-warm-gray/60 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-warm-gray leading-relaxed">
              <span className="font-semibold text-navy">Data source:</span>{" "}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline inline-flex items-center gap-0.5"
              >
                {source.name}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {" "}- published by the {source.publisher}. Index base: {source.indexBase}.
            </p>
            <p className="text-[10px] text-warm-gray/60 mt-1">
              Released {source.releaseDate}. Data covers {source.dataPeriod}.
              Next release expected {source.nextRelease}. All indices measure
              price changes relative to the 2015 baseline. Monthly data - this
              dashboard refreshes every 6 hours.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
