import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  LayoutDashboard,
  Calculator,
  ScrollText,
  Compass,
  BookOpen,
  Telescope,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Pulse showcase page
// ---------------------------------------------------------------------------
// A single shareable landing page for Pulse, to link to from fabrick.agency
// and socials (the "showcase page" agreed in the 30 Jun meeting with Kate &
// Amelia). Deliberately built from copy already approved/live on the homepage
// so no new marketing copy is invented here.
//
// COPY OWNER: Colin. The hero headline below uses the existing approved
// tagline. Tom's steer in the meeting was to position Pulse as "answering
// important questions in construction, using data" — left for Colin to wordsmith
// and approve before this goes live. Search for "TODO(copy)".
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Pulse by Fabrick - what's inside",
  description:
    "A tour of Pulse by Fabrick: live dashboards, the embodied carbon calculator, the UK regulations timeline, the knowledge hub, original research and the Planning Explorer.",
};

const TOOLS = [
  {
    eyebrow: "Dashboards",
    href: "/dashboard",
    icon: LayoutDashboard,
    headline: "Live view of the industry's key metrics.",
    detail:
      "Carbon, material prices, planning activity, construction output and EPC ratings, refreshed automatically.",
    cta: "Open the dashboards",
  },
  {
    eyebrow: "Planning Explorer",
    href: "/research/planning-explorer",
    icon: Telescope,
    headline: "Where is the sector active right now?",
    detail:
      "Real UK planning applications by sector and region, the most active local authorities, and conditions extracted from decision notices.",
    cta: "Explore the data",
  },
  {
    eyebrow: "Carbon Calculator",
    href: "/materials",
    icon: Calculator,
    headline: "Understand the real impact of what you specify.",
    detail:
      "Embodied carbon calculator with multi-criteria comparison: carbon, thermal performance, fire rating and indicative cost.",
    cta: "Run the calculator",
  },
  {
    eyebrow: "Regulations",
    href: "/regulations",
    icon: ScrollText,
    headline: "Stay ahead of changing requirements.",
    detail:
      "Future Homes Standard, Part Z, CBAM, EPC. What is coming, when, and what it means for your work.",
    cta: "See the timeline",
  },
  {
    eyebrow: "Knowledge",
    href: "/knowledge",
    icon: Compass,
    headline: "Build a deeper understanding of the challenges.",
    detail:
      "Plain-English explainers on the policies, standards and ideas shaping the construction industry.",
    cta: "Read the explainers",
  },
  {
    eyebrow: "Research",
    href: "/research",
    icon: BookOpen,
    headline: "Data turned into insight you can act on.",
    detail:
      "Original Fabrick research into how UK construction professionals search, evaluate suppliers and make decisions.",
    cta: "See the research",
  },
];

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal text-white py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-4">
            Pulse by Fabrick
          </p>
          {/* TODO(copy): Colin to confirm headline. Tom's steer: "answering
              important questions in construction, using data." */}
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl font-bold leading-[1.02]">
            Live UK built environment data and tools.
          </h1>
          <p className="mt-6 text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            One free platform that brings together the live data, original
            analysis and practical tools shaping UK construction, property and
            infrastructure, so your decisions are backed by evidence, not
            guesswork.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-light"
            >
              Explore Pulse
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.fabrick.agency/contact-us"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy"
            >
              Talk to Fabrick
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
              Everything in one place
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-navy">
              What is inside Pulse.
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.eyebrow}
                  href={tool.href}
                  className="group block rounded-2xl bg-white border border-charcoal/[0.06] p-6 transition-all hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-dark">
                      <Icon className="h-4 w-4 text-teal" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-warm-gray/60">
                      {tool.eyebrow}
                    </span>
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-[1.35rem] font-bold text-navy leading-[1.15] tracking-tight">
                    {tool.headline}
                  </h3>
                  <p className="mt-3 text-xs text-warm-gray leading-relaxed">
                    {tool.detail}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal transition-all group-hover:gap-2.5">
                    {tool.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sources strip */}
      <section className="bg-cream-dark py-14 border-t border-charcoal/[0.06]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
            Powered by trusted data
          </span>
          <p className="mt-4 text-sm md:text-base text-charcoal/80 leading-relaxed">
            Built on credible UK sources, including National Grid ESO, the
            Office for National Statistics, the ICE Database, the Department for
            Business and Trade, MHCLG and planning.data.gov.uk, turned into
            clear, usable intelligence.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark"
          >
            See the full platform
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
