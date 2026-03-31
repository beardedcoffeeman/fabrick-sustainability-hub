"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Zap,
  Package,
  Building2,
  Landmark,
  Building,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Shield,
  RefreshCw,
  Leaf,
  Calculator,
  BookOpen,
  ExternalLink,
  Brain,
} from "lucide-react";
import { RoleSelector, ROLES, type Role } from "@/components/home/RoleSelector";
import { AnimatedNumber } from "@/components/home/AnimatedNumber";
import { DataCard } from "@/components/home/DataCard";
import type { SnapshotData } from "@/components/home/ShareDownload";
import { FabrickMarketingCTA } from "@/components/layout/FabrickCTA";

// ============================================================
// Types
// ============================================================

interface CarbonData {
  current: {
    intensity: { forecast: number; actual: number; index: string };
  };
  generation: {
    generationmix: Array<{ fuel: string; perc: number }>;
  };
  forecast: Array<{
    from: string;
    intensity: { forecast: number; index: string };
  }>;
}

interface MaterialPriceEntry {
  id: string;
  name: string;
  category: string;
  currentIndex: number;
  momChange: number;
  yoyChange: number;
  trend: "up" | "down" | "stable";
  sparkline: number[];
}

interface MaterialPricesData {
  materials: MaterialPriceEntry[];
  source: { dataPeriod: string };
}

interface ConstructionData {
  period: string;
  totalOutput: {
    value: number | null;
    momChange: number | null;
    yoyChange: number | null;
  };
  newWork: { value: number | null };
  repairMaintenance: { value: number | null };
  trend: Array<{ month: string; value: number | null }>;
}

interface PlanningData {
  summary: {
    total: number;
    approved: number;
    refused: number;
    pending: number;
    approvalRate: number;
    totalInDataset: number;
  };
}

interface EPCCertificate {
  currentRating: string;
  sapScore: number;
}

interface EPCDemoData {
  certificates: EPCCertificate[];
  postcode: string;
  totalResults: number;
}

// ============================================================
// Colour helpers
// ============================================================

function getIntensityColor(index: string): string {
  switch (index?.toLowerCase()) {
    case "very low":
      return "#00BFA5";
    case "low":
      return "#8dce46";
    case "moderate":
      return "#ffd500";
    case "high":
      return "#FF6B9D";
    case "very high":
      return "#FF3D7F";
    default:
      return "#8A8A9A";
  }
}

function getIntensityBg(index: string): string {
  switch (index?.toLowerCase()) {
    case "very low":
      return "bg-teal/20 text-teal";
    case "low":
      return "bg-emerald-500/20 text-emerald-400";
    case "moderate":
      return "bg-yellow-400/20 text-yellow-300";
    case "high":
      return "bg-pink/20 text-pink-light";
    case "very high":
      return "bg-pink/30 text-pink";
    default:
      return "bg-warm-gray/20 text-warm-gray";
  }
}

function getSparklineColor(trend: string): string {
  switch (trend) {
    case "up":
      return "#FF3D7F";
    case "down":
      return "#00BFA5";
    default:
      return "#8A8A9A";
  }
}

function formatGBP(value: number | null): string {
  if (value == null) return "--";
  if (value >= 1000) return `\u00A3${(value / 1000).toFixed(1)}bn`;
  return `\u00A3${value.toLocaleString("en-GB")}m`;
}

// ============================================================
// Upcoming regulations
// ============================================================

const upcomingRegs = [
  {
    title: "Future Homes Standard",
    date: "Dec 2026",
    isoDate: "2026-12-01",
    description: "75-80% less carbon in new homes",
    roles: ["architect", "specifier", "contractor", "sustainability-lead"],
  },
  {
    title: "UK CBAM Launch",
    date: "Jan 2027",
    isoDate: "2027-01-01",
    description: "Carbon levy on steel, aluminium, cement imports",
    roles: ["manufacturer", "specifier", "sustainability-lead"],
  },
  {
    title: "EPC Rating C Minimum",
    date: "Apr 2027*",
    isoDate: "2027-04-01",
    description: "Non-domestic rented buildings (proposed)",
    roles: ["architect", "sustainability-lead", "site-manager"],
  },
  {
    title: "Part Z (Proposed)",
    date: "TBC",
    isoDate: null,
    description: "Mandatory embodied carbon reporting",
    roles: ["architect", "specifier", "sustainability-lead", "contractor"],
  },
];

function getDaysUntil(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const target = new Date(isoDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================================
// Role relevance mapping
// ============================================================

const CARD_ROLE_TAGS: Record<string, Record<string, string>> = {
  "carbon-intensity": {
    architect: "Grid carbon for Scope 2",
    specifier: "Energy source mix",
    "site-manager": "When to run equipment",
    contractor: "Operational carbon timing",
    manufacturer: "Embodied carbon factor",
    "sustainability-lead": "Live grid carbon metrics",
  },
  "material-prices": {
    architect: "Specification cost impact",
    specifier: "Procurement intelligence",
    "site-manager": "Budget planning",
    contractor: "Tender pricing data",
    manufacturer: "Market positioning",
    "sustainability-lead": "Cost vs carbon trade-offs",
  },
  "construction-output": {
    architect: "Market demand signals",
    specifier: "Sector activity trends",
    "site-manager": "Capacity & resource planning",
    contractor: "Pipeline intelligence",
    manufacturer: "Demand forecasting",
    "sustainability-lead": "Industry trajectory",
  },
  planning: {
    architect: "Development pipeline",
    specifier: "Regional activity",
    "site-manager": "Local development tracker",
    contractor: "Upcoming projects",
    manufacturer: "Market opportunity",
    "sustainability-lead": "Planning intelligence",
  },
  epc: {
    architect: "Building performance data",
    specifier: "Upgrade opportunities",
    "site-manager": "Asset assessment",
    contractor: "Retrofit pipeline",
    manufacturer: "Product demand signals",
    "sustainability-lead": "Stock energy performance",
  },
  regulations: {
    architect: "Design compliance",
    specifier: "Product requirements",
    "site-manager": "Site compliance",
    contractor: "Build standard changes",
    manufacturer: "CBAM & product standards",
    "sustainability-lead": "Regulatory roadmap",
  },
};

// ============================================================
// Mini Sparkline
// ============================================================

function MiniSparkline({
  data,
  color,
  height = 40,
}: {
  data: number[];
  color: string;
  height?: number;
}) {
  const chartData = data.map((value, i) => ({ value, i }));
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const padding = (maxVal - minVal) * 0.15 || 1;
  const gradientId = `spark-${color.replace("#", "")}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div style={{ height, minHeight: height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={height}>
        <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
            fill={`url(#${gradientId})`}
            dot={false}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// Forecast bar sparkline for carbon
// ============================================================

function ForecastBars({ forecast }: { forecast: CarbonData["forecast"] }) {
  if (!forecast || forecast.length === 0) return null;

  const sliced = forecast.slice(0, 12);
  const maxVal = Math.max(...sliced.map((x) => x.intensity.forecast));

  return (
    <div className="flex items-end gap-[2px]" style={{ height: 56 }}>
      {sliced.map((f, i) => {
        const val = f.intensity.forecast;
        const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
        const time = new Date(f.from).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(height, 4)}%` }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.04 }}
            className="flex-1 rounded-t transition-colors"
            style={{
              backgroundColor: getIntensityColor(f.intensity.index),
              opacity: 0.8,
            }}
            title={`${time}: ${val} gCO2/kWh`}
          />
        );
      })}
    </div>
  );
}

// ============================================================
// Construction Output Tooltip
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OutputTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-charcoal px-2.5 py-1.5 shadow-lg text-white text-[10px]">
      <p className="font-semibold">{label}</p>
      <p>{formatGBP(payload[0]?.value)}</p>
    </div>
  );
}

// ============================================================
// Planning Mini Bar
// ============================================================

function PlanningBar({ summary }: { summary: PlanningData["summary"] }) {
  const total = summary.approved + summary.refused + summary.pending;
  if (total === 0) return null;

  return (
    <div className="flex gap-0.5 h-6 rounded-lg overflow-hidden">
      {summary.approved > 0 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(summary.approved / total) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-emerald-500 flex items-center justify-center"
        >
          <span className="text-[9px] font-bold text-white">{summary.approved}</span>
        </motion.div>
      )}
      {summary.refused > 0 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(summary.refused / total) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-red-500 flex items-center justify-center"
        >
          <span className="text-[9px] font-bold text-white">{summary.refused}</span>
        </motion.div>
      )}
      {summary.pending > 0 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(summary.pending / total) * 100}%` }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-amber-400 flex items-center justify-center"
        >
          <span className="text-[9px] font-bold text-white">{summary.pending}</span>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================
// EPC Rating Colours
// ============================================================

const EPC_COLOURS: Record<string, string> = {
  A: "#008054",
  B: "#19b459",
  C: "#8dce46",
  D: "#ffd500",
  E: "#fcaa65",
  F: "#ef8023",
  G: "#e9153b",
};

const EPC_BANDS = ["A", "B", "C", "D", "E", "F", "G"];

function sapToBand(sap: number): string {
  if (sap >= 92) return "A";
  if (sap >= 81) return "B";
  if (sap >= 69) return "C";
  if (sap >= 55) return "D";
  if (sap >= 39) return "E";
  if (sap >= 21) return "F";
  return "G";
}

// ============================================================
// Curved SVG Arc Divider
// ============================================================

function CurveArc({
  from,
  to,
  flip = false,
}: {
  from: string;
  to: string;
  flip?: boolean;
}) {
  return (
    <div className="relative" style={{ marginTop: -1, marginBottom: -1 }}>
      <svg
        viewBox="0 0 1440 80"
        className="w-full block"
        preserveAspectRatio="none"
        style={{ height: "80px", color: to }}
      >
        {flip ? (
          <path
            d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z"
            fill={to}
          />
        ) : (
          <path
            d="M0,80 C360,0 1080,0 1440,80 L1440,0 L0,0 Z"
            fill={from}
          />
        )}
      </svg>
    </div>
  );
}

// ============================================================
// Main Homepage Component
// ============================================================

export default function HomePage() {
  const [activeRole, setActiveRole] = useState<Role>("all");
  const [carbonData, setCarbonData] = useState<CarbonData | null>(null);
  const [materialData, setMaterialData] = useState<MaterialPricesData | null>(null);
  const [constructionData, setConstructionData] = useState<ConstructionData | null>(null);
  const [planningData, setPlanningData] = useState<PlanningData | null>(null);
  const [epcDemoData, setEpcDemoData] = useState<EPCDemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // Track which individual feeds have loaded for staggered reveal
  const [carbonLoaded, setCarbonLoaded] = useState(false);
  const [materialLoaded, setMaterialLoaded] = useState(false);
  const [constructionLoaded, setConstructionLoaded] = useState(false);
  const [planningLoaded, setPlanningLoaded] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setCarbonLoaded(false);
    setMaterialLoaded(false);
    setConstructionLoaded(false);
    setPlanningLoaded(false);

    try {
      // Fetch individually for staggered reveal
      const carbonPromise = fetch("/api/carbon-intensity")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setCarbonData(data);
          setCarbonLoaded(true);
          return data;
        });

      const materialPromise = fetch("/api/material-prices")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setMaterialData(data);
          setMaterialLoaded(true);
          return data;
        });

      const constructionPromise = fetch("/api/construction-output")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setConstructionData(data);
          setConstructionLoaded(true);
          return data;
        });

      const planningPromise = fetch("/api/planning")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setPlanningData(data);
          setPlanningLoaded(true);
          return data;
        });

      // Also fetch EPC demo data for the homepage card
      const epcPromise = fetch("/api/epc?postcode=EC1A+1BB")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setEpcDemoData(data);
          return data;
        });

      await Promise.all([carbonPromise, materialPromise, constructionPromise, planningPromise, epcPromise]);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Determine card relevance based on role
  const activeRoleConfig = ROLES.find((r) => r.id === activeRole);
  const relevantCards = activeRoleConfig?.relevantCards || [];

  function isRelevant(cardId: string) {
    if (activeRole === "all") return false; // no glow when showing all
    return relevantCards.includes(cardId);
  }

  function isDimmed(cardId: string) {
    if (activeRole === "all") return false;
    return !relevantCards.includes(cardId);
  }

  // Derived data
  const intensity = carbonData?.current?.intensity;
  const renewables =
    carbonData?.generation?.generationmix
      ?.filter((g) => ["wind", "solar", "hydro", "biomass"].includes(g.fuel))
      .reduce((sum, g) => sum + g.perc, 0) ?? 0;
  const biggestRise = materialData?.materials
    ? [...materialData.materials].sort((a, b) => b.yoyChange - a.yoyChange)[0]
    : null;
  const biggestFall = materialData?.materials
    ? [...materialData.materials].sort((a, b) => a.yoyChange - b.yoyChange)[0]
    : null;

  const filteredRegs =
    activeRole === "all"
      ? upcomingRegs
      : upcomingRegs.filter((r) => r.roles.includes(activeRole));

  // ============================================================
  // Snapshot data for each card (Canvas 2D download)
  // ============================================================

  const carbonSnapshot: SnapshotData | undefined = useMemo(() => {
    if (!carbonData || !intensity) return undefined;
    const val = intensity.actual || intensity.forecast;
    const topFuels = carbonData.generation?.generationmix
      ?.filter((g) => g.perc > 0)
      .sort((a, b) => b.perc - a.perc)
      .slice(0, 4);
    return {
      headline: `${val} gCO2/kWh`,
      headlineColor: getIntensityColor(intensity.index),
      subtitle: "UK Grid Carbon Intensity",
      stats: [
        { label: "Status", value: intensity.index, color: getIntensityColor(intensity.index) },
        { label: "Renewable", value: `${renewables.toFixed(1)}%`, color: "#00BFA5" },
        ...(topFuels?.slice(0, 2).map((g) => ({
          label: g.fuel.charAt(0).toUpperCase() + g.fuel.slice(1),
          value: `${g.perc.toFixed(1)}%`,
        })) || []),
      ],
      footer: "Source: National Grid ESO / Carbon Intensity API",
      variant: "dark" as const,
    };
  }, [carbonData, intensity, renewables]);

  const materialSnapshot: SnapshotData | undefined = useMemo(() => {
    if (!materialData) return undefined;
    const topStats = materialData.materials.slice(0, 4).map((m) => ({
      label: m.name,
      value: `${m.momChange > 0 ? "+" : ""}${m.momChange.toFixed(1)}% MoM`,
      color: m.momChange > 0.5 ? "#FF3D7F" : m.momChange < -0.5 ? "#00BFA5" : "#8A8A9A",
    }));
    return {
      headline: "Material Prices",
      subtitle: "UK Construction Materials Index",
      stats: topStats,
      footer: `Index (2015=100) / ${materialData.source.dataPeriod} / Source: ONS`,
      variant: "light" as const,
    };
  }, [materialData]);

  const constructionSnapshot: SnapshotData | undefined = useMemo(() => {
    if (!constructionData) return undefined;
    const momStr = constructionData.totalOutput.momChange != null
      ? `${constructionData.totalOutput.momChange > 0 ? "+" : ""}${constructionData.totalOutput.momChange.toFixed(1)}%`
      : "--";
    return {
      headline: formatGBP(constructionData.totalOutput.value),
      subtitle: "UK Construction Output",
      stats: [
        { label: "Month-on-month", value: momStr },
        { label: "New work", value: formatGBP(constructionData.newWork.value) },
        { label: "Repair & maintenance", value: formatGBP(constructionData.repairMaintenance.value) },
      ],
      footer: `${constructionData.period} / Source: ONS`,
      variant: "teal" as const,
    };
  }, [constructionData]);

  const planningSnapshot: SnapshotData | undefined = useMemo(() => {
    if (!planningData) return undefined;
    return {
      headline: `${planningData.summary.total.toLocaleString()} Decisions`,
      subtitle: "UK Planning Activity",
      stats: [
        { label: "Approved", value: String(planningData.summary.approved), color: "#10b981" },
        { label: "Refused", value: String(planningData.summary.refused), color: "#ef4444" },
        { label: "Pending", value: String(planningData.summary.pending), color: "#f59e0b" },
        { label: "Approval rate", value: `${planningData.summary.approvalRate}%`, color: "#10b981" },
      ],
      footer: `From ${planningData.summary.totalInDataset.toLocaleString()} total tracked / Source: Planning Portal`,
      variant: "light" as const,
    };
  }, [planningData]);

  const epcSnapshot: SnapshotData | undefined = useMemo(() => {
    if (!epcDemoData) return undefined;
    const certs = epcDemoData.certificates;
    const avgSap = certs.reduce((sum, c) => sum + c.sapScore, 0) / certs.length;
    const avgBand = sapToBand(avgSap);
    return {
      headline: `Band ${avgBand} / ${avgSap.toFixed(0)} SAP`,
      headlineColor: EPC_COLOURS[avgBand],
      subtitle: `EPC Ratings - ${epcDemoData.postcode}`,
      stats: [
        { label: "Certificates", value: String(epcDemoData.totalResults) },
        { label: "Average band", value: avgBand, color: EPC_COLOURS[avgBand] },
        { label: "Average SAP", value: avgSap.toFixed(0) },
      ],
      footer: "Source: DLUHC Energy Performance of Buildings Register",
      variant: "dark" as const,
    };
  }, [epcDemoData]);

  const regulationsSnapshot: SnapshotData | undefined = useMemo(() => {
    const regs = filteredRegs.slice(0, 4);
    if (regs.length === 0) return undefined;
    return {
      headline: "Upcoming Regulations",
      subtitle: "UK Built Environment Regulatory Timeline",
      stats: regs.map((r) => {
        const days = getDaysUntil(r.isoDate);
        const daysStr = days != null ? (days > 0 ? `${days}d` : "Now") : "TBC";
        return {
          label: r.title,
          value: `${r.date} (${daysStr})`,
          color: days != null && days <= 365 ? "#FF3D7F" : undefined,
        };
      }),
      footer: "Tracking Future Homes Standard, UK CBAM, EPC C Minimum, Part Z",
      variant: "dark" as const,
    };
  }, [filteredRegs]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ============================================================
          HERO SECTION - Full-width cream, massive headline
          ============================================================ */}
      <section className="relative bg-cream overflow-hidden">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `linear-gradient(var(--color-navy) 1px, transparent 1px), linear-gradient(90deg, var(--color-navy) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10 md:pt-24 md:pb-14">
          {/* Live indicator */}
          <div className="flex items-center gap-3 mb-8 animate-fade-in">
            <div className="h-3 w-3 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-sm font-semibold uppercase tracking-wider text-warm-gray">
              Live UK Data
            </span>
            {lastUpdated && (
              <span className="text-xs text-warm-gray/60 tabular-nums">
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <button
              onClick={fetchAllData}
              className="text-warm-gray/60 hover:text-navy transition-colors ml-1"
              title="Refresh all data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Massive headline */}
          <h1
            className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal leading-[0.95] tracking-tight animate-fade-in-delay-1"
          >
            Built Environment
            <br />
            <span className="relative inline-block">
              Intelligence
              <svg
                className="absolute -bottom-2 left-0 w-full underline-draw"
                viewBox="0 0 500 10"
                fill="none"
              >
                <path
                  d="M2 7C80 1 160 1 250 5C340 9 420 3 498 7"
                  stroke="#FF3D7F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="500"
                  strokeDashoffset="500"
                  className="animate-draw-line"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-warm-gray max-w-xl animate-fade-in-delay-2">
            Live construction data. Updated every 30 minutes.
          </p>

          {/* Hero animated counters */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl animate-fade-in-delay-3">
            {/* Carbon intensity */}
            <div className="rounded-2xl bg-charcoal p-6 text-white">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Grid Carbon Intensity
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl md:text-5xl font-bold"
                  style={{ color: intensity ? getIntensityColor(intensity.index) : "#8A8A9A" }}
                >
                  {intensity ? (
                    <AnimatedNumber
                      value={intensity.actual || intensity.forecast}
                      duration={1400}
                      startDelay={200}
                    />
                  ) : (
                    "--"
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">gCO2/kWh</p>
              {intensity && (
                <span
                  className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${getIntensityBg(intensity.index)}`}
                >
                  {intensity.index}
                </span>
              )}
            </div>

            {/* Renewable mix */}
            <div className="rounded-2xl bg-teal p-6 text-white">
              <p className="text-[10px] uppercase tracking-wider text-white/60 mb-2">
                Renewable Mix
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {carbonData ? (
                    <AnimatedNumber
                      value={renewables}
                      duration={1400}
                      decimals={1}
                      startDelay={400}
                    />
                  ) : (
                    "--"
                  )}
                </span>
                <span className="text-lg font-bold text-white/70">%</span>
              </div>
              <p className="text-xs text-white/60 mt-1">wind, solar, hydro, biomass</p>
            </div>

            {/* Construction output */}
            <div className="rounded-2xl bg-white p-6 text-navy shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-warm-gray mb-2">
                Construction Output
              </p>
              <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy">
                {constructionData?.totalOutput?.value
                  ? formatGBP(constructionData.totalOutput.value)
                  : "--"}
              </span>
              <p className="text-xs text-warm-gray mt-1">
                {constructionData?.period || "monthly total"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          ROLE SELECTOR SECTION
          ============================================================ */}
      <section className="bg-cream pt-2 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />
        </div>
      </section>

      {/* Curved arc: cream to cream-dark (into bento grid) */}
      <div className="relative" style={{ marginTop: -1, marginBottom: -1 }}>
        <svg
          viewBox="0 0 1440 60"
          className="w-full block"
          preserveAspectRatio="none"
          style={{ height: "60px" }}
        >
          <path
            d="M0,60 C360,0 1080,0 1440,60 L1440,0 L0,0 Z"
            fill="var(--color-cream)"
          />
        </svg>
      </div>

      {/* ============================================================
          BENTO DATA GRID
          ============================================================ */}
      <section className="bg-cream-dark py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-navy">
                Live Data Dashboard
              </h2>
              <p className="text-sm text-warm-gray mt-1">
                {activeRole === "all"
                  ? "Showing all data feeds"
                  : `Highlighting data for ${ROLES.find((r) => r.id === activeRole)?.label}s`}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy"
            >
              Full Dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* --------------------------------------------------------
                  ROW 1: Carbon Intensity (hero 2-col) + Material Prices (1-col)
                  -------------------------------------------------------- */}
              <div className="grid gap-5 md:grid-cols-3 mb-5">
                {/* CARBON INTENSITY - Hero card spanning 2 cols */}
                <DataCard
                  id="carbon-intensity"
                  title="Carbon Intensity"
                  icon={Zap}
                  variant="charcoal"
                  loading={!carbonLoaded}
                  relevant={isRelevant("carbon-intensity")}
                  dimmed={isDimmed("carbon-intensity")}
                  delay={0}
                  href="/dashboard/carbon-intensity"
                  sharePath="/dashboard/carbon-intensity"
                  className="md:col-span-2 min-h-[320px]"
                  snapshotData={carbonSnapshot}
                >
                  {carbonData && (
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span
                              className="text-5xl md:text-6xl font-bold tabular-nums"
                              style={{ color: getIntensityColor(intensity?.index || "") }}
                            >
                              <AnimatedNumber
                                value={intensity?.actual || intensity?.forecast || 0}
                                duration={1000}
                              />
                            </span>
                            <span className="text-sm text-gray-400">gCO2/kWh</span>
                          </div>
                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getIntensityBg(intensity?.index || "")}`}
                          >
                            {intensity?.index || "Loading..."}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-teal tabular-nums">
                            <AnimatedNumber value={renewables} duration={1200} decimals={1} />
                            <span className="text-lg">%</span>
                          </p>
                          <p className="text-xs text-gray-500">renewable</p>
                        </div>
                      </div>

                      {/* Forecast bars */}
                      <div className="mt-6">
                        <p className="text-xs text-gray-500 mb-2">Today&apos;s forecast</p>
                        <ForecastBars forecast={carbonData.forecast || []} />
                      </div>

                      {/* Generation mix pills */}
                      {carbonData.generation?.generationmix && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {carbonData.generation.generationmix
                            .filter((g) => g.perc > 0)
                            .sort((a, b) => b.perc - a.perc)
                            .slice(0, 6)
                            .map((g) => (
                              <span
                                key={g.fuel}
                                className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-gray-300"
                              >
                                {g.fuel} {g.perc.toFixed(1)}%
                              </span>
                            ))}
                        </div>
                      )}

                      {activeRole !== "all" && CARD_ROLE_TAGS["carbon-intensity"]?.[activeRole] && (
                        <div className="mt-4 pt-3 border-t border-gray-700/30">
                          <span className="text-xs text-teal font-medium">
                            {CARD_ROLE_TAGS["carbon-intensity"][activeRole]}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </DataCard>

                {/* MATERIAL PRICES */}
                <DataCard
                  id="material-prices"
                  title="Material Prices"
                  icon={Package}
                  variant="white"
                  loading={!materialLoaded}
                  relevant={isRelevant("material-prices")}
                  dimmed={isDimmed("material-prices")}
                  delay={1}
                  href="/dashboard/material-prices"
                  sharePath="/dashboard/material-prices"
                  className="min-h-[320px]"
                  snapshotData={materialSnapshot}
                >
                  {materialData && (
                    <div>
                      {/* Top movers */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="rounded-xl bg-cream p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3 text-pink" />
                            <span className="text-[9px] text-warm-gray uppercase tracking-wider">
                              Biggest rise
                            </span>
                          </div>
                          <p className="text-sm font-bold text-navy truncate">
                            {biggestRise?.name}
                          </p>
                          <p className="text-xs font-semibold text-pink tabular-nums">
                            +{biggestRise?.yoyChange.toFixed(1)}% YoY
                          </p>
                        </div>
                        <div className="rounded-xl bg-cream p-3">
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingDown className="h-3 w-3 text-teal" />
                            <span className="text-[9px] text-warm-gray uppercase tracking-wider">
                              Biggest fall
                            </span>
                          </div>
                          <p className="text-sm font-bold text-navy truncate">
                            {biggestFall?.name}
                          </p>
                          <p className="text-xs font-semibold text-teal tabular-nums">
                            {biggestFall?.yoyChange.toFixed(1)}% YoY
                          </p>
                        </div>
                      </div>

                      {/* Material list with sparklines */}
                      <div className="space-y-1">
                        {materialData.materials.slice(0, 4).map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 rounded-lg bg-cream/50 px-2.5 py-1.5"
                          >
                            <span className="text-[11px] font-medium text-navy flex-1 truncate">
                              {m.name}
                            </span>
                            <div className="w-12 h-5 shrink-0">
                              <MiniSparkline
                                data={m.sparkline}
                                color={getSparklineColor(m.trend)}
                                height={20}
                              />
                            </div>
                            <span
                              className={`text-[10px] font-semibold tabular-nums w-12 text-right shrink-0 ${
                                m.momChange > 0.5
                                  ? "text-pink"
                                  : m.momChange < -0.5
                                    ? "text-teal"
                                    : "text-warm-gray"
                              }`}
                            >
                              {m.momChange > 0 ? "+" : ""}
                              {m.momChange.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[9px] text-warm-gray/60 mt-2">
                        Index (2015=100) / {materialData.source.dataPeriod}
                      </p>

                      {activeRole !== "all" && CARD_ROLE_TAGS["material-prices"]?.[activeRole] && (
                        <div className="mt-3 pt-2 border-t border-cream-dark">
                          <span className="text-xs text-teal font-medium">
                            {CARD_ROLE_TAGS["material-prices"][activeRole]}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </DataCard>
              </div>

              {/* --------------------------------------------------------
                  ROW 2: Construction Output + Planning + EPC (3 cols)
                  -------------------------------------------------------- */}
              <div className="grid gap-5 md:grid-cols-3 mb-5">
                {/* CONSTRUCTION OUTPUT */}
                <DataCard
                  id="construction-output"
                  title="Construction Output"
                  icon={Building2}
                  variant="teal"
                  loading={!constructionLoaded}
                  relevant={isRelevant("construction-output")}
                  dimmed={isDimmed("construction-output")}
                  delay={2}
                  href="/dashboard/construction-output"
                  sharePath="/dashboard/construction-output"
                  snapshotData={constructionSnapshot}
                >
                  {constructionData && (
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <div>
                          <p className="text-3xl font-bold text-white tabular-nums">
                            {formatGBP(constructionData.totalOutput.value)}
                          </p>
                          <p className="text-xs text-white/60">
                            {constructionData.period} total
                          </p>
                        </div>
                        {constructionData.totalOutput.momChange != null && (
                          <div className="flex items-center gap-1 text-white/80">
                            {constructionData.totalOutput.momChange > 0 ? (
                              <TrendingUp className="h-3.5 w-3.5" />
                            ) : constructionData.totalOutput.momChange < 0 ? (
                              <TrendingDown className="h-3.5 w-3.5" />
                            ) : (
                              <Minus className="h-3.5 w-3.5" />
                            )}
                            <span className="text-sm font-semibold tabular-nums">
                              {constructionData.totalOutput.momChange > 0 ? "+" : ""}
                              {constructionData.totalOutput.momChange.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* New vs R&M */}
                      <div className="flex gap-2 mb-3">
                        <div className="flex-1 rounded-xl bg-white/15 p-2.5">
                          <p className="text-[9px] text-white/60 uppercase tracking-wider">New</p>
                          <p className="text-sm font-bold text-white tabular-nums">
                            {formatGBP(constructionData.newWork.value)}
                          </p>
                        </div>
                        <div className="flex-1 rounded-xl bg-white/15 p-2.5">
                          <p className="text-[9px] text-white/60 uppercase tracking-wider">R&M</p>
                          <p className="text-sm font-bold text-white tabular-nums">
                            {formatGBP(constructionData.repairMaintenance.value)}
                          </p>
                        </div>
                      </div>

                      {/* Trend chart */}
                      {constructionData.trend.filter((t) => t.value != null).length > 0 && (
                        <div style={{ height: 70, minHeight: 70 }}>
                          <ResponsiveContainer width="100%" height="100%" minHeight={70}>
                            <AreaChart
                              data={constructionData.trend.filter((t) => t.value != null)}
                              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
                            >
                              <defs>
                                <linearGradient id="outputGradTeal" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="month"
                                tick={{ fontSize: 8, fill: "rgba(255,255,255,0.5)" }}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                              />
                              <Tooltip content={<OutputTooltip />} />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="rgba(255,255,255,0.95)"
                                strokeWidth={2.5}
                                fill="url(#outputGradTeal)"
                                dot={false}
                                animationDuration={1200}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {activeRole !== "all" &&
                        CARD_ROLE_TAGS["construction-output"]?.[activeRole] && (
                          <div className="mt-3 pt-2 border-t border-white/20">
                            <span className="text-xs text-white font-medium">
                              {CARD_ROLE_TAGS["construction-output"][activeRole]}
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </DataCard>

                {/* PLANNING ACTIVITY */}
                <DataCard
                  id="planning"
                  title="Planning Activity"
                  icon={Landmark}
                  variant="white"
                  loading={!planningLoaded}
                  relevant={isRelevant("planning")}
                  dimmed={isDimmed("planning")}
                  delay={3}
                  href="/dashboard/planning"
                  sharePath="/dashboard/planning"
                  snapshotData={planningSnapshot}
                >
                  {planningData && (
                    <div>
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <p className="text-3xl font-bold text-navy tabular-nums">
                            <AnimatedNumber
                              value={planningData.summary.total}
                              duration={1200}
                            />
                          </p>
                          <p className="text-xs text-warm-gray">recent decisions</p>
                          <p className="text-[9px] text-warm-gray/60 mt-0.5">
                            from {planningData.summary.totalInDataset.toLocaleString()} total tracked
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-500 tabular-nums">
                            {planningData.summary.approvalRate}%
                          </p>
                          <p className="text-[10px] text-warm-gray">approval rate</p>
                        </div>
                      </div>

                      <PlanningBar summary={planningData.summary} />

                      {/* Legend */}
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Approved
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Refused
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Pending
                        </span>
                      </div>

                      {/* Quick stats */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="rounded-xl bg-cream p-2.5 text-center">
                          <p className="text-sm font-bold text-emerald-500 tabular-nums">
                            {planningData.summary.approved}
                          </p>
                          <p className="text-[9px] text-warm-gray">Approved</p>
                        </div>
                        <div className="rounded-xl bg-cream p-2.5 text-center">
                          <p className="text-sm font-bold text-red-500 tabular-nums">
                            {planningData.summary.refused}
                          </p>
                          <p className="text-[9px] text-warm-gray">Refused</p>
                        </div>
                        <div className="rounded-xl bg-cream p-2.5 text-center">
                          <p className="text-sm font-bold text-amber-500 tabular-nums">
                            {planningData.summary.pending}
                          </p>
                          <p className="text-[9px] text-warm-gray">Pending</p>
                        </div>
                      </div>

                      {activeRole !== "all" && CARD_ROLE_TAGS["planning"]?.[activeRole] && (
                        <div className="mt-3 pt-2 border-t border-cream-dark">
                          <span className="text-xs text-teal font-medium">
                            {CARD_ROLE_TAGS["planning"][activeRole]}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </DataCard>

                {/* EPC LOOKUP */}
                <DataCard
                  id="epc"
                  title="EPC Lookup"
                  icon={Building}
                  variant="charcoal"
                  loading={false}
                  relevant={isRelevant("epc")}
                  dimmed={isDimmed("epc")}
                  delay={4}
                  href="/dashboard/epc"
                  sharePath="/dashboard/epc"
                  snapshotData={epcSnapshot}
                >
                  <div>
                    {epcDemoData ? (() => {
                      const certs = epcDemoData.certificates;
                      const avgSap = certs.reduce((sum, c) => sum + c.sapScore, 0) / certs.length;
                      const avgBand = sapToBand(avgSap);
                      const bandCounts = EPC_BANDS.map((band) => ({
                        band,
                        count: certs.filter((c) => c.currentRating?.toUpperCase() === band).length,
                      }));
                      const maxCount = Math.max(...bandCounts.map((b) => b.count), 1);

                      return (
                        <>
                          <div className="flex items-end justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-flex items-center justify-center h-10 w-10 rounded font-bold text-white text-lg"
                                  style={{ backgroundColor: EPC_COLOURS[avgBand] }}
                                >
                                  {avgBand}
                                </span>
                                <div>
                                  <p className="text-xl font-bold text-white tabular-nums">
                                    {avgSap.toFixed(0)} SAP
                                  </p>
                                  <p className="text-[10px] text-gray-400">average rating</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-white tabular-nums">
                                {epcDemoData.totalResults}
                              </p>
                              <p className="text-[10px] text-gray-400">certificates</p>
                            </div>
                          </div>

                          {/* Mini distribution bars */}
                          <div className="flex items-end gap-1 mb-3" style={{ height: 48 }}>
                            {bandCounts.map(({ band, count }) => (
                              <div key={band} className="flex-1 flex flex-col items-center justify-end h-full">
                                <motion.div
                                  className="w-full rounded-t"
                                  style={{ backgroundColor: EPC_COLOURS[band] }}
                                  initial={{ height: 0 }}
                                  animate={{ height: count > 0 ? `${Math.max((count / maxCount) * 100, 8)}%` : "4%" }}
                                  transition={{ duration: 0.5, delay: EPC_BANDS.indexOf(band) * 0.05 }}
                                />
                                <p className="text-[9px] font-bold text-gray-400 mt-1">{band}</p>
                              </div>
                            ))}
                          </div>

                          <p className="text-[9px] text-gray-500 mb-3">
                            Showing sample data for {epcDemoData.postcode} - search any postcode
                          </p>
                        </>
                      );
                    })() : (
                      <>
                        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2 text-white">
                          Energy Performance
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">
                          Search any UK postcode for EPC ratings, energy efficiency, and building fabric
                          data.
                        </p>
                        {/* EPC scale */}
                        <div className="space-y-1 mb-4">
                          {EPC_BANDS.map((band, i) => (
                            <div key={band} className="flex items-center gap-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - i * 12}%` }}
                                transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
                                className="h-4 rounded-r-md flex items-center justify-end pr-2"
                                style={{ backgroundColor: EPC_COLOURS[band] }}
                              >
                                <span className="text-[9px] font-bold text-white">{band}</span>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <Link
                      href="/dashboard/epc"
                      className="flex items-center gap-2 rounded-xl bg-navy-light border border-gray-700/40 px-4 py-2.5 text-sm text-gray-400 hover:border-teal/50 hover:text-teal transition-all"
                    >
                      <Search className="h-4 w-4" />
                      Search a postcode...
                    </Link>

                    {activeRole !== "all" && CARD_ROLE_TAGS["epc"]?.[activeRole] && (
                      <div className="mt-4 pt-2 border-t border-gray-700/30">
                        <span className="text-xs text-teal font-medium">
                          {CARD_ROLE_TAGS["epc"][activeRole]}
                        </span>
                      </div>
                    )}
                  </div>
                </DataCard>
              </div>

              {/* --------------------------------------------------------
                  ROW 3: Regulation Tracker (2-col) + Quick Tools (1-col)
                  -------------------------------------------------------- */}
              <div className="grid gap-5 md:grid-cols-3">
                {/* REGULATION TRACKER - spans 2 cols */}
                <DataCard
                  id="regulations"
                  title="Regulation Tracker"
                  icon={Shield}
                  variant="navy"
                  loading={false}
                  relevant={isRelevant("regulations")}
                  dimmed={isDimmed("regulations")}
                  delay={5}
                  href="/regulations"
                  sharePath="/regulations"
                  className="md:col-span-2"
                  snapshotData={regulationsSnapshot}
                >
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-4 text-white">
                      Upcoming Regulations
                    </h3>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {filteredRegs.map((reg, i) => (
                        <motion.div
                          key={reg.title}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                          className="flex items-center justify-between rounded-xl bg-navy-light/70 px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">
                              {reg.title}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{reg.description}</p>
                          </div>
                          <div className="shrink-0 ml-3 flex flex-col items-end gap-0.5">
                            <span className="rounded-full bg-pink/20 px-3 py-1 text-[10px] font-bold text-pink">
                              {reg.date}
                            </span>
                            {(() => {
                              const days = getDaysUntil(reg.isoDate);
                              if (days == null) return null;
                              return (
                                <span className={`text-[9px] font-semibold tabular-nums ${days <= 365 ? "text-pink-light" : "text-gray-400"}`}>
                                  {days > 0 ? `${days} days` : "Imminent"}
                                </span>
                              );
                            })()}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {activeRole !== "all" && CARD_ROLE_TAGS["regulations"]?.[activeRole] && (
                      <div className="mt-4 pt-3 border-t border-gray-700/30">
                        <span className="text-xs text-teal font-medium">
                          {CARD_ROLE_TAGS["regulations"][activeRole]}
                        </span>
                      </div>
                    )}
                  </div>
                </DataCard>

                {/* QUICK TOOLS - pink accent card */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: isDimmed("regulations") ? 0.45 : 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="rounded-3xl bg-pink p-6 text-white flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4.5 w-4.5 text-white" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                        Quick Tools
                      </span>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-2">
                    Explore our tools
                  </h3>
                  <p className="text-sm text-white/70 mb-6">
                    Calculators, databases, and plain-English guides for sustainable construction.
                  </p>

                  <div className="space-y-2 mt-auto">
                    <Link
                      href="/materials"
                      className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/25 transition-colors"
                    >
                      <Calculator className="h-4 w-4" />
                      Carbon Calculator
                      <ArrowUpRight className="h-3.5 w-3.5 ml-auto opacity-60" />
                    </Link>
                    <Link
                      href="/knowledge"
                      className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/25 transition-colors"
                    >
                      <BookOpen className="h-4 w-4" />
                      Knowledge Hub
                      <ArrowUpRight className="h-3.5 w-3.5 ml-auto opacity-60" />
                    </Link>
                    <Link
                      href="/regulations"
                      className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/25 transition-colors"
                    >
                      <Shield className="h-4 w-4" />
                      Regulation Timeline
                      <ArrowUpRight className="h-3.5 w-3.5 ml-auto opacity-60" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Curved arc: cream-dark into research section */}
      <CurveArc from="var(--color-cream-dark)" to="var(--color-charcoal)" flip />

      {/* ============================================================
          RESEARCH PREVIEW
          ============================================================ */}
      <section className="bg-charcoal py-16 md:py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink">
              Research
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl">
              Original Research
            </h2>
          </div>

          <Link
            href="/research/ai-construction-search"
            className="group block rounded-3xl bg-navy p-6 md:p-8 border border-white/10 transition-all hover:border-white/20 hover:shadow-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink/20 shrink-0 mb-4 md:mb-0">
                <Brain className="h-7 w-7 text-pink" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="inline-flex items-center rounded-full bg-pink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Coming Soon - Q2 2026
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-white leading-snug">
                  AI in Construction: How the Industry Searches, Discovers & Decides
                </h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed max-w-2xl">
                  The UK&apos;s first study into how construction professionals use AI tools like
                  ChatGPT, Claude, and Google AI Overviews to find and evaluate suppliers,
                  products, and services.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal transition-colors group-hover:text-white">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Curved arc: charcoal to navy */}
      <CurveArc from="var(--color-charcoal)" to="var(--color-navy)" flip />

      {/* ============================================================
          INDUSTRY CONTEXT STRIP
          ============================================================ */}
      <section className="bg-navy py-16 md:py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink">
              The Challenge
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-5xl leading-tight">
              A regulatory avalanche is coming
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
            {[
              {
                value: "25%",
                label: "of UK carbon from the built environment",
                color: "text-teal",
                bg: "bg-charcoal",
              },
              {
                value: "8%",
                label: "of global CO2 from cement alone",
                color: "text-pink",
                bg: "bg-navy-light",
              },
              {
                value: "78%",
                label: "carbon reduction target by 2035",
                color: "text-teal",
                bg: "bg-navy-light",
              },
              {
                value: "10+",
                label: "major regulations by 2030",
                color: "text-pink",
                bg: "bg-charcoal",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl ${stat.bg} p-6 text-center`}
              >
                <p className={`text-4xl md:text-5xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Curved arc: navy to cream */}
      <CurveArc from="var(--color-navy)" to="var(--color-cream)" flip />

      {/* ============================================================
          EXPLORE SECTION - Bento tool links
          ============================================================ */}
      <section className="bg-cream py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
              Explore
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-5xl">
              Go deeper
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {[
              {
                title: "Live Dashboard",
                description:
                  "Full carbon, material, construction, and planning data with deep-dive widgets.",
                href: "/dashboard",
                icon: Zap,
                bg: "bg-charcoal",
                text: "text-white",
              },
              {
                title: "Carbon Calculator",
                description:
                  "Search 100+ materials from the ICE database. Compare embodied carbon.",
                href: "/materials",
                icon: Search,
                bg: "bg-teal",
                text: "text-white",
              },
              {
                title: "Regulation Tracker",
                description:
                  "Every upcoming UK sustainability regulation in one timeline.",
                href: "/regulations",
                icon: Shield,
                bg: "bg-pink",
                text: "text-white",
              },
              {
                title: "Knowledge Hub",
                description:
                  "Plain-English guides to embodied carbon, Part Z, and more.",
                href: "/knowledge",
                icon: Leaf,
                bg: "bg-navy",
                text: "text-white",
              },
            ].map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={tool.href}
                    className={`group block rounded-3xl p-7 transition-all hover:shadow-2xl hover:-translate-y-1 ${tool.bg} ${tool.text} h-full`}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <Icon className="h-7 w-7 opacity-80" />
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold">{tool.title}</h3>
                    <p className="mt-2 text-sm opacity-70 leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          DATA SOURCES
          ============================================================ */}
      <section className="bg-white py-10 border-t border-cream-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-4">
            Data Sources
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              {
                name: "National Grid ESO",
                url: "https://carbonintensity.org.uk",
              },
              {
                name: "Department for Business and Trade",
                url: "https://www.gov.uk/government/statistics/building-materials-and-components-statistics-february-2026",
              },
              {
                name: "ONS Construction Output",
                url: "https://www.ons.gov.uk/businessindustryandtrade/constructionindustry",
              },
              {
                name: "Planning Data England",
                url: "https://www.planning.data.gov.uk",
              },
              {
                name: "DLUHC EPC Open Data",
                url: "https://epc.opendatacommunities.org/",
              },
            ].map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-warm-gray hover:text-teal transition-colors"
              >
                {source.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FABRICK CTA
          ============================================================ */}
      <FabrickMarketingCTA />
    </div>
  );
}
