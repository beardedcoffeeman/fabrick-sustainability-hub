"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FabrickLogo } from "./FabrickLogo";

const HUB_LINKS: Array<[string, string]> = [
  ["Live Dashboard", "/dashboard"],
  ["Grid Carbon Analysis", "/dashboard/carbon-intensity"],
  ["Material Prices", "/dashboard/material-prices"],
  ["Construction Output", "/dashboard/construction-output"],
  ["Planning Activity", "/dashboard/planning"],
  ["EPC Lookup", "/dashboard/epc"],
];

const TOOLS_LINKS: Array<[string, string]> = [
  ["Carbon Calculator", "/materials"],
  ["Regulation Tracker", "/regulations"],
  ["Knowledge Hub", "/knowledge"],
  ["Original Research", "/research"],
];

const KNOWLEDGE_LINKS: Array<[string, string]> = [
  ["Embodied Carbon Guide", "/knowledge/what-is-embodied-carbon"],
  ["Part Z Explained", "/knowledge/part-z-explained"],
  ["Future Homes Standard", "/knowledge/future-homes-standard-2026"],
  ["What Is an EPD?", "/knowledge/what-is-epd"],
];

const DATA_SOURCES = [
  { name: "National Grid ESO", url: "https://carbonintensity.org.uk" },
  { name: "Office for National Statistics", url: "https://www.ons.gov.uk" },
  {
    name: "ICE Database (Circular Ecology)",
    url: "https://circularecology.com/embodied-carbon-footprint-database.html",
  },
  {
    name: "Department for Business and Trade",
    url: "https://www.gov.uk/government/organisations/department-for-business-and-trade",
  },
  { name: "MHCLG (EPC Open Data)", url: "https://epc.opendatacommunities.org/" },
  { name: "planning.data.gov.uk", url: "https://www.planning.data.gov.uk" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top band: Fabrick brand statement + agency CTA */}
        <div className="grid gap-10 py-14 md:grid-cols-3 md:gap-16 md:py-16 border-b border-white/10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <FabrickLogo fill="#ffffff" height={28} />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-warm-gray">
                Built Environment Data
              </span>
            </div>
            <p className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold leading-snug max-w-xl">
              A built environment marketing agency using data to inform
              campaigns, decisions and the industry.
            </p>
            <p className="mt-4 text-sm text-warm-gray max-w-xl leading-relaxed">
              These tools, this analysis and our monthly Data Point newsletter
              are how we share what we see. The deeper, project-specific
              analysis is what we do for clients.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end md:justify-end">
            <a
              href="https://www.fabrick.agency/contact-us"
              className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-light"
            >
              Work with Fabrick
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <a
              href="mailto:hello@fabrick.agency"
              className="text-sm text-warm-gray hover:text-white transition-colors"
            >
              hello@fabrick.agency
            </a>
          </div>
        </div>

        {/* Mid band: navigation columns */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-3 md:gap-14">
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-4">
              Live Dashboards
            </h4>
            <ul className="space-y-2.5">
              {HUB_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-warm-gray transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-4">
              Tools & Insights
            </h4>
            <ul className="space-y-2.5">
              {TOOLS_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-warm-gray transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-4">
              Knowledge
            </h4>
            <ul className="space-y-2.5">
              {KNOWLEDGE_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-warm-gray transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Data attribution band */}
        <div className="border-t border-white/10 py-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-warm-gray mb-3">
            Trusted Data From
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {DATA_SOURCES.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-warm-gray transition-colors hover:text-white"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-white/10 py-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-xs text-warm-gray">
            &copy; {new Date().getFullYear()} Fabrick. All rights reserved.
          </p>
          <p className="text-xs text-warm-gray">
            Open data used under the{" "}
            <a
              href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Open Government Licence v3.0
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
