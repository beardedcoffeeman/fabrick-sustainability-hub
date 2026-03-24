"use client";

import { ArrowUpRight, Megaphone, Code2, Sparkles, Users, Palette, BarChart3 } from "lucide-react";

/* ────────────────────────────────────────────────────
   Marketing CTA — "We can do your marketing"
   ──────────────────────────────────────────────────── */
export function FabrickMarketingCTA() {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left — message */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink/20 px-3 py-1 text-xs font-semibold text-pink mb-4">
              <Megaphone className="h-3.5 w-3.5" />
              About Fabrick
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl leading-tight">
              We&apos;re the marketing agency for the built environment
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-lg">
              Fabrick helps construction, property, and built environment brands
              communicate sustainability with clarity and confidence. From carbon
              strategy messaging to regulation-ready content — we turn complex
              sustainability data into compelling stories that win business.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Palette, label: "Brand & Positioning" },
                { icon: BarChart3, label: "Data-Led Content" },
                { icon: Users, label: "Thought Leadership" },
                { icon: Sparkles, label: "Campaign Strategy" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg bg-navy-light px-3 py-2.5"
                >
                  <Icon className="h-4 w-4 text-teal shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
            <a
              href="https://fabrick.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-light"
            >
              Work with Fabrick
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {/* Right — visual proof */}
          <div className="rounded-2xl bg-charcoal p-8 border border-gray-700/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal mb-4">
              Why built environment brands choose Fabrick
            </p>
            <div className="space-y-4">
              {[
                {
                  stat: "Sustainability is complex",
                  detail:
                    "Your clients need to understand your carbon credentials — but jargon kills engagement. We translate EPDs, BREEAM scores, and carbon data into marketing that resonates.",
                },
                {
                  stat: "Regulation is accelerating",
                  detail:
                    "Part Z, FHS 2026, UK CBAM — your marketing needs to keep pace with policy. We help you position as a leader, not a follower.",
                },
                {
                  stat: "Data builds trust",
                  detail:
                    "We build data-driven content hubs, carbon calculators, and digital tools that demonstrate expertise and generate leads.",
                },
              ].map((item) => (
                <div
                  key={item.stat}
                  className="rounded-lg bg-navy-light p-4"
                >
                  <h4 className="text-sm font-bold text-white">
                    {item.stat}
                  </h4>
                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────
   Platform CTA — "We can build this for you"
   ──────────────────────────────────────────────────── */
export function FabrickPlatformCTA() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-16 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full border border-teal" />
        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full border border-pink" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal/20 px-3 py-1 text-xs font-semibold text-teal mb-4">
          <Code2 className="h-3.5 w-3.5" />
          Built by Fabrick
        </div>
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl leading-tight">
          Want a platform like this for your business?
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-gray-400 leading-relaxed">
          This Sustainability Hub is a demonstration of what Fabrick builds for
          built environment companies. We create bespoke data platforms, carbon
          calculators, regulatory tools, and content hubs that position your brand
          as a sustainability leader — and generate qualified leads while you sleep.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "Carbon Calculators",
            "Data Dashboards",
            "Content Hubs",
            "Lead-Gen Tools",
            "CPD Platforms",
            "Product Selectors",
          ].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="https://fabrick.co.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-dark"
          >
            Let&apos;s Build Yours
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="mailto:hello@fabrick.co.uk"
            className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-light"
          >
            hello@fabrick.co.uk
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Fabrick — Marketing specialists for the built environment
        </p>
      </div>
    </section>
  );
}
