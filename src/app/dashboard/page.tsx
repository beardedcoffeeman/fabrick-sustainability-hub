import { CarbonIntensityWidget } from "@/components/dashboard/CarbonIntensityWidget";
import { MaterialPricesWidget } from "@/components/dashboard/MaterialPricesWidget";
import { ConstructionOutputWidget } from "@/components/dashboard/ConstructionOutputWidget";
import { PlanningActivityWidget } from "@/components/dashboard/PlanningActivityWidget";
import { EPCLookupWidget } from "@/components/dashboard/EPCLookupWidget";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import {
  Zap,
  Package,
  Building2,
  Landmark,
  Home,
  ArrowDownRight,
} from "lucide-react";

export const metadata = {
  title: "Live Dashboard | Fabrick Built Environment Data",
  description:
    "Live UK construction data: carbon intensity, material prices, construction output, planning activity, and EPC ratings.",
};

const sections = [
  {
    id: "carbon",
    label: "Carbon Intensity",
    icon: Zap,
    color: "bg-charcoal text-white",
    activeColor: "bg-charcoal",
  },
  {
    id: "materials",
    label: "Material Prices",
    icon: Package,
    color: "bg-white text-navy",
    activeColor: "bg-white",
  },
  {
    id: "output",
    label: "Construction Output",
    icon: Building2,
    color: "bg-teal/10 text-teal",
    activeColor: "bg-teal",
  },
  {
    id: "planning",
    label: "Planning Activity",
    icon: Landmark,
    color: "bg-white text-navy",
    activeColor: "bg-white",
  },
  {
    id: "epc",
    label: "EPC Lookup",
    icon: Home,
    color: "bg-charcoal/10 text-charcoal",
    activeColor: "bg-charcoal",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

      {/* Section Navigation - sticky */}
      <nav className="sticky top-0 z-30 bg-charcoal/95 backdrop-blur-sm border-b border-gray-700/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap shrink-0"
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </a>
              );
            })}
            <div className="ml-auto shrink-0 pl-4">
              <a
                href="/"
                className="flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal-dark transition-colors"
              >
                <ArrowDownRight className="h-3.5 w-3.5" />
                Back to overview
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* Section 1: Carbon Intensity */}
      {/* ============================================================ */}
      <section id="carbon" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-charcoal">
              <Zap className="h-4 w-4 text-teal" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
              UK Grid Carbon Intensity
            </h2>
          </div>
          <p className="text-sm text-warm-gray mb-8 ml-11">
            Real-time data from the National Grid ESO. See how clean UK
            electricity is right now, the generation mix, regional breakdowns,
            and the best time to run energy-intensive equipment.
          </p>

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
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <hr className="border-cream-dark" />
      </div>

      {/* ============================================================ */}
      {/* Section 2: Material Prices */}
      {/* ============================================================ */}
      <section id="materials" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-pink/10">
              <Package className="h-4 w-4 text-pink" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
              Construction Material Prices
            </h2>
          </div>
          <p className="text-sm text-warm-gray mb-8 ml-11">
            Monthly price indices for key construction materials from the
            Department for Business and Trade. Track cost movements across steel,
            timber, concrete, aggregates, and more.
          </p>

          <MaterialPricesWidget />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <hr className="border-cream-dark" />
      </div>

      {/* ============================================================ */}
      {/* Section 3: Construction Output */}
      {/* ============================================================ */}
      <section id="output" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-teal/10">
              <Building2 className="h-4 w-4 text-teal" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
              UK Construction Output
            </h2>
          </div>
          <p className="text-sm text-warm-gray mb-8 ml-11">
            Monthly construction output data from the ONS. Total sector activity,
            new work vs repair and maintenance, and breakdown by sector -- private
            housing, public, infrastructure, commercial, and industrial.
          </p>

          <ConstructionOutputWidget />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <hr className="border-cream-dark" />
      </div>

      {/* ============================================================ */}
      {/* Section 4: Planning Activity */}
      {/* ============================================================ */}
      <section id="planning" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-navy/10">
              <Landmark className="h-4 w-4 text-navy" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
              Planning Activity
            </h2>
          </div>
          <p className="text-sm text-warm-gray mb-8 ml-11">
            Recent planning application decisions from local authorities across
            England via planning.data.gov.uk. Track approvals, refusals, and the
            development pipeline.
          </p>

          <PlanningActivityWidget />
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <hr className="border-cream-dark" />
      </div>

      {/* ============================================================ */}
      {/* Section 5: EPC Lookup */}
      {/* ============================================================ */}
      <section id="epc" className="scroll-mt-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-charcoal/10">
              <Home className="h-4 w-4 text-charcoal" />
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy md:text-3xl">
              EPC Lookup
            </h2>
          </div>
          <p className="text-sm text-warm-gray mb-8 ml-11">
            Search Energy Performance Certificates for any UK postcode. Explore
            ratings, SAP scores, property types, heating systems, and building
            fabric data from the DLUHC open data register.
          </p>

          <EPCLookupWidget />
        </div>
      </section>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
