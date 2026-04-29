"use client";

import Link from "next/link";
import {
  Zap,
  ArrowRight,
  Calculator,
  BookOpen,
  Compass,
  Sparkles,
  Mail,
} from "lucide-react";
import { BannerVideo } from "@/components/home/BannerVideo";

// ============================================================
// Curved SVG Arc Divider
// ============================================================

function CurveArc({
  from,
  to,
  flip = false,
}: {
  from: string;
  to: string;
  flip?: boolean;
}) {
  return (
    <div className="relative" style={{ marginTop: -1, marginBottom: -1 }}>
      <svg
        viewBox="0 0 1440 80"
        className="w-full block"
        preserveAspectRatio="none"
        style={{ height: "80px", color: to }}
      >
        {flip ? (
          <path
            d="M0,0 C360,80 1080,80 1440,0 L1440,80 L0,80 Z"
            fill={to}
          />
        ) : (
          <path
            d="M0,80 C360,0 1080,0 1440,80 L1440,0 L0,0 Z"
            fill={from}
          />
        )}
      </svg>
    </div>
  );
}

// ============================================================
// Main Homepage Component
// ============================================================

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ============================================================
          HERO SECTION - Banner carries the mission. No CTAs - the
          rest of the page IS the call to action.
          ============================================================ */}
      <section className="relative overflow-hidden text-white">
        <BannerVideo src="/hero/banner.mp4" poster="/hero/banner-poster.jpg" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pt-32 md:pb-32">
          <div className="max-w-4xl">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 animate-fade-in-delay-1">
              Fabrick - A Built Environment Marketing Agency
            </p>

            <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.98] tracking-tight animate-fade-in-delay-1 [text-shadow:0_2px_24px_rgba(0,0,0,0.4)]">
              Building a smarter construction industry.
            </h1>
            <p className="mt-4 font-[family-name:var(--font-playfair)] italic text-2xl md:text-3xl text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)] animate-fade-in-delay-2">
              Sharper data. Better decisions. From site to strategy.
            </p>

            <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl leading-relaxed animate-fade-in-delay-2 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
              We&rsquo;re putting live data, original analysis and open
              tools in front of the people building Britain, so every
              decision, from how materials are specified at RIBA Stage 4
              to how a construction company goes to market, is informed
              by evidence.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          TRUST STRIP - data sources, premium uniform treatment
          ============================================================ */}
      <section className="bg-cream py-10 md:py-12 border-b border-charcoal/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-warm-gray text-center mb-6">
            Trusted Data From
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { name: "National Grid ESO", url: "https://carbonintensity.org.uk" },
              { name: "Office for National Statistics", url: "https://www.ons.gov.uk" },
              { name: "ICE Database (Circular Ecology)", url: "https://circularecology.com/embodied-carbon-footprint-database.html" },
              { name: "Department for Business and Trade", url: "https://www.gov.uk/government/organisations/department-for-business-and-trade" },
              { name: "MHCLG (EPC Open Data)", url: "https://epc.opendatacommunities.org/" },
              { name: "planning.data.gov.uk", url: "https://www.planning.data.gov.uk" },
            ].map((source) => (
              <a
                key={source.name}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm font-semibold uppercase tracking-[0.08em] text-warm-gray/80 transition-colors hover:text-navy whitespace-nowrap"
              >
                {source.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHAT WE'VE BUILT - direct map of the banner's five promises.
          ============================================================ */}
      <section className="bg-cream-dark py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
              What we&rsquo;ve built
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-navy">
              Live data, analysis, tools, research and a monthly read.
            </h2>
            <p className="mt-3 text-warm-gray">
              Six doorways into the platform - every one of them open for
              the industry to use.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Live data",
                headline: "Five live UK construction data feeds.",
                detail:
                  "Grid carbon, material prices, ONS construction output, planning activity and EPC ratings - all auto-updating.",
                href: "/dashboard",
                icon: Zap,
                cta: "Open dashboards",
              },
              {
                title: "Original analysis",
                headline: "What the data actually says.",
                detail:
                  "Fabrick analysis layered onto every dashboard - patterns, what to do about it, when to act.",
                href: "/dashboard/carbon-intensity",
                icon: Sparkles,
                cta: "Read the analysis",
              },
              {
                title: "Open tools",
                headline: "Calculators and lookups, free.",
                detail:
                  "Embodied carbon calculator, material substitution explorer, EPC postcode lookup.",
                href: "/materials",
                icon: Calculator,
                cta: "Use the tools",
              },
              {
                title: "Original research",
                headline: "How the industry actually thinks.",
                detail:
                  "Audience and market research from our work with UK construction clients.",
                href: "/research",
                icon: BookOpen,
                cta: "See the research",
              },
              {
                title: "Knowledge hub",
                headline: "Regulation, standards, plain English.",
                detail:
                  "Future Homes Standard, CBAM, Part Z, EPC - what’s coming and what it means for your work.",
                href: "/knowledge",
                icon: Compass,
                cta: "Open knowledge hub",
              },
              {
                title: "The Data Point",
                headline: "One monthly read for builders.",
                detail:
                  "Material moves, regulatory shifts, grid trends - straight to your inbox, nothing else.",
                href: "#data-point",
                icon: Mail,
                cta: "Sign me up",
                feature: true,
              },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <Link
                  key={p.title}
                  href={p.href}
                  className={`group block rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream-dark ${
                    p.feature
                      ? "bg-charcoal text-white border border-white/10"
                      : "bg-white border border-charcoal/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        p.feature ? "bg-white/10" : "bg-cream"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-teal" />
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        p.feature ? "text-pink" : "text-warm-gray/60"
                      }`}
                    >
                      {p.title}
                    </span>
                  </div>
                  <h3
                    className={`font-[family-name:var(--font-playfair)] text-lg font-bold leading-snug ${
                      p.feature ? "text-white" : "text-navy"
                    }`}
                  >
                    {p.headline}
                  </h3>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      p.feature ? "text-gray-400" : "text-warm-gray"
                    }`}
                  >
                    {p.detail}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal transition-all group-hover:gap-2.5">
                    {p.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          LATEST INSIGHTS - three signed Fabrick findings.
          ============================================================ */}
      <section className="bg-cream-dark pt-2 pb-16 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6 md:mb-8">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
                Latest insights
              </span>
              <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-navy">
                What we&rsquo;re seeing this month.
              </h2>
            </div>
            <Link
              href="/#data-point"
              className="text-xs font-semibold text-teal hover:text-teal-dark inline-flex items-center gap-1.5"
            >
              Get monthly trends in your inbox
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                eyebrow: "UK Grid Carbon",
                headline:
                  "Sunday 3am is the cleanest hour of the UK week - 29% below average.",
                detail:
                  "Schedule grid-powered plant operations into weekend overnight windows.",
                href: "/dashboard/carbon-intensity",
              },
              {
                eyebrow: "Material Prices",
                headline:
                  "Structural steel down 5.5% YoY - the biggest fall in the basket.",
                detail:
                  "Copper is the standout riser at +9.8% YoY. Time orders against the trend.",
                href: "/dashboard/material-prices",
              },
              {
                eyebrow: "Embodied Carbon",
                headline:
                  "Switching CEM I to GGBS-blend cement cuts ~40% kgCO₂e/kg.",
                detail:
                  "The single highest-impact swap on most concrete-frame projects.",
                href: "/materials",
              },
            ].map((item) => (
              <Link
                key={item.headline}
                href={item.href}
                className="group block rounded-2xl bg-white border border-charcoal/[0.06] p-6 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-warm-gray/60">
                  {item.eyebrow}
                </span>
                <p className="mt-3 font-[family-name:var(--font-playfair)] text-lg font-bold text-navy leading-snug">
                  {item.headline}
                </p>
                <p className="mt-2 text-xs text-warm-gray leading-relaxed">
                  {item.detail}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal transition-all group-hover:gap-2.5">
                  Read the analysis
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Curved arc: cream-dark to navy */}
      <CurveArc from="var(--color-cream-dark)" to="var(--color-navy)" flip />

      {/* ============================================================
          WHY THIS MATTERS - context strip with one anchoring stat
          ============================================================ */}
      <section className="bg-navy py-20 md:py-28 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:gap-16 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
                Why this matters
              </span>
              <p className="mt-5 font-[family-name:var(--font-playfair)] text-[4.5rem] sm:text-[5.5rem] md:text-[6.5rem] lg:text-[7rem] font-bold text-teal leading-[0.95] tabular-nums break-words">
                £170bn
              </p>
              <p className="mt-5 text-sm text-gray-400 max-w-sm leading-relaxed">
                UK construction output, every year. An industry this big should
                not be running on guesswork.
              </p>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Built on intuition.
                <br className="hidden md:block" /> We&rsquo;re helping rebuild
                it on data.
              </h2>
              <p className="mt-5 text-base md:text-lg text-gray-300 leading-relaxed max-w-xl">
                Construction is full of decisions where better information
                changes the answer. When to schedule grid-powered work. Whether
                to substitute that material. Where the retrofit market actually
                is. Which audience an SME contractor should be talking to. Our
                tools and analysis turn public datasets the industry already
                pays for into evidence anyone can act on.
              </p>
              <ul className="mt-8 grid gap-3 sm:grid-cols-3 max-w-xl">
                <li className="border-l-2 border-pink/60 pl-3">
                  <p className="text-xl font-bold text-white tabular-nums">
                    8 in 10
                  </p>
                  <p className="text-[11px] text-gray-400 leading-snug mt-1">
                    major UK construction projects miss their original budget
                    or schedule
                  </p>
                </li>
                <li className="border-l-2 border-pink/60 pl-3">
                  <p className="text-xl font-bold text-white tabular-nums">
                    ~25%
                  </p>
                  <p className="text-[11px] text-gray-400 leading-snug mt-1">
                    of UK carbon comes from the built environment
                  </p>
                </li>
                <li className="border-l-2 border-pink/60 pl-3">
                  <p className="text-xl font-bold text-white tabular-nums">
                    99%
                  </p>
                  <p className="text-[11px] text-gray-400 leading-snug mt-1">
                    of UK construction firms are SMEs (CLC)
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          DATA POINT NEWSLETTER SIGNUP
          ============================================================ */}
      <section
        id="data-point"
        className="bg-charcoal py-16 md:py-20 text-white scroll-mt-24"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink">
            The Data Point
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold leading-tight">
            One email a month. Built environment trends, decoded.
          </h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            Live data turned into talking points. Material price moves, regulatory shifts and
            grid trends - straight to your inbox, nothing else.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              aria-label="Email address"
              className="flex-1 rounded-full bg-navy-light px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal/40 border border-gray-700"
            />
            <button
              type="submit"
              className="rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-light"
            >
              Sign me up
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-500">
            No spam. Unsubscribe in one click.
          </p>
        </div>
      </section>
    </div>
  );
}
