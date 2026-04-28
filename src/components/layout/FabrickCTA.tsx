"use client";

import { ArrowUpRight, Megaphone, Code2, Sparkles, Users, Palette, BarChart3, PenTool, Globe } from "lucide-react";

/* ────────────────────────────────────────────────────
   Marketing CTA - "We can do your marketing"
   ──────────────────────────────────────────────────── */
export function FabrickMarketingCTA() {
  return (
    <section className="bg-navy py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left - message */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink/20 px-3 py-1 text-xs font-semibold text-pink mb-4">
              <Megaphone className="h-3.5 w-3.5" />
              About Fabrick
            </span>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl leading-tight">
              Built on insight. Powered by creativity. Driven to make a difference.
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-lg">
              We&apos;ve been shaping stories and strategies for the built
              environment for over 40 years - and we&apos;ve picked up a few
              awards along the way. Our 25+ in-house team of marketing and
              communications professionals is highly skilled in delivering
              impactful online and offline content and PR campaigns for clients
              of all sizes across the world.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Sparkles, label: "Strategy & Planning" },
                { icon: Palette, label: "Design & Development" },
                { icon: Users, label: "PR & Media Relations" },
                { icon: BarChart3, label: "SEO & PPC" },
                { icon: PenTool, label: "Content Marketing" },
                { icon: Globe, label: "Global Marketing" },
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

          {/* Right - visual proof */}
          <div className="rounded-2xl bg-charcoal p-8 border border-gray-700/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal mb-4">
              Why built environment brands choose Fabrick
            </p>
            <div className="space-y-4">
              {[
                {
                  stat: "Smart Design. Seamless Development.",
                  detail:
                    "Our creative and digital teams combine eye-catching design with modern platforms to tell your story and drive engagement.",
                },
                {
                  stat: "PR that cuts through the noise",
                  detail:
                    "Founded as a PR agency, we\u2019re experts at identifying and delivering a good story \u2014 then amplifying it across digital and traditional channels.",
                },
                {
                  stat: "Drive the conversation",
                  detail:
                    "From social media to content marketing, we help built environment brands interact directly with their customers and build lasting influence.",
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
   Platform CTA - "We can build this for you"
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
          This platform was built by Fabrick. We create bespoke digital
          tools, data platforms and content hubs for construction and built
          environment companies -- designed to demonstrate your expertise and
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
          Fabrick - Award-winning marketing specialists for the built environment
        </p>
      </div>
    </section>
  );
}
