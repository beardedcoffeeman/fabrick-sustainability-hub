import { Metadata } from "next";
import { CarbonIntensityWidget } from "@/components/dashboard/CarbonIntensityWidget";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Zap, Package, Building2, Landmark, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UK Grid Carbon Intensity - Live Data | Fabrick",
  description:
    "Real-time UK electricity carbon intensity, generation mix, regional data, and forecast. Track how clean the grid is right now and plan energy-intensive construction work.",
  keywords: [
    "UK carbon intensity",
    "grid carbon intensity live",
    "UK electricity carbon",
    "national grid carbon",
    "generation mix UK",
    "renewable energy percentage UK",
    "carbon intensity forecast",
    "construction carbon planning",
  ],
  openGraph: {
    title: "UK Grid Carbon Intensity - Live Data | Fabrick",
    description:
      "Real-time UK electricity carbon intensity, generation mix, regional data, and forecast.",
    url: "https://sustainability.fabrick.agency/dashboard/carbon-intensity",
  },
};

const otherSections = [
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

export default function CarbonIntensityPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Carbon Intensity" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Live Data
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            UK Grid Carbon Intensity
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-gray-400">
            Real-time data from the National Grid ESO. See how clean UK
            electricity is right now, the generation mix, regional breakdowns,
            and the best time to run energy-intensive equipment.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CarbonIntensityWidget />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-navy">
                Why This Matters
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-cream p-4">
                  <h4 className="text-sm font-semibold text-navy">
                    Operational Carbon
                  </h4>
                  <p className="mt-1 text-xs text-warm-gray">
                    When grid intensity is low, electricity-powered
                    construction equipment has a lower carbon footprint. Plan
                    heavy power usage for low-intensity periods.
                  </p>
                </div>
                <div className="rounded-lg bg-cream p-4">
                  <h4 className="text-sm font-semibold text-navy">
                    Material Manufacturing
                  </h4>
                  <p className="mt-1 text-xs text-warm-gray">
                    Grid carbon intensity directly affects the embodied carbon
                    of UK-manufactured building products. Lower intensity =
                    lower embodied carbon.
                  </p>
                </div>
                <div className="rounded-lg bg-cream p-4">
                  <h4 className="text-sm font-semibold text-navy">
                    Future Homes Standard
                  </h4>
                  <p className="mt-1 text-xs text-warm-gray">
                    The FHS requires 75-80% less carbon in new homes from
                    December 2026. Understanding energy supply carbon intensity
                    is critical for compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-teal p-6 text-white">
              <Zap className="h-8 w-8 mb-3 opacity-60" />
              <h3 className="font-bold">Best Time to Build?</h3>
              <p className="mt-2 text-sm text-white/80">
                When carbon intensity drops below 100g CO2/kWh, it&apos;s ideal
                for energy-intensive construction. Windy, sunny days = cleaner
                construction.
              </p>
            </div>
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
