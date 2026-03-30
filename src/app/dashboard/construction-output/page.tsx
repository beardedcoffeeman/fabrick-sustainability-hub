import { Metadata } from "next";
import { ConstructionOutputWidget } from "@/components/dashboard/ConstructionOutputWidget";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Zap, Package, Landmark, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UK Construction Output Data - Monthly ONS Statistics | Fabrick",
  description:
    "Live UK construction sector output data from ONS - new work, repair & maintenance, sector breakdown. Monthly statistics for private housing, infrastructure, commercial, and industrial.",
  keywords: [
    "UK construction output",
    "construction output ONS",
    "construction statistics UK",
    "new build output UK",
    "construction sector data",
    "private housing output",
    "infrastructure construction UK",
    "repair maintenance construction",
    "construction industry statistics",
  ],
  openGraph: {
    title: "UK Construction Output Data - Monthly ONS Statistics | Fabrick",
    description:
      "Live UK construction sector output data from ONS - new work, repair & maintenance, sector breakdown.",
    url: "https://sustainability.fabrick.agency/dashboard/construction-output",
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

export default function ConstructionOutputPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Construction Output" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Monthly Data
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            UK Construction Output
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-gray-400">
            Monthly construction output data from the ONS. Total sector activity,
            new work vs repair and maintenance, and breakdown by sector -- private
            housing, public, infrastructure, commercial, and industrial.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ConstructionOutputWidget />
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
