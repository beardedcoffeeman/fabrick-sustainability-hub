import { Metadata } from "next";
import { RetrofitMarketWidget } from "@/components/dashboard/RetrofitMarketWidget";
import { RetrofitAnalysis } from "@/components/dashboard/RetrofitAnalysis";
import { RetrofitLeaderboard } from "@/components/dashboard/RetrofitLeaderboard";
import { RetrofitFAQ } from "@/components/dashboard/RetrofitFAQ";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Zap, Package, Building2, Landmark, ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "UK Retrofit Market: Find buildings below EPC C by postcode | Fabrick",
  description:
    "Where is the UK retrofit market? Every building below EPC band C is a candidate for MEES-driven upgrade work. Search any UK postcode for the share of properties below band C and the size of the local retrofit pipeline.",
  keywords: [
    "uk retrofit market",
    "buildings below epc c",
    "MEES compliance",
    "MEES 2027 deadline",
    "EPC C minimum",
    "retrofit pipeline uk",
    "energy performance certificate by postcode",
    "retrofit contractors uk",
    "minimum energy efficiency standards",
    "epc band distribution",
    "domestic epc data",
  ],
  openGraph: {
    title:
      "UK Retrofit Market: Find buildings below EPC C by postcode | Fabrick",
    description:
      "Search any UK postcode for the share of properties below EPC band C - the threshold MEES is moving toward. Sized for retrofit contractors, manufacturers and energy assessors.",
    url: "https://fabrick-sustainability-hub.vercel.app/dashboard/epc",
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
    href: "/dashboard/planning",
    label: "Planning Activity",
    description: "Recent planning decisions across England",
    icon: Landmark,
    color: "bg-navy/10 text-navy",
  },
];

// Article schema - names the question this page answers and Fabrick as
// the author/publisher. Used by Google and LLMs for attribution.
const ARTICLE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Where is the UK retrofit market?",
  description:
    "Postcode lookup that reports the share of properties below EPC band C - the MEES retrofit threshold - alongside Fabrick analysis of the UK retrofit pipeline driven by 2027 and 2030 minimum energy efficiency deadlines.",
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
    "@id": "https://fabrick-sustainability-hub.vercel.app/dashboard/epc",
  },
  about: [
    "Minimum Energy Efficiency Standards",
    "EPC band C minimum",
    "UK retrofit market",
    "MEES 2027",
    "Domestic EPC register",
  ],
};

export default function EPCPage() {
  return (
    <div className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_SCHEMA) }}
      />

      {/* Hero */}
      <section className="bg-charcoal py-12 pb-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Retrofit Market" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
              Fabrick Analysis
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            Where is the UK retrofit market?
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">
            Every building below EPC band C is a candidate for retrofit work as
            MEES tightens - C minimum proposed for non-domestic rentals from
            April 2027. Below, a ranked view of UK cities by share of homes
            below band C, plus a postcode-level lookup further down the page.
          </p>
        </div>
      </section>

      {/* National retrofit map - leaderboards + sortable table */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <RetrofitLeaderboard />
      </section>

      {/* Fabrick Analysis - MEES timeline + size of prize */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <RetrofitAnalysis />
      </section>

      {/* Postcode lookup - self-service tool below the analysis */}
      <section
        id="postcode-lookup"
        className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 scroll-mt-20"
      >
        <div className="mb-5 flex items-center gap-2">
          <Search className="h-4 w-4 text-teal" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal">
            Check a specific postcode
          </span>
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-navy mb-2">
          Drill into a single postcode
        </h2>
        <p className="text-sm text-warm-gray mb-6 max-w-2xl">
          The leaderboard above is a snapshot of representative residential
          postcodes. To check a specific area, search any UK postcode below.
        </p>
        <RetrofitMarketWidget />
      </section>

      {/* FAQ - schema-marked for SEO + GEO */}
      <RetrofitFAQ />

      {/* Explore More Data */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
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
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg ${section.color} mb-3`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-navy group-hover:text-teal transition-colors">
                    {section.label}
                  </h3>
                  <p className="text-xs text-warm-gray mt-1">
                    {section.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-teal font-medium mt-3">
                    View live data <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <FabrickPlatformCTA />
    </div>
  );
}
