import { KnowledgeHub } from "@/components/knowledge/KnowledgeHub";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Briefcase, HardHat, Megaphone, GraduationCap } from "lucide-react";

export const metadata = {
  title: "Knowledge Hub | Fabrick Built Environment Data",
  description:
    "Plain-English guides to construction sustainability. Embodied carbon, EPDs, Part Z, Future Homes Standard, and more explained.",
};

const painPoints = [
  {
    icon: Briefcase,
    audience: "Business Leaders",
    point: "Understand sustainability without the jargon - make confident strategic decisions",
  },
  {
    icon: HardHat,
    audience: "Technical Teams",
    point: "Deep-dive into EPDs, BREEAM, Part Z, and carbon calculation methodologies",
  },
  {
    icon: Megaphone,
    audience: "Marketing & Comms",
    point: "Get the facts right when communicating your sustainability credentials",
  },
  {
    icon: GraduationCap,
    audience: "CPD & Training",
    point: "Use as a reference resource for team upskilling and sustainability training",
  },
];

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-medium uppercase tracking-wider text-teal">
            Learn
          </span>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl">
            Knowledge Hub
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            Plain-English guides to construction sustainability. From embodied
            carbon fundamentals to regulatory deep-dives, everything you need to
            know in one place.
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

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <KnowledgeHub />
      </div>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
