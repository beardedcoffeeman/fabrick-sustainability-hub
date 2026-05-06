import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology | Fabrick",
  description:
    "How the Fabrick carbon calculator works, what it measures, what it does not, and the sources behind every value.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <Link
          href="/materials"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the calculator
        </Link>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-3">
          Methodology
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-navy leading-[1.05] tracking-tight">
          How the calculator decides, and what it does not.
        </h1>
        <p className="mt-6 text-lg text-warm-gray leading-relaxed">
          The Fabrick calculator is a comparison tool, not a verdict. It ranks
          materials by embodied carbon and surfaces the trade-offs (thermal
          performance, fire rating, indicative cost) so a specifier can choose
          what matters most for the build in front of them.
        </p>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy mb-3">
            What we measure
          </h2>
          <ul className="space-y-3 text-sm text-charcoal/80 leading-relaxed">
            <li>
              <strong className="text-navy">Embodied carbon (kgCO₂e/kg).</strong>{" "}
              From the ICE Database (Inventory of Carbon and Energy) by Circular
              Ecology, version 3.0. Modules A1-A3 (cradle-to-gate) unless
              otherwise stated. Industry-average values; project-specific EPDs
              should always be preferred for design-stage decisions.
            </li>
            <li>
              <strong className="text-navy">Thermal conductivity (λ, W/m·K).</strong>{" "}
              Typical declared values per BS EN 13162-13172 (mineral wool to
              phenolic) and BRE BR443 conventions. Used to compute the
              relative thickness penalty when comparing one material against
              another at the same U-value.
            </li>
            <li>
              <strong className="text-navy">Fire rating (Euroclass).</strong>{" "}
              Reaction-to-fire classification under BS EN 13501-1. We show
              the headline class (A1-F) plus smoke/droplet sub-class where
              applicable. Treated/specified products may achieve different
              ratings than the generic material; check the manufacturer
              datasheet.
            </li>
            <li>
              <strong className="text-navy">Cost (£ band).</strong>{" "}
              Indicative material cost for like-for-like quantity, banded
              £ to ££££ from common BCIS-derived ranges and trade pricing.
              Excludes labour and project-specific factors. Treat as a
              direction signal, not a quote.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy mb-3">
            What we do not measure
          </h2>
          <ul className="space-y-2 text-sm text-charcoal/80 leading-relaxed list-disc pl-5">
            <li>
              Operational carbon (modules B6-B7) and full life-cycle modules
              D (reuse/recovery). Single-figure embodied carbon is an
              upstream signal, not a whole-life answer.
            </li>
            <li>
              Acoustic performance, moisture/vapour management, settling,
              workmanship and detailing risk. All matter and all influence
              the right specification.
            </li>
            <li>
              Site availability and lead time. There is no reliable public
              dataset for this, and substitution decisions in practice often
              hinge on it.
            </li>
            <li>
              Manufacturer-specific EPDs. Where a member of the Insulation
              Manufacturers Association or another supplier holds a
              product-specific EPD that beats the database average, the
              calculator does not currently see it. We are building a route
              to ingest verified EPDs.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy mb-3">
            Sources
          </h2>
          <div className="space-y-2 text-sm text-charcoal/80">
            <p>
              <strong className="text-navy">Embodied carbon:</strong>{" "}
              <a
                href="https://circularecology.com/embodied-carbon-footprint-database.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline underline-offset-2 hover:text-teal-dark"
              >
                ICE Database, Circular Ecology
              </a>
            </p>
            <p>
              <strong className="text-navy">Thermal conductivity:</strong> BS
              EN 13162-13172 declared λ, BRE BR443 typical values
            </p>
            <p>
              <strong className="text-navy">Fire rating:</strong> BS EN
              13501-1 reaction-to-fire classification
            </p>
            <p>
              <strong className="text-navy">Cost banding:</strong> indicative
              ranges informed by BCIS (RICS) and live trade prices
            </p>
            <p>
              <strong className="text-navy">Benchmarks:</strong> LETI 2020
              targets, RIBA 2030 v2 targets, UK Net Zero Carbon Building
              Standard (UKNZCBS)
            </p>
          </div>
        </section>

        <section className="mt-12 rounded-2xl bg-white border border-charcoal/[0.06] p-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-navy mb-2">
            Editorial position
          </h2>
          <p className="text-sm text-charcoal/80 leading-relaxed">
            The calculator does not promote any product or manufacturer.
            Recommendations are surfaced strictly on data that is published
            and verifiable. If you are a manufacturer with a product-specific
            EPD that improves on a database value used here, get in touch at{" "}
            <a
              href="mailto:hello@fabrick.agency"
              className="text-teal underline underline-offset-2 hover:text-teal-dark"
            >
              hello@fabrick.agency
            </a>
            . Verified EPDs improve accuracy for everyone.
          </p>
        </section>

        <p className="mt-12 text-xs text-warm-gray">
          Last reviewed: {new Date().toISOString().slice(0, 10)}.
        </p>
      </div>
    </div>
  );
}
