import { Metadata } from "next";
import { MaterialPricesWidget } from "@/components/dashboard/MaterialPricesWidget";
import { MaterialPricesAnalysis } from "@/components/dashboard/MaterialPricesAnalysis";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Zap, Building2, Landmark, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "What's moving in the UK construction materials basket? | Fabrick",
  description:
    "Latest published price indices for 28 UK construction materials from the Department for Business and Trade. Time procurement, evidence price changes in tenders, spot substitution wins.",
  keywords: [
    "construction material prices UK",
    "steel price index UK",
    "timber prices UK",
    "concrete price index",
    "construction cost index",
    "building material costs",
    "DBT material price indices",
    "ONS construction materials",
    "aggregates price UK",
    "brick prices UK",
  ],
  openGraph: {
    title:
      "What's moving in the UK construction materials basket? | Fabrick",
    description:
      "28 monthly price indices from DBT. Movers, substitution wins and procurement timing for the people building Britain.",
    url: "https://fabrick-sustainability-hub.vercel.app/dashboard/material-prices",
  },
};

const otherSections = [
  {
    href: "/dashboard/carbon-intensity",
    label: "Carbon Intensity",
    description: "Live UK grid carbon intensity and generation mix",
    icon: Zap,
    color: "bg-charcoal text-teal",
  },
  {
    href: "/dashboard/construction-output",
    label: "Construction Output",
    description: "Monthly ONS construction output data",
    icon: Building2,
    color: "bg-teal/10 text-teal",
  },
  {
    href: "/dashboard/planning",
    label: "Planning Activity",
    description: "Recent planning decisions across England",
    icon: Landmark,
    color: "bg-navy/10 text-navy",
  },
  {
    href: "/dashboard/epc",
    label: "EPC Lookup",
    description: "Search Energy Performance Certificates by postcode",
    icon: Home,
    color: "bg-charcoal/10 text-charcoal",
  },
];

export default function MaterialPricesPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Material Prices" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
              Fabrick Analysis
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl leading-[1.05]">
            What&rsquo;s moving in the UK construction materials basket?
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">
            28 monthly price indices from the Department for Business and
            Trade. Use it to time procurement, evidence price changes in
            tenders, and spot the materials worth substituting.
          </p>
        </div>
      </section>

      {/* Analysis layer - biggest movers, cost-vs-carbon, substitution wins */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <MaterialPricesAnalysis />
      </section>

      {/* Full index - supporting data, not the headline */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white p-1 border border-charcoal/[0.06]">
          <div className="px-5 pt-5 pb-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-warm-gray">
              Full Index
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-navy mt-1">
              All material indices
            </h2>
            <p className="text-xs text-warm-gray mt-1">
              Every material in the basket, with month-on-month and year-on-year
              changes. Source: DBT Building Materials and Components Statistics.
            </p>
          </div>
          <div className="p-4">
            <MaterialPricesWidget />
          </div>
        </div>
      </section>

      {/* Explore More Data */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="border-t border-cream-dark pt-8">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy mb-6">
            Explore more data
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${section.color} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-navy group-hover:text-teal transition-colors">
                    {section.label}
                  </h3>
                  <p className="text-xs text-warm-gray mt-1">{section.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-teal font-medium mt-3">
                    Open dashboard <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
