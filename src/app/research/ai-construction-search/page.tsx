import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import {
  Brain,
  ArrowRight,
  BarChart3,
  CheckCircle,
  Award,
  Settings,
  Star,
  Layers,
  Globe,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  FlaskConical,
} from "lucide-react";
import {
  AIRankingsChart,
  AIPaidFreeChart,
  AICategoryHeatmap,
  AICategoryDeepDive,
} from "@/components/research/AIResearchCharts";
// Imported from the data module rather than the chart component: plain values
// cannot cross a "use client" boundary into a server component.
import { MODELS, STUDY } from "@/components/research/aiStudyData";

// Everything quoted below is derived from the study data rather than typed by
// hand, so a re-run cannot leave stale figures in the copy.
const best = MODELS[0];
const worst = MODELS[MODELS.length - 1];
const bestErrorRate = ((best.wrong / (best.correct + best.partial + best.wrong)) * 100).toFixed(1);
const worstErrorRate = ((worst.wrong / (worst.correct + worst.partial + worst.wrong)) * 100).toFixed(1);
const notFullyRight = (100 - best.score).toFixed(1);

export const metadata: Metadata = {
  title: "How Accurate is AI for UK Construction? | Fabrick Research",
  description: `Fabrick tested ${STUDY.models} AI models on ${STUDY.questions.toLocaleString()} technical UK construction questions across ${STUDY.categories} categories. ${best.name} led at ${best.score}%. Paid models beat free by ${STUDY.gapPp} percentage points.`,
  keywords: [
    "AI construction accuracy",
    "AI model comparison construction",
    "UK construction AI research",
    "AI building regulations test",
    "construction AI benchmark",
    "Claude Opus construction",
    "GPT construction accuracy",
    "Gemini construction",
  ],
  openGraph: {
    title: "How Accurate is AI for UK Construction? | Fabrick Research",
    description: `${STUDY.questions.toLocaleString()} questions. ${STUDY.models} AI models. ${STUDY.categories} categories. Fabrick's accuracy benchmark for AI in UK construction.`,
    url: "https://pulse.fabrick.agency/research/ai-construction-search",
  },
};

const heroStats = [
  { value: STUDY.questions.toLocaleString(), label: "Questions" },
  { value: String(STUDY.models), label: "AI Models" },
  { value: String(STUDY.categories), label: "Categories" },
  { value: `${best.score}%`, label: "Best Score", accent: true },
];

const methodology = [
  {
    icon: Settings,
    title: `${STUDY.questions.toLocaleString()} technical questions`,
    text: `Building regulations, British Standards, health and safety, fire safety, structural design and ${STUDY.categories - 5} other categories. Every answer is tied to a named clause, table or section in a published UK document.`,
    accent: "pink" as const,
  },
  {
    icon: Layers,
    title: `${STUDY.models} models, exact versions published`,
    text: `${STUDY.paidCount} paid and ${STUDY.freeCount} free models from Anthropic, OpenAI, Google, xAI, Mistral, DeepSeek, Moonshot and Perplexity. Each is listed with the precise API identifier tested, not just a marketing name.`,
    accent: "teal" as const,
  },
  {
    icon: CheckCircle,
    title: "Graded blind, by two AIs",
    text: `Each answer is scored Correct, Partial or Wrong by two models from different vendors, neither told which AI wrote the answer. A score counts only where both agree. They agreed ${STUDY.judgeAgreement}% of the time.`,
    accent: "pink" as const,
  },
  {
    icon: Star,
    title: "Identical prompt for every model",
    text: "No documents supplied, no web search requested, no follow-up questions. This measures what each model knows unaided, which is how most people actually ask it.",
    accent: "teal" as const,
  },
];

const findings = [
  {
    stat: `${best.score}%`,
    label: "Highest overall score",
    text: `${best.name} led the field. No model was fully right on more than ${Math.round(best.score)}% of the marks available, which puts a hard ceiling on how far any of them can be trusted unaided.`,
    accent: "pink" as const,
  },
  {
    stat: `${STUDY.gapPp}pp`,
    label: "Paid versus free gap",
    text: `Paid models averaged ${STUDY.paidAvg}% against ${STUDY.freeAvg}% for free ones. If you use AI for construction work, the subscription is doing something.`,
    accent: "teal" as const,
  },
  {
    stat: `${bestErrorRate}%`,
    label: "Lowest error rate",
    text: `Even the best model got ${best.wrong} of ${STUDY.questions.toLocaleString()} questions outright wrong. The weakest, ${worst.name}, got ${worst.wrong} wrong (${worstErrorRate}%).`,
    accent: "pink" as const,
  },
  {
    stat: `${notFullyRight}%`,
    label: "Not fully right, best model",
    text: `Counting partial credit, the leading model still failed to give a complete, correct answer on ${notFullyRight}% of the marks available. That is the number to hold in your head before relying on any of this.`,
    accent: "teal" as const,
  },
  {
    stat: `${STUDY.judgeAgreement}%`,
    label: "Inter-judge agreement",
    text: `Two AI judges from different vendors agreed on ${STUDY.judgeAgreement}% of the ${STUDY.responses.toLocaleString()} answers. Disagreements were excluded rather than settled by picking a favourite judge.`,
    accent: "pink" as const,
  },
  {
    stat: `${STUDY.bands}`,
    label: "Groups, not places",
    text: `Models within ${STUDY.tieBandPp} percentage points of each other are too close to separate, so the ${STUDY.models} models resolve into ${STUDY.bands} groups. Three lead the field; six more are bunched in the middle.`,
    accent: "teal" as const,
  },
];

const conclusions = [
  {
    title: `Read the table as ${STUDY.bands} groups, not ${STUDY.models} places.`,
    text: `Models within ${STUDY.tieBandPp} percentage points of each other are tied. Three models lead on ${best.score}% to ${MODELS[2].score}%; six more sit bunched together in the middle. Picking between models inside a band on these numbers would be reading noise.`,
  },
  {
    title: "Useful for recall. Not a substitute for a competent person.",
    text: `The best model still leaves ${notFullyRight}% of the available marks on the table. For anything that carries safety, regulatory or contractual weight, check the answer against the published document before you act on it.`,
  },
  {
    title: "Ask for the clause, then go and read it.",
    text: "These models are strongest at telling you where a requirement lives. Used as a way into a document rather than a replacement for it, they save real time at low risk.",
  },
  {
    title: "Pay for the tool if the work matters.",
    text: `A ${STUDY.gapPp} percentage point gap between paid and free is not a rounding error. If AI is touching billable work, the free tier is the wrong place to do it.`,
  },
  {
    title: "Specialist and paywalled standards remain the weak spot.",
    text: "Accuracy tracks how freely available a document is. Areas that sit behind paywalls or in niche guidance score consistently worse, and those are often exactly where professionals need help.",
  },
  {
    title: "Treat any figure here as a snapshot.",
    text: "Several models tested are preview releases, and providers change models behind the same name. We publish the exact version identifiers so you can tell whether a result still applies.",
  },
];

export default function AIConstructionSearchPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Research", href: "/research" },
              { label: "AI Accuracy in UK Construction" },
            ]}
          />

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink/20">
              <Brain className="h-5 w-5 text-pink" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <CheckCircle className="h-3 w-3" />
              Tested 28 July 2026
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-5xl lg:text-6xl leading-tight max-w-4xl">
            How Accurate is AI for UK Construction?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            {STUDY.questions.toLocaleString()} questions. {STUDY.models} AI models.{" "}
            {STUDY.categories} categories. Graded blind, with the workings published.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
            {heroStats.map((s) => (
              <div key={s.label} className="bg-navy-light p-5 text-center">
                <p className={`text-2xl md:text-3xl font-bold ${s.accent ? "text-teal" : "text-pink"}`}>
                  {s.value}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <Link
            href="/research/ai-construction-search/methodology"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <FlaskConical className="h-4 w-4 text-teal" />
            Read the full methodology and limitations
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Methodology summary */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
            How we tested
          </h2>
          <p className="mt-2 text-warm-gray">
            The short version. The{" "}
            <Link
              href="/research/ai-construction-search/methodology"
              className="font-semibold text-teal underline underline-offset-2"
            >
              full methodology
            </Link>{" "}
            lists every model version, the scoring rubric, and where this study is weak.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {methodology.map((m) => {
            const Icon = m.icon;
            const accentBg = m.accent === "pink" ? "bg-pink/10" : "bg-teal/10";
            const accentFg = m.accent === "pink" ? "text-pink" : "text-teal";
            return (
              <div key={m.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentBg}`}>
                  <Icon className={`h-5 w-5 ${accentFg}`} />
                </div>
                <h3 className="mt-4 text-base font-bold text-navy">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-warm-gray">{m.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Overall Rankings */}
      <section className="bg-cream-dark py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-teal" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
                Overall Rankings
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
              All {STUDY.models} models, scored and grouped
            </h2>
            <p className="mt-2 text-warm-gray">
              Across {STUDY.questions.toLocaleString()} questions on UK construction standards and
              regulations. Models close enough to be tied are grouped rather than separated by
              place. Hover any bar for the correct, partial and wrong split.
            </p>
          </div>
          <AIRankingsChart />
        </div>
      </section>

      {/* Key Findings */}
      <section className="bg-charcoal py-12 md:py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-pink" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
                Key Findings
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl">
              What the data reveals about AI in UK construction
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {findings.map((f) => (
              <div key={f.label} className="rounded-2xl bg-navy-light p-6">
                <p className={`text-4xl font-bold ${f.accent === "pink" ? "text-pink" : "text-teal"}`}>
                  {f.stat}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {f.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-300">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paid vs Free */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-pink" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
              Paid vs Free
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
            Is paying for AI worth it in construction?
          </h2>
          <p className="mt-2 text-warm-gray">
            &ldquo;Paid&rdquo; means a professional would need a paid subscription or paid API access
            to reach that model. The full definition is in the methodology.
          </p>
        </div>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-teal p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Paid models average
            </p>
            <p className="mt-2 text-5xl font-bold">{STUDY.paidAvg}%</p>
            <p className="mt-1 text-sm text-white/80">{STUDY.paidCount} models tested</p>
          </div>
          <div className="rounded-2xl bg-pink p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Free models average
            </p>
            <p className="mt-2 text-5xl font-bold">{STUDY.freeAvg}%</p>
            <p className="mt-1 text-sm text-white/80">{STUDY.freeCount} models tested</p>
          </div>
        </div>
        <AIPaidFreeChart />
      </section>

      {/* Heatmap */}
      <section className="bg-cream-dark py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-teal" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
                Category Heatmap
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
              All {STUDY.categories} categories across all {STUDY.models} models
            </h2>
            <p className="mt-2 text-warm-gray">Green is good. Red is risky.</p>
          </div>
          <AICategoryHeatmap />
        </div>
      </section>

      {/* Deep dive */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mb-8 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-pink" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
              Category Deep Dive
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
            Compare model performance by category
          </h2>
          <p className="mt-2 text-warm-gray">
            Select any of the {STUDY.categories} categories to see how each model performed.
          </p>
        </div>
        <AICategoryDeepDive />
      </section>

      {/* Conclusions */}
      <section className="bg-cream-dark py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-pink" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
                Conclusions
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
              What this means for UK construction professionals
            </h2>
          </div>
          <ol className="space-y-4">
            {conclusions.map((c, i) => (
              <li key={c.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-bold text-white">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-warm-gray">{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer note */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-cream-dark bg-white p-6">
          <p className="text-sm leading-relaxed text-warm-gray">
            All {STUDY.responses.toLocaleString()} answers were collected from the models on 28 July
            2026, with scoring completed on 29 July 2026. The {STUDY.questions.toLocaleString()}{" "}
            questions were generated against published UK standards and Approved Documents, with each
            answer tied to a specific clause, table or section; they have not been independently
            verified by a chartered professional. Answers were graded by two AI models from different
            vendors, blind to which model produced each answer, and counted only where both agreed.
            Exact model versions, the scoring rubric and the study&apos;s limitations are set out in
            the{" "}
            <Link
              href="/research/ai-construction-search/methodology"
              className="font-semibold text-teal underline underline-offset-2"
            >
              methodology
            </Link>
            .
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/research/ai-construction-search/methodology"
              className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
            >
              <FlaskConical className="h-4 w-4" />
              Methodology
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cream-dark bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-cream"
            >
              <BookOpen className="h-4 w-4 text-teal" />
              All Research
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-cream-dark bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-cream"
            >
              <BarChart3 className="h-4 w-4 text-teal" />
              Live Dashboards
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <FabrickPlatformCTA />
    </div>
  );
}
