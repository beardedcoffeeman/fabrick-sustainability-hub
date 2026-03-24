"use client";

import { ArrowUpRight, Megaphone, Code2, Sparkles, Users, Palette, BarChart3, PenTool, Globe } from "lucide-react";

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
              Award-winning marketing specialists for the built environment
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-lg">
              Fabrick is a full-service marketing and PR agency that works
              exclusively in construction, property and the built environment.
              For nearly 40 years, our 25+ in-house specialists have delivered
              outstanding marketing, PR, creative, digital and content campaigns
              for clients of all sizes across the industry.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Sparkles, label: "Strategy & Planning" },
                { icon: Palette, label: "Design & Creative" },
                { icon: Users, label: "PR & Media Relations" },
                { icon: BarChart3, label: "SEO & PPC" },
                { icon: PenTool, label: "Content Marketing" },
                { icon: Globe, label: "Social Media" },
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
              href="https://www.fabrick.agency"
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
                  stat: "Construction is all we do",
                  detail:
                    "We don\u2019t dabble in construction marketing \u2014 it\u2019s our sole focus. Nearly 40 years of specialist experience means we understand your market, your audience, and your competitors.",
                },
                {
                  stat: "Full-service, in-house",
                  detail:
                    "Strategy, creative, PR, digital, social, video, web \u2014 our 25+ specialists deliver everything under one roof. No outsourcing, no diluted expertise.",
                },
                {
                  stat: "Results that make a difference",
                  detail:
                    "We\u2019ve built brands, increased market share, generated leads, launched products and managed crises for clients across the UK and internationally.",
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
          This Sustainability Hub was built by Fabrick. We create bespoke digital
          tools, data platforms and content hubs for construction and built
          environment companies — designed to demonstrate your expertise and
          generate qualified leads.
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
            href="https://www.fabrick.agency/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-dark"
          >
            Let&apos;s Build Yours
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <a
            href="mailto:hello@fabrick.agency"
            className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-light"
          >
            hello@fabrick.agency
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Fabrick — Award-winning marketing specialists for the built environment
        </p>
      </div>
    </section>
  );
}
