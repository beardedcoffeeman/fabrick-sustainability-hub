"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Info,
  ExternalLink,
  HardHat,
  Wrench,
  Hammer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Sector {
  name: string;
  key: string;
  value: number | null;
  prev: number | null;
  yoy: number | null;
  momChange: number | null;
  yoyChange: number | null;
}

interface TrendPoint {
  month: string;
  value: number | null;
}

interface ConstructionData {
  period: string;
  periodKey: string;
  releaseDate: string;
  totalOutput: {
    value: number | null;
    unit: string;
    momChange: number | null;
    yoyChange: number | null;
  };
  newWork: {
    value: number | null;
    unit: string;
  };
  repairMaintenance: {
    value: number | null;
    unit: string;
  };
  sectors: Sector[];
  trend: TrendPoint[];
  source: {
    name: string;
    url: string;
    api: string;
    notes: string;
  };
}

// Palette colours consistent with the Fabrick Sustainability Hub design
const SECTOR_COLOURS: Record<string, string> = {
  privateNewHousing: "#00BFA5", // teal
  publicNewHousing: "#00A389", // teal-dark
  infrastructure: "#2D2D3F", // navy
  commercial: "#FF3D7F", // pink
  industrial: "#FF6B9D", // pink-light
  publicOther: "#8A8A9A", // warm-gray
};

function ChangeIndicator({
  value,
  label,
  size = "normal",
}: {
  value: number | null;
  label: string;
  size?: "normal" | "small";
}) {
  if (value == null) return null;

  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 0.05;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colour = isNeutral
    ? "text-warm-gray"
    : isPositive
      ? "text-teal"
      : "text-pink";

  const textSize = size === "small" ? "text-[10px]" : "text-xs";
  const iconSize = size === "small" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className={`flex items-center gap-1 ${colour}`}>
      <Icon className={iconSize} />
      <span className={`${textSize} font-semibold tabular-nums`}>
        {isPositive ? "+" : ""}
        {value.toFixed(1)}%
      </span>
      <span className={`${textSize} text-warm-gray font-normal`}>{label}</span>
    </div>
  );
}

function formatGBP(value: number | null): string {
  if (value == null) return "--";
  // Values are in GBP millions
  if (value >= 1000) {
    return `\u00A3${(value / 1000).toFixed(1)}bn`;
  }
  return `\u00A3${value.toLocaleString("en-GB")}m`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-charcoal px-3 py-2 shadow-lg text-white text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {formatGBP(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function ConstructionOutputWidget() {
  const [data, setData] = useState<ConstructionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/construction-output");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Unable to load construction output data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 6 hours (data is monthly, so no need for frequent polling)
    const interval = setInterval(fetchData, 21600000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-56 bg-cream-dark rounded mb-4" />
          <div className="h-20 w-full bg-cream-dark rounded mb-4" />
          <div className="h-48 w-full bg-cream-dark rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm animate-pulse">
            <div className="h-6 w-32 bg-cream-dark rounded mb-3" />
            <div className="h-10 w-20 bg-cream-dark rounded" />
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm animate-pulse">
            <div className="h-6 w-32 bg-cream-dark rounded mb-3" />
            <div className="h-10 w-20 bg-cream-dark rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-warm-gray">{error}</p>
        <button onClick={fetchData} className="mt-2 text-teal underline text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { totalOutput, newWork, repairMaintenance, sectors, trend, source } = data;

  // Prepare bar chart data from sectors
  const sectorChartData = sectors
    .filter((s) => s.value != null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .map((s) => ({
      name: s.name,
      value: s.value,
      fill: SECTOR_COLOURS[s.key] || "#8A8A9A",
    }));

  // Prepare trend chart data (filter out nulls)
  const trendChartData = trend.filter((t) => t.value != null);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Main Output Card */}
      <div className="rounded-2xl bg-charcoal p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-teal" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              UK Construction Output
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-500 tabular-nums">
              {data.period}
            </span>
            <button
              onClick={fetchData}
              className="text-gray-400 hover:text-white transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Total output headline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={totalOutput.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-end gap-4"
          >
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold tabular-nums text-white">
                  {formatGBP(totalOutput.value)}
                </span>
                <span className="text-lg text-gray-400">total output</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <ChangeIndicator value={totalOutput.momChange} label="MoM" />
                <ChangeIndicator value={totalOutput.yoyChange} label="YoY" />
              </div>
            </div>
            <div className="flex-1" />
            <HardHat className="h-16 w-16 text-navy-light opacity-20" />
          </motion.div>
        </AnimatePresence>

        {/* Explanation */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-navy-light/50 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-300">Construction output</span>{" "}
            measures the total value of construction work done in Great Britain each
            month. It covers both new build and repair/maintenance across all sectors.
            Tracking output trends helps the industry anticipate capacity pressures,
            material demand, and labour market conditions.
          </p>
        </div>

        {/* 12-Month Trend */}
        {trendChartData.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-400 mb-3">12-month output trend</p>
            <div style={{ width: "100%", height: 160 }}>
              <ResponsiveContainer>
                <AreaChart
                  data={trendChartData}
                  margin={{ top: 5, right: 5, bottom: 0, left: 5 }}
                >
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00BFA5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "#8A8A9A" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#8A8A9A" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}bn`}
                    domain={["dataMin - 500", "dataMax + 500"]}
                    width={40}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00BFA5"
                    strokeWidth={2}
                    fill="url(#trendGradient)"
                    name="Total Output"
                    dot={false}
                    activeDot={{ r: 4, fill: "#00BFA5", stroke: "#1A1A2E", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* New Work vs R&M Split */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          className="rounded-2xl bg-white p-5 shadow-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Hammer className="h-4 w-4 text-teal" />
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
              New Work
            </span>
          </div>
          <p className="text-3xl font-bold text-teal">
            {formatGBP(newWork.value)}
          </p>
          <p className="text-[10px] text-warm-gray/70 mt-1 leading-relaxed">
            New construction projects including housing, infrastructure, and
            commercial developments. Indicates forward investment in the built
            environment.
          </p>
          {newWork.value != null && totalOutput.value != null && totalOutput.value > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-warm-gray">Share of total</span>
                <span className="font-semibold text-navy tabular-nums">
                  {((newWork.value / totalOutput.value) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-cream-dark overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal transition-all duration-700"
                  style={{
                    width: `${(newWork.value / totalOutput.value) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          className="rounded-2xl bg-white p-5 shadow-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="h-4 w-4 text-pink" />
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
              Repair &amp; Maintenance
            </span>
          </div>
          <p className="text-3xl font-bold text-navy">
            {formatGBP(repairMaintenance.value)}
          </p>
          <p className="text-[10px] text-warm-gray/70 mt-1 leading-relaxed">
            Repair, maintenance, and improvement of existing buildings and
            infrastructure. A key indicator of asset management and retrofit
            activity.
          </p>
          {repairMaintenance.value != null &&
            totalOutput.value != null &&
            totalOutput.value > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-warm-gray">Share of total</span>
                  <span className="font-semibold text-navy tabular-nums">
                    {((repairMaintenance.value / totalOutput.value) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-cream-dark overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pink transition-all duration-700"
                    style={{
                      width: `${(repairMaintenance.value / totalOutput.value) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
        </motion.div>
      </div>

      {/* Sector Breakdown Chart */}
      <motion.div
        className="rounded-2xl bg-white p-5 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-gray mb-1">
          New Work by Sector
        </h4>
        <p className="text-[10px] text-warm-gray/70 mb-4 leading-relaxed">
          Breakdown of new construction output by sector. Private housing
          typically dominates, but infrastructure investment is a key indicator
          of government capital spending.
        </p>

        {sectorChartData.length > 0 && (
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart
                data={sectorChartData}
                layout="vertical"
                margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5DFD5"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#8A8A9A" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatGBP(v)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#2D2D3F" }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  name="Output"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Sector change indicators */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {sectors
            .filter((s) => s.value != null)
            .map((s) => (
              <div
                key={s.key}
                className="rounded-lg bg-cream p-2.5"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: SECTOR_COLOURS[s.key] || "#8A8A9A" }}
                  />
                  <span className="text-[10px] font-medium text-navy truncate">
                    {s.name}
                  </span>
                </div>
                <p className="text-sm font-bold text-navy tabular-nums">
                  {formatGBP(s.value)}
                </p>
                <div className="mt-1 space-y-0.5">
                  <ChangeIndicator value={s.momChange} label="MoM" size="small" />
                  <ChangeIndicator value={s.yoyChange} label="YoY" size="small" />
                </div>
              </div>
            ))}
        </div>
      </motion.div>

      {/* Data Source Attribution */}
      <motion.div
        className="rounded-2xl bg-white p-4 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
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
              {" "}&mdash; Office for National Statistics. Released {data.releaseDate}.
            </p>
            <p className="text-[10px] text-warm-gray/60 mt-1">
              {source.notes} Data shown for {data.period}. Dashboard caches for 24 hours.
              All figures in current prices (not inflation-adjusted).
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
