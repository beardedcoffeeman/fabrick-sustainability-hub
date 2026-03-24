import { RegulationTimeline } from "@/components/regulatory/RegulationTimeline";
import { FabrickMarketingCTA } from "@/components/layout/FabrickCTA";
import { Building2, HardHat, Warehouse, Landmark } from "lucide-react";

export const metadata = {
  title: "UK Construction Sustainability Regulations | Fabrick Sustainability Hub",
  description:
    "Track every upcoming UK construction sustainability regulation. Part Z, Future Homes Standard, UK CBAM, UKNZCBS, EPC requirements and more.",
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
    point: "Track every regulation in one place — no more scattered government consultations",
  },
];

export default function RegulationsPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-medium uppercase tracking-wider text-pink">
            Regulatory Intelligence
          </span>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl">
            UK Regulation Tracker
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            Every upcoming UK sustainability regulation affecting the
            construction industry. Filterable by your role and regulation
            category. Never miss a deadline.
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

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <RegulationTimeline />
      </div>

      {/* Fabrick CTA */}
      <FabrickMarketingCTA />
    </div>
  );
}
