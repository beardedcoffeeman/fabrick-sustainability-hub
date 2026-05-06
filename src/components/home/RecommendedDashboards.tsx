"use client";

import Link from "next/link";
import {
  Zap,
  Package,
  Building2,
  Landmark,
  Building,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import type { Role } from "./RoleSelector";

type ChartShape = "spark" | "bars";

interface DashboardCard {
  id: string;
  title: string;
  href: string;
  icon: React.ElementType;
  insight: string;
  detail: string;
  cta: string;
  metric: { value: string; label: string };
  chart: { shape: ChartShape; data: number[]; tone: "rise" | "fall" | "neutral" };
}

const ALL_CARDS: DashboardCard[] = [
  {
    id: "carbon-intensity",
    title: "UK Grid Carbon",
    href: "/dashboard/carbon-intensity",
    icon: Zap,
    insight: "When is the UK grid cleanest?",
    detail:
      "Live carbon intensity, 90-day heatmap by hour and day, and Fabrick analysis on scope-2 scheduling.",
    cta: "See the analysis",
    metric: { value: "~28%", label: "Sun 3am vs avg" },
    chart: {
      shape: "spark",
      tone: "fall",
      data: [220, 185, 170, 155, 130, 110, 95, 105, 130, 165, 190, 210, 195, 175],
    },
  },
  {
    id: "material-prices",
    title: "Material Prices",
    href: "/dashboard/material-prices",
    icon: Package,
    insight: "What's moving in the construction basket?",
    detail:
      "Biggest YoY risers and fallers, cost-vs-carbon scatter, high-impact substitution savings.",
    cta: "See the analysis",
    metric: { value: "+7.6%", label: "Imported timber YoY" },
    chart: {
      shape: "spark",
      tone: "rise",
      data: [100, 101, 99, 102, 104, 103, 105, 106, 105, 107, 108, 107.5],
    },
  },
  {
    id: "construction-output",
    title: "Construction Output",
    href: "/dashboard/construction-output",
    icon: Building2,
    insight: "Where is UK construction growing?",
    detail:
      "Monthly ONS sector output across housing, infrastructure, commercial and repair & maintenance.",
    cta: "Open dashboard",
    metric: { value: "£170bn", label: "Annual output" },
    chart: {
      shape: "bars",
      tone: "neutral",
      data: [62, 58, 64, 67, 65, 69, 71, 68, 72, 70, 73, 75],
    },
  },
  {
    id: "planning",
    title: "Planning Activity",
    href: "/dashboard/planning",
    icon: Landmark,
    insight: "What's getting built, and where?",
    detail:
      "Recent UK planning applications and decisions, with approval rates by local authority.",
    cta: "Open dashboard",
    metric: { value: "~85%", label: "Approval rate" },
    chart: {
      shape: "bars",
      tone: "neutral",
      data: [42, 38, 45, 41, 47, 44, 49, 46, 51, 48, 53, 50],
    },
  },
  {
    id: "epc",
    title: "EPC Lookup",
    href: "/dashboard/epc",
    icon: Building,
    insight: "How efficient is any UK postcode?",
    detail:
      "Live MHCLG register: address-level energy bands and registration dates, with the full certificate.",
    cta: "Search the register",
    metric: { value: "~60%", label: "Below band C" },
    chart: {
      shape: "bars",
      tone: "neutral",
      data: [3, 8, 22, 35, 21, 8, 3], // EPC band distribution A-G
    },
  },
];

// Role → recommended dashboards (priority-ordered, top 3 surface).
const RECOMMENDATIONS: Record<Exclude<Role, "all">, string[]> = {
  architect: ["material-prices", "carbon-intensity", "construction-output"],
  specifier: ["material-prices", "carbon-intensity", "construction-output"],
  "site-manager": ["carbon-intensity", "construction-output", "planning"],
  contractor: ["carbon-intensity", "material-prices", "planning"],
  manufacturer: ["material-prices", "construction-output", "epc"],
  "sustainability-lead": ["carbon-intensity", "material-prices", "epc"],
};

const ROLE_LABELS: Record<Exclude<Role, "all">, string> = {
  architect: "architects",
  specifier: "specifiers",
  "site-manager": "site managers",
  contractor: "contractors",
  manufacturer: "manufacturers",
  "sustainability-lead": "sustainability leads",
};

const ROLE_QUESTIONS: Record<Exclude<Role, "all">, string> = {
  architect:
    "Specifying materials, hitting Part L and chasing carbon targets? Start here.",
  specifier:
    "Finding lower-carbon swaps and benchmarking spec choices? Start here.",
  "site-manager":
    "Scheduling site work and watching grid carbon? Start here.",
  contractor:
    "Tendering, tracking pipeline and watching input costs? Start here.",
  manufacturer:
    "Tracking demand, EPCs and specifier behaviour? Start here.",
  "sustainability-lead":
    "Building the carbon roadmap across projects? Start here.",
};

function CardChart({ shape, data, tone }: DashboardCard["chart"]) {
  const stroke =
    tone === "rise" ? "#E7467A" : tone === "fall" ? "#10B981" : "#0EA5A4";
  const chartData = data.map((v, i) => ({ i, v }));
  const gradientId = `card-grad-${tone}-${shape}-${data.length}`;

  if (shape === "bars") {
    return (
      <ResponsiveContainer width="100%" height={44}>
        <BarChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <YAxis hide domain={[0, "dataMax + 5"]} />
          <Bar dataKey="v" fill={stroke} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
        <Area
          type="monotone"
          dataKey="v"
          stroke={stroke}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RecommendedDashboards({ activeRole }: { activeRole: Role }) {
  const cards =
    activeRole === "all"
      ? ALL_CARDS
      : (RECOMMENDATIONS[activeRole] ?? [])
          .map((id) => ALL_CARDS.find((c) => c.id === id))
          .filter((c): c is DashboardCard => !!c);

  const lead =
    activeRole === "all"
      ? "All five live dashboards. Pick a role above to see the three most useful for you."
      : ROLE_QUESTIONS[activeRole];

  return (
    <div>
      <p className="text-center text-sm text-warm-gray mb-6 max-w-2xl mx-auto">
        {lead}
      </p>

      <div className={`grid gap-4 ${activeRole === "all" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-3"}`}>
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="group block rounded-2xl bg-white border border-charcoal/[0.06] p-6 transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream">
                  <Icon className="h-4 w-4 text-teal" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-warm-gray/60">
                  {card.title}
                </span>
              </div>

              {/* Sensational headline (the question this dashboard answers) */}
              <h3 className="font-[family-name:var(--font-playfair)] text-[1.35rem] md:text-[1.45rem] font-bold text-navy leading-[1.15] tracking-tight">
                {card.insight}
              </h3>

              {/* Live mini-chart */}
              <div className="mt-4 h-[44px]">
                <CardChart {...card.chart} />
              </div>

              {/* Headline metric */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold tabular-nums text-navy">
                  {card.metric.value}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-warm-gray/70">
                  {card.metric.label}
                </span>
              </div>

              <p className="mt-3 text-xs text-warm-gray leading-relaxed">
                {card.detail}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal transition-all group-hover:gap-2.5">
                {card.cta}
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-charcoal/20 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal transition-all hover:bg-charcoal hover:text-white hover:border-charcoal"
        >
          <LayoutDashboard className="h-4 w-4" />
          Open the combined dashboard
        </Link>
      </div>
    </div>
  );
}
