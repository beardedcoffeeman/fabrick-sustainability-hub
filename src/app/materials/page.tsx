import { MaterialsPageContent } from "@/components/materials/MaterialsPageContent";
import { FabrickMarketingCTA, FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Ruler, HardHat, Warehouse, ClipboardCheck } from "lucide-react";

export const metadata = {
  title: "Material Carbon Calculator | Fabrick Sustainability Hub",
  description:
    "Specify construction materials, calculate embodied carbon impact, and discover lower-carbon alternatives. Powered by the ICE database with LETI and RIBA 2030 benchmarks.",
};

const painPoints = [
  {
    icon: Ruler,
    audience: "Architects",
    point: "Quickly compare embodied carbon across material options at design stage",
  },
  {
    icon: HardHat,
    audience: "Contractors",
    point: "Demonstrate carbon awareness in tender submissions and procurement",
  },
  {
    icon: Warehouse,
    audience: "Manufacturers",
    point: "Benchmark your products against industry averages and LETI targets",
  },
  {
    icon: ClipboardCheck,
    audience: "Sustainability Leads",
    point: "Build evidence for Part Z compliance and carbon reporting requirements",
  },
];

export default function MaterialsPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 pb-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-medium uppercase tracking-wider text-teal">
            ICE Database · LETI Benchmarks
          </span>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl">
            Carbon Calculator
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            Specify your materials, see the carbon impact, and discover
            lower-carbon alternatives that align with Future Homes Standard and
            Part Z requirements.
          </p>

          {/* Who this is for */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {painPoints.map(({ icon: Icon, audience, point }) => (
              <div
                key={audience}
                className="rounded-xl bg-navy-light/60 border border-gray-700/40 px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-4 w-4 text-teal shrink-0" />
                  <span className="text-xs font-semibold text-white">{audience}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MaterialsPageContent />

      {/* Fabrick CTAs */}
      <FabrickPlatformCTA />
      <FabrickMarketingCTA />
    </div>
  );
}
