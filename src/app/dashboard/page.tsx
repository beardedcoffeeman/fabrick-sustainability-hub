import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  Zap,
  Package,
  Building2,
  Landmark,
  Home,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Live Dashboard | Fabrick Built Environment Data",
  description:
    "Live UK construction data: carbon intensity, material prices, construction output, planning activity, and EPC ratings. All in one place.",
};

const sections = [
  {
    id: "carbon-intensity",
    href: "/dashboard/carbon-intensity",
    label: "Carbon Intensity",
    description:
      "Real-time UK grid carbon intensity from the National Grid ESO. Generation mix, regional data, and forecasts.",
    icon: Zap,
    iconBg: "bg-charcoal",
    iconColor: "text-teal",
    cardClass: "md:col-span-2 bg-charcoal text-white",
    descClass: "text-gray-400",
    titleClass: "text-white",
    linkClass: "text-teal",
  },
  {
    id: "material-prices",
    href: "/dashboard/material-prices",
    label: "Material Prices",
    description:
      "Monthly price indices for steel, timber, concrete, aggregates, and more from DBT/ONS.",
    icon: Package,
    iconBg: "bg-pink/10",
    iconColor: "text-pink",
    cardClass: "bg-white text-navy",
    descClass: "text-warm-gray",
    titleClass: "text-navy",
    linkClass: "text-teal",
  },
  {
    id: "construction-output",
    href: "/dashboard/construction-output",
    label: "Construction Output",
    description:
      "Monthly ONS data on total sector output, new work vs repair & maintenance, and sector breakdown.",
    icon: Building2,
    iconBg: "bg-teal/10",
    iconColor: "text-teal",
    cardClass: "bg-white text-navy",
    descClass: "text-warm-gray",
    titleClass: "text-navy",
    linkClass: "text-teal",
  },
  {
    id: "planning",
    href: "/dashboard/planning",
    label: "Planning Activity",
    description:
      "Recent planning application decisions from local authorities across England. Approvals, refusals, and trends.",
    icon: Landmark,
    iconBg: "bg-navy/10",
    iconColor: "text-navy",
    cardClass: "bg-white text-navy",
    descClass: "text-warm-gray",
    titleClass: "text-navy",
    linkClass: "text-teal",
  },
  {
    id: "epc",
    href: "/dashboard/epc",
    label: "EPC Lookup",
    description:
      "Search Energy Performance Certificates for any UK postcode. Ratings, SAP scores, and building fabric data.",
    icon: Home,
    iconBg: "bg-charcoal/10",
    iconColor: "text-charcoal",
    cardClass: "md:col-span-2 bg-charcoal text-white",
    descClass: "text-gray-400",
    titleClass: "text-white",
    linkClass: "text-teal",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 pb-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Live Data
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            Construction Data Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-gray-400">
            Live and regularly updated data across the UK construction sector.
            Carbon intensity, material prices, sector output, planning decisions,
            and building energy performance -- all in one place.
          </p>
        </div>
      </section>

      {/* Section Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.id}
                href={section.href}
                className={`group rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all ${section.cardClass}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-xl ${section.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${section.iconColor}`} />
                  </div>
                  <h2
                    className={`font-[family-name:var(--font-playfair)] text-xl font-bold ${section.titleClass}`}
                  >
                    {section.label}
                  </h2>
                </div>
                <p className={`text-sm leading-relaxed ${section.descClass}`}>
                  {section.description}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold mt-4 group-hover:gap-2.5 transition-all ${section.linkClass}`}
                >
                  View live data
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
