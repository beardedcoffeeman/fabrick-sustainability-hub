import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import {
  Brain,
  ArrowRight,
  Search,
  Users,
  BarChart3,
  Tag,
  Building2,
} from "lucide-react";
import { EmailCaptureInline } from "@/components/research/EmailCaptureForm";
import { MODELS as AI_MODELS, STUDY } from "@/components/research/aiStudyData";

export const metadata: Metadata = {
  title: "Original UK Construction Research | Pulse by Fabrick",
  description:
    "Original Fabrick research into how UK construction professionals search, evaluate suppliers and make purchasing decisions. AI accuracy and search behaviour.",
  keywords: [
    "construction industry research UK",
    "built environment market research",
    "construction AI research",
    "construction procurement research",
    "built environment data insights",
  ],
  openGraph: {
    title:
      "How does the UK construction industry actually decide? | Pulse by Fabrick",
    description:
      "Original Fabrick research into UK construction decision-making, AI in procurement, and market intelligence.",
    url: "https://pulse.fabrick.agency/research",
  },
};

const researchStudies = [
  {
    slug: "planning-explorer",
    title: "Planning Explorer: where UK construction is actually building",
    status: "New",
    description:
      "Real UK planning applications across eight construction sectors, decoded for the people who supply the industry. See where demand is moving, which LPAs are most active, and which applicants are filing the schemes you want to be specified into.",
    statsPreview: "Real applications | 8 sectors | All UK LPAs",
    tags: ["Planning Intelligence", "Sector Trends", "Specifier Marketing", "Built Environment"],
    icon: Building2,
    published: true,
  },
  {
    slug: "ai-construction-search",
    title: "How Accurate is AI for UK Construction?",
    status: "Updated July 2026",
    description: `Fabrick put ${STUDY.questions.toLocaleString()} technical UK construction questions to ${STUDY.models} AI models across ${STUDY.categories} categories, including the newest releases from Anthropic, OpenAI, Google and Moonshot. ${AI_MODELS[0].name} led at ${AI_MODELS[0].score}%. Paid models beat free by ${STUDY.gapPp} percentage points. Every answer graded blind by two AI judges, with the exact model versions published.`,
    statsPreview: `${STUDY.questions.toLocaleString()} questions | ${STUDY.models} AI models | ${STUDY.categories} categories`,
    tags: ["AI", "Accuracy Benchmark", "UK Standards", "Model Comparison"],
    icon: Brain,
    published: true,
  },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Research" },
            ]}
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-3 inline-block">
            Fabrick Research
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl leading-[1.05]">
            How does the UK construction industry actually decide?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            Original Fabrick research into how UK construction
            professionals search, evaluate suppliers, and make purchasing
            decisions in 2026.
          </p>
        </div>
      </section>

      {/* Research Cards Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {researchStudies.map((study) => {
            const Icon = study.icon;
            return (
              <div
                key={study.slug}
                className="group relative flex flex-col rounded-3xl bg-white shadow-sm border border-cream-dark overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                {/* Card header */}
                <div className="bg-charcoal px-6 pt-6 pb-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink/20">
                      <Icon className="h-5 w-5 text-pink" />
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${
                        study.published ? "bg-teal" : "bg-pink"
                      }`}
                    >
                      {study.status}
                    </span>
                  </div>
                  <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white leading-snug">
                    {study.title}
                  </h2>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col px-6 py-5">
                  <p className="text-sm text-warm-gray leading-relaxed">
                    {study.description}
                  </p>

                  {/* Stats preview */}
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-cream px-3 py-2.5">
                    <BarChart3 className="h-4 w-4 text-teal shrink-0" />
                    <p className="text-xs font-medium text-navy">
                      {study.statsPreview}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {study.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-cream-dark px-2.5 py-1 text-[10px] font-medium text-warm-gray"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-5 border-t border-cream-dark">
                    {study.published ? (
                      <Link
                        href={`/research/${study.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
                      >
                        View the results
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-navy mb-2.5">
                          Register for early access
                        </p>
                        <EmailCaptureInline />
                        <div className="mt-4">
                          <Link
                            href={`/research/${study.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition-colors hover:text-teal-dark"
                          >
                            Learn more
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* More research coming */}
      <section className="bg-cream-dark py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/10">
                <Search className="h-6 w-6 text-teal" />
              </div>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
              More research coming soon
            </h3>
            <p className="mt-3 text-sm text-warm-gray max-w-lg mx-auto leading-relaxed">
              We are building the UK&apos;s most comprehensive library of
              original research for the built environment. Upcoming studies will
              cover sustainability adoption, specification trends, and digital
              transformation.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[
                "Sustainability",
                "Specification",
                "Digital Transformation",
                "Procurement",
              ].map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1 rounded-full border border-cream-dark bg-cream px-3 py-1.5 text-xs font-medium text-warm-gray"
                >
                  <Users className="h-3 w-3" />
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FabrickPlatformCTA />
    </div>
  );
}
