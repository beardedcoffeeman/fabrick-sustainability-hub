import { Metadata } from "next";
import { PlanningActivitySection } from "@/components/dashboard/PlanningActivitySection";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Zap, Package, Building2, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What commercial work is getting built across the UK? | Fabrick",
  description:
    "Live tracker for UK commercial planning applications. See which commercial schemes are being approved, refused or are still in the pipeline - switch tabs for residential, mixed-use or all classified work.",
  keywords: [
    "UK commercial planning applications",
    "commercial development UK",
    "planning decisions England",
    "planning application tracker",
    "commercial approval rate",
    "development pipeline UK",
    "planning permission tracker",
    "construction planning applications",
  ],
  openGraph: {
    title: "What commercial work is getting built across the UK? | Fabrick",
    description:
      "Live tracker for UK commercial planning applications, with tabs for residential, mixed-use and all classified work.",
    url: "https://sustainability.fabrick.agency/dashboard/planning",
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
    href: "/dashboard/material-prices",
    label: "Material Prices",
    description: "Monthly price indices for key construction materials",
    icon: Package,
    color: "bg-pink/10 text-pink",
  },
  {
    href: "/dashboard/construction-output",
    label: "Construction Output",
    description: "Monthly ONS construction output data",
    icon: Building2,
    color: "bg-teal/10 text-teal",
  },
  {
    href: "/dashboard/epc",
    label: "EPC Lookup",
    description: "Search Energy Performance Certificates by postcode",
    icon: Home,
    color: "bg-charcoal/10 text-charcoal",
  },
];

export default function PlanningPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Planning Activity" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Live Data
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            What commercial work is getting built across the UK?
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-gray-400">
            Live planning decisions from English local authorities, filtered to
            commercial schemes by default using the MHCLG development
            classification. Use the tabs to switch to residential, mixed-use or
            every classified application.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <PlanningActivitySection />
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
                    View live data <ArrowRight className="h-3 w-3" />
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
