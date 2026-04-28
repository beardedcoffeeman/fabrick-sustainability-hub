import { RegulationTimeline } from "@/components/regulatory/RegulationTimeline";
import { FabrickMarketingCTA, FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Building2, HardHat, Warehouse, Landmark, Sparkles, AlertTriangle, Clock, FileText } from "lucide-react";

export const metadata = {
  title:
    "What construction regulations are coming, and when? | Fabrick",
  description:
    "Future Homes Standard, Part Z, UK CBAM, MEES, EPC C minimum and more. Every UK construction sustainability rule on a single timeline, filterable by role and category.",
};

const painPoints = [
  {
    icon: Building2,
    audience: "Developers",
    point: "Know which regulations will affect your upcoming projects before you commit",
  },
  {
    icon: HardHat,
    audience: "Contractors",
    point: "Stay ahead of compliance deadlines that impact procurement and delivery",
  },
  {
    icon: Warehouse,
    audience: "Manufacturers",
    point: "Prepare for CBAM, EPD requirements, and carbon reporting mandates",
  },
  {
    icon: Landmark,
    audience: "Policy & Compliance",
    point: "Track every regulation in one place - no more scattered government consultations",
  },
];

export default function RegulationsPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
            Fabrick Analysis
          </span>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl leading-[1.05]">
            What construction regulations are coming, and when?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            Future Homes Standard, Part Z, UK CBAM, MEES, EPC C minimum and
            more. Every UK construction sustainability rule on a single
            timeline, filterable by role and category.
          </p>

          {/* Who this is for */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {painPoints.map(({ icon: Icon, audience, point }) => (
              <div
                key={audience}
                className="rounded-xl bg-navy-light/60 border border-gray-700/40 px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-4 w-4 text-pink shrink-0" />
                  <span className="text-xs font-semibold text-white">{audience}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fabrick Analysis - what to prioritise this quarter */}
      <section className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-charcoal p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-pink" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink">
              Fabrick Analysis
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold leading-tight">
            What to prioritise this quarter
          </h2>
          <p className="mt-3 text-sm text-gray-300 max-w-3xl leading-relaxed">
            Forty-plus regulatory items in flight; only a handful actually move
            project decisions in the next 90 days. Here are the three to pay
            attention to now, with the action each role should take.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-navy-light/60 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-pink" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-pink">
                  Now
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">
                Future Homes Standard final guidance
              </h3>
              <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                Approved Documents L &amp; F (2026) confirmed. Solar PV, low-carbon
                heating and tighter U-values mandatory for new homes from Dec 2026.
              </p>
              <p className="mt-2 text-[11px] text-teal font-semibold">
                Action: lock in heat pump + PV supply chain. Build HEM modelling
                capacity now.
              </p>
            </div>

            <div className="rounded-xl bg-navy-light/60 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                  Within 90 days
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">
                UK CBAM scoping window
              </h3>
              <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                Carbon Border Adjustment hits steel, aluminium and cement
                imports from Jan 2027. Reporting starts before that - pricing
                ahead of supply.
              </p>
              <p className="mt-2 text-[11px] text-teal font-semibold">
                Action: audit imported material exposure. Lock in UK-route
                supply where possible.
              </p>
            </div>

            <div className="rounded-xl bg-navy-light/60 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-teal" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal">
                  Watch
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">
                Part Z whole-life carbon
              </h3>
              <p className="mt-1.5 text-xs text-gray-400 leading-relaxed">
                Industry-backed proposal gaining Parliamentary support. Once
                mandated, large projects will need whole-life carbon
                assessments and reporting.
              </p>
              <p className="mt-2 text-[11px] text-teal font-semibold">
                Action: start practising on current projects. Build the
                methodology before it&rsquo;s required.
              </p>
            </div>
          </div>

          <p className="mt-5 text-[11px] text-gray-500">
            Fabrick analysis based on UK government consultations, industry
            briefings and regulatory pipelines. Updated monthly.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <RegulationTimeline />
      </div>

      {/* Fabrick CTAs */}
      <FabrickPlatformCTA />
      <FabrickMarketingCTA />
    </div>
  );
}
