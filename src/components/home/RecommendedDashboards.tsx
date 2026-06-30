"use client";

import Link from "next/link";
import {
  Zap,
  Package,
  Building2,
  Landmark,
  Building,
  Telescope,
  Star,
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
import { track } from "@/lib/analytics";

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
    id: "planning-explorer",
    title: "Planning Explorer",
    href: "/research/planning-explorer",
    icon: Telescope,
    insight: "Where is the sector active right now?",
    detail:
      "Real UK planning applications by sector and region, the most active local authorities, and conditions extracted from decision notices.",
    cta: "Explore the data",
    metric: { value: "8 sectors", label: "Live planning intelligence" },
    chart: {
      shape: "bars",
      tone: "neutral",
      data: [30, 44, 38, 52, 41, 58, 47, 63, 55, 70, 61, 74],
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

// Role → recommended dashboards (priority-ordered, top surface).
const RECOMMENDATIONS: Record<Exclude<Role, "all">, string[]> = {
  architect: ["material-prices", "carbon-intensity", "construction-output"],
  specifier: ["material-prices", "planning-explorer", "carbon-intensity"],
  "site-manager": ["carbon-intensity", "construction-output", "planning"],
  contractor: ["planning-explorer", "construction-output", "material-prices"],
  manufacturer: ["planning-explorer", "material-prices", "construction-output"],
  "sustainability-lead": ["carbon-intensity", "material-prices", "epc"],
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
    "Finding live schemes, tracking demand and specifier behaviour? Start here.",
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

function DashboardCardView({
  card,
  context,
  favourite,
  onToggleFavourite,
}: {
  card: DashboardCard;
  context: "favourite" | "recommended";
  favourite: boolean;
  onToggleFavourite: (id: string) => void;
}) {
  const Icon = card.icon;
  return (
    // Relative wrapper so the pin button can sit OUTSIDE the <Link> (a button
    // nested inside an anchor is invalid and breaks keyboard/AT behaviour).
    <div className="relative">
      <button
        type="button"
        aria-pressed={favourite}
        aria-label={favourite ? `Unpin ${card.title}` : `Pin ${card.title}`}
        title={favourite ? "Unpin from your dashboards" : "Pin to your dashboards"}
        onClick={() => onToggleFavourite(card.id)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm border border-charcoal/[0.06] transition-colors hover:bg-cream"
      >
        <Star
          className={`h-4 w-4 transition-colors ${
            favourite ? "fill-pink text-pink" : "text-warm-gray/50"
          }`}
        />
      </button>

      <Link
        href={card.href}
        onClick={() =>
          track("dashboard_opened", { dashboard: card.id, context })
        }
        className="group block rounded-2xl bg-white border border-charcoal/[0.06] p-6 transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
      >
        <div className="flex items-center justify-between mb-4 pr-9">
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
    </div>
  );
}

export function RecommendedDashboards({
  activeRole,
  isFavourite,
  onToggleFavourite,
}: {
  activeRole: Role;
  isFavourite?: (id: string) => boolean;
  onToggleFavourite?: (id: string) => void;
}) {
  const fav = isFavourite ?? (() => false);
  const toggle = onToggleFavourite ?? (() => {});

  const cards =
    activeRole === "all"
      ? ALL_CARDS
      : (RECOMMENDATIONS[activeRole] ?? [])
          .map((id) => ALL_CARDS.find((c) => c.id === id))
          .filter((c): c is DashboardCard => !!c);

  // Pinned dashboards, surfaced first so a returning visitor's set is "already
  // there". Hydration-safe via useSyncExternalStore: empty on the server/first
  // paint, then populated once prefs sync.
  const favouriteCards = ALL_CARDS.filter((c) => fav(c.id));

  const lead =
    activeRole === "all"
      ? "Every live dashboard. Pick a role above to see the ones most useful for you, and pin the ones you use most."
      : ROLE_QUESTIONS[activeRole];

  return (
    <div>
      {favouriteCards.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Star className="h-4 w-4 fill-pink text-pink" />
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-navy">
              Your dashboards
            </h4>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favouriteCards.map((card) => (
              <DashboardCardView
                key={card.id}
                card={card}
                context="favourite"
                favourite
                onToggleFavourite={toggle}
              />
            ))}
          </div>
          <div className="mt-10 border-t border-charcoal/[0.08]" />
        </div>
      )}

      <p className="text-center text-sm text-warm-gray mb-6 max-w-2xl mx-auto">
        {lead}
      </p>

      <div
        className={`grid gap-4 ${
          activeRole === "all"
            ? "md:grid-cols-2 lg:grid-cols-3"
            : "md:grid-cols-3"
        }`}
      >
        {cards.map((card) => (
          <DashboardCardView
            key={card.id}
            card={card}
            context="recommended"
            favourite={fav(card.id)}
            onToggleFavourite={toggle}
          />
        ))}
      </div>
    </div>
  );
}
