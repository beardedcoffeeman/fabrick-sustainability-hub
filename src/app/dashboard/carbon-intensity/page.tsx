import { Metadata } from "next";
import { LiveGridSummary } from "@/components/dashboard/LiveGridSummary";
import { CarbonAnalysis } from "@/components/dashboard/CarbonAnalysis";
import { CarbonFAQ } from "@/components/dashboard/CarbonFAQ";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Package, Building2, Landmark, Home, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "When is the UK grid cleanest? Best time to use electricity, by hour | Fabrick",
  description:
    "Plan low-carbon construction work around the UK grid's cleanest hours. 90-day heatmap of National Grid ESO carbon intensity by hour of day and day of week, with Fabrick analysis and a downloadable view for tender submissions.",
  keywords: [
    "uk grid carbon intensity",
    "best time to use electricity uk",
    "carbon intensity by hour",
    "national grid carbon",
    "low carbon electricity hours",
    "scope 2 carbon construction",
    "uk energy mix",
    "grid carbon heatmap",
    "carbon-aware scheduling",
    "grid carbon intensity live",
    "renewable energy percentage UK",
    "carbon intensity forecast",
    "construction carbon planning",
  ],
  openGraph: {
    title: "When is the UK grid cleanest? - 90-day analysis | Fabrick",
    description:
      "Schedule grid-powered work into the cleanest hours of the UK week. Heatmap and best/worst windows from 90 days of National Grid ESO data.",
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

// Schema for SEO + Generative Engine Optimisation (LLMs)
// Article: tells crawlers this is a Fabrick-authored, dated piece.
// Dataset: claims authority over the heatmap data so it can be cited.
const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "When is the UK grid cleanest? - 90-day analysis",
  description:
    "Heatmap of UK grid carbon intensity by hour of day and day of week, with Fabrick analysis of when to schedule grid-powered construction work for the lowest scope 2 carbon impact.",
  author: {
    "@type": "Organization",
    name: "Fabrick",
    url: "https://www.fabrick.agency",
  },
  publisher: {
    "@type": "Organization",
    name: "Fabrick",
    url: "https://www.fabrick.agency",
  },
  datePublished: "2026-04-28",
  dateModified: new Date().toISOString().split("T")[0],
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://sustainability.fabrick.agency/dashboard/carbon-intensity",
  },
};

const DATASET_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "UK Grid Carbon Intensity - Hour-of-day × Day-of-week 90-day heatmap",
  description:
    "Rolling 90-day average of UK electricity grid carbon intensity (gCO₂/kWh), aggregated by hour of day and day of week. Half-hourly resolution; sourced from National Grid ESO Carbon Intensity API.",
  creator: {
    "@type": "Organization",
    name: "Fabrick",
    url: "https://www.fabrick.agency",
  },
  license: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
  isBasedOn: "https://carbonintensity.org.uk",
  keywords: [
    "carbon intensity",
    "uk grid",
    "national grid eso",
    "scope 2 emissions",
    "carbon-aware scheduling",
    "construction carbon",
  ],
  spatialCoverage: "United Kingdom",
  temporalCoverage: "P90D",
  url: "https://sustainability.fabrick.agency/dashboard/carbon-intensity",
  variableMeasured: "Carbon intensity (gCO₂ per kWh)",
};

export default function CarbonIntensityPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DATASET_SCHEMA) }}
      />

      {/* Hero - analysis-led, not live-led */}
      <section className="bg-charcoal py-10 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Grid Carbon" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
              Fabrick Analysis
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            When is the UK grid cleanest?
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">
            Time grid-powered construction work into the lowest-carbon hours of
            the week. 90-day analysis of National Grid ESO data, by hour and
            day. Use it for project planning, scope-2 carbon reporting and
            tender evidence.
          </p>
        </div>
      </section>

      {/* Analysis lead - heatmap, commentary, best/worst windows */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CarbonAnalysis />
      </section>

      {/* Live read - compact context, not the headline */}
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <LiveGridSummary />
      </section>

      {/* SEO/GEO body - keyword-targeted explainer copy. Sits below the live
          widget so analysis-fluent users get straight to the data, while
          search/LLM crawlers find the descriptive content. */}
      <section className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
        <article className="prose prose-sm max-w-none">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-navy mb-4">
            How to use UK grid carbon intensity in your project programme
          </h2>
          <p className="text-warm-gray leading-relaxed">
            Grid carbon intensity is the carbon dioxide (CO₂) emitted per
            kilowatt-hour of electricity generated. In the UK it varies by
            roughly a factor of two over the course of a typical week -
            cleanest in the early hours and on weekend afternoons, when
            renewables dominate; highest on weekday evenings, when gas plants
            ramp up to meet demand peaks. For construction projects running
            grid-powered plant, site cabins, electric arc steel or concrete
            batching, scheduling power-intensive work into the cleanest hours
            cuts scope 2 emissions on identical workloads.
          </p>
          <p className="text-warm-gray leading-relaxed mt-4">
            The heatmap above aggregates 90 days of half-hourly readings from
            the National Grid ESO Carbon Intensity API into 168 hour-of-day ×
            day-of-week buckets. Each cell shows the rolling average for that
            slot. The cleanest 10 windows and the highest-carbon 10 windows are
            listed below the heatmap so you can lift them straight into a
            programme document or carbon-management plan.
          </p>

          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-navy mt-8 mb-3">
            Methodology
          </h3>
          <ul className="text-warm-gray space-y-2 leading-relaxed">
            <li>
              <strong className="text-navy">Source.</strong> National Grid ESO
              Carbon Intensity API, half-hourly resolution, Open Government
              Licence v3.0.
            </li>
            <li>
              <strong className="text-navy">Window.</strong> Rolling 90 days
              (configurable to 30, 180 or 365 days via the lookback selector).
            </li>
            <li>
              <strong className="text-navy">Aggregation.</strong> Each
              half-hour reading is bucketed by the hour-of-day and day-of-week
              of its start timestamp (UTC). Bucket value = arithmetic mean of
              all readings in the lookback window. Actual values are used where
              published; the published forecast is used as a fallback for any
              gaps.
            </li>
            <li>
              <strong className="text-navy">Best/highest-carbon windows.</strong>{" "}
              Sorted by bucket mean. &quot;Cleanest&quot; windows are the
              lowest 10; &quot;highest-carbon&quot; the highest 10. Percentages
              are vs the rolling overall mean.
            </li>
          </ul>

          <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-navy mt-8 mb-3">
            What the data is good for
          </h3>
          <ul className="text-warm-gray space-y-2 leading-relaxed">
            <li>
              <strong className="text-navy">Carbon-aware programmes.</strong>{" "}
              Scheduling concrete pours, lift operations, off-site fabrication
              or other power-intensive work into the lowest-carbon hours.
            </li>
            <li>
              <strong className="text-navy">Tender narratives.</strong>{" "}
              Demonstrating a programme that times grid-powered work to the
              cleanest hours, with cited evidence from National Grid ESO.
            </li>
            <li>
              <strong className="text-navy">Scope 2 reporting.</strong>{" "}
              Project-specific scope 2 emissions can be calculated using the
              actual half-hourly intensity values during the project window
              rather than an annual average.
            </li>
            <li>
              <strong className="text-navy">BREEAM and similar frameworks.</strong>{" "}
              Evidence for energy-management credits where the assessor accepts
              published National Grid ESO data.
            </li>
          </ul>
        </article>
      </section>

      {/* FAQ - schema-marked for SEO + GEO */}
      <CarbonFAQ />

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
