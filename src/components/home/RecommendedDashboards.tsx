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
import type { Role } from "./RoleSelector";

interface DashboardCard {
  id: string;
  title: string;
  href: string;
  icon: React.ElementType;
  insight: string;
  detail: string;
  cta: string;
}

const ALL_CARDS: DashboardCard[] = [
  {
    id: "carbon-intensity",
    title: "UK Grid Carbon",
    href: "/dashboard/carbon-intensity",
    icon: Zap,
    insight: "When is the UK grid cleanest?",
    detail:
      "90-day heatmap by hour and day, best-window finder, regional drill-down and Fabrick analysis on scope-2 scheduling.",
    cta: "See the analysis",
  },
  {
    id: "material-prices",
    title: "Material Prices",
    href: "/dashboard/material-prices",
    icon: Package,
    insight: "What's moving in the UK construction basket.",
    detail:
      "Biggest YoY risers and fallers, cost-vs-carbon scatter, high-impact substitution savings ladder.",
    cta: "See the analysis",
  },
  {
    id: "construction-output",
    title: "Construction Output",
    href: "/dashboard/construction-output",
    icon: Building2,
    insight: "Where UK construction is growing - and shrinking.",
    detail:
      "Monthly ONS sector output across housing, infrastructure, commercial, repair & maintenance.",
    cta: "Open dashboard",
  },
  {
    id: "planning",
    title: "Planning Activity",
    href: "/dashboard/planning",
    icon: Landmark,
    insight: "What's getting built - and where.",
    detail:
      "Recent UK planning applications and decisions, with approval rates by local authority.",
    cta: "Open dashboard",
  },
  {
    id: "epc",
    title: "EPC Lookup",
    href: "/dashboard/epc",
    icon: Building,
    insight: "Energy ratings for any UK postcode.",
    detail:
      "Live MHCLG register: address-level energy bands and registration dates, with link to the full certificate.",
    cta: "Search the register",
  },
];

// Role → recommended dashboards (priority-ordered, top 3 surface).
// Uses the same role keys as RoleSelector. "all" never reaches this component
// (page renders the empty-state branch instead).
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

export function RecommendedDashboards({ activeRole }: { activeRole: Role }) {
  if (activeRole === "all") return null;

  const ids = RECOMMENDATIONS[activeRole] ?? [];
  const cards = ids
    .map((id) => ALL_CARDS.find((c) => c.id === id))
    .filter((c): c is DashboardCard => !!c);

  return (
    <div>
      <p className="text-center text-sm text-warm-gray mb-6">
        Recommended for {ROLE_LABELS[activeRole]} -{" "}
        <Link
          href="/dashboard"
          className="text-teal font-semibold hover:underline"
        >
          see all dashboards
        </Link>
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.id}
              href={card.href}
              className="group block rounded-2xl bg-white border border-charcoal/[0.06] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream">
                  <Icon className="h-4 w-4 text-teal" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-warm-gray/60">
                  Snapshot
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-navy leading-snug">
                {card.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-navy">
                {card.insight}
              </p>
              <p className="mt-2 text-xs text-warm-gray leading-relaxed">
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

      {/* Combined dashboard CTA */}
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
