"use client";

import Link from "next/link";
import { ArrowRight, Brain, Building2, FlaskConical } from "lucide-react";

// ---------------------------------------------------------------------------
// Compact My Pulse widget listing Fabrick's original research studies.
// Keep the entries in sync with researchStudies in src/app/research/page.tsx
// (kept separate so the content page stays a plain server component).
// ---------------------------------------------------------------------------

const STUDIES = [
  {
    href: "/research/planning-explorer",
    title: "Planning Explorer: where UK construction is actually building",
    status: "New",
    blurb:
      "Real UK planning applications across eight sectors - where demand is moving and which authorities are busiest.",
    stats: "Real applications | 8 sectors | All UK LPAs",
    icon: Building2,
  },
  {
    href: "/research/ai-construction-search",
    title: "How accurate is AI for UK construction?",
    status: "Updated May 2026",
    blurb:
      "12 AI models tested on 1,001 technical UK construction questions across 20 categories.",
    stats: "1,001 questions | 12 AI models | 20 categories",
    icon: Brain,
  },
];

export function ResearchWidget() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream">
            <FlaskConical className="h-4 w-4 text-teal" />
          </div>
          <div>
            <h3 className="font-semibold text-navy">Fabrick research</h3>
            <p className="text-xs text-warm-gray">
              Original studies into how UK construction decides
            </p>
          </div>
        </div>
        <Link
          href="/research"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark transition-colors"
        >
          All research
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {STUDIES.map((study) => {
          const Icon = study.icon;
          return (
            <Link
              key={study.href}
              href={study.href}
              className="group rounded-xl bg-cream p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-teal" />
                <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-semibold text-pink">
                  {study.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-navy leading-snug group-hover:text-teal transition-colors">
                {study.title}
              </h4>
              <p className="mt-1 text-xs text-warm-gray leading-relaxed">
                {study.blurb}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-warm-gray/70">
                {study.stats}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
