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
} from "lucide-react";
import {
  AIRankingsChart,
  AIPaidFreeChart,
  AICategoryHeatmap,
  AICategoryDeepDive,
} from "@/components/research/AIResearchCharts";

export const metadata: Metadata = {
  title: "How Accurate is AI for UK Construction? | Fabrick Research",
  description:
    "Fabrick tested 10 AI models on 1,001 technical UK construction questions across 20 categories. Claude Opus led at 77%. Paid models beat free by 10 percentage points. See the definitive results.",
  keywords: [
    "AI construction accuracy",
    "AI model comparison construction",
    "Claude Opus construction",
    "ChatGPT construction accuracy",
    "Perplexity construction",
    "UK construction AI research",
    "AI building regulations test",
    "construction AI benchmark",
  ],
  openGraph: {
    title: "How Accurate is AI for UK Construction? | Fabrick Research",
    description:
      "1,001 questions. 10 AI models. 20 categories. Fabrick's definitive accuracy benchmark for AI in UK construction.",
    url: "https://fabrick-sustainability-hub.vercel.app/research/ai-construction-search",
  },
};

const heroStats = [
  { value: "1,001", label: "Questions" },
  { value: "10", label: "AI Models" },
  { value: "20", label: "Categories" },
  { value: "77%", label: "Best Score", accent: true },
];

const methodology = [
  {
    icon: Settings,
    title: "1,001 Technical Questions",
    text: "Questions spanning building regulations, British Standards, health and safety, fire safety, structural design and 15 other categories relevant to UK construction professionals.",
    accent: "pink" as const,
  },
  {
    icon: Layers,
    title: "10 AI Models Tested",
    text: "5 paid and 5 free models from OpenAI, Anthropic, Google, Mistral and Perplexity, all tested with identical prompts and scoring criteria.",
    accent: "teal" as const,
  },
  {
    icon: CheckCircle,
    title: "3-Point Scoring",
    text: "Each answer scored as Correct (full marks), Partial (half marks) or Wrong (zero). Scores verified against published standards and regulations.",
    accent: "pink" as const,
  },
  {
    icon: Star,
    title: "20 Specialist Categories",
    text: "From Accessibility to Waterproofing, covering the full breadth of knowledge a UK construction professional might need from an AI assistant.",
    accent: "teal" as const,
  },
];

const findings = [
  {
    stat: "77%",
    label: "Highest overall score",
    text: "Claude Opus 4.6 led the pack at 77%. No model broke the 80% barrier, highlighting clear limits in AI's construction knowledge.",
    accent: "pink" as const,
  },
  {
    stat: "10pp",
    label: "Paid vs free gap",
    text: "Paid models averaged 66.2% versus 55.9% for free models. A 10 percentage point gap that makes the business case for paid subscriptions clear.",
    accent: "teal" as const,
  },
  {
    stat: "4.7%",
    label: "Lowest error rate",
    text: "Claude Opus had only 47 outright wrong answers from 1,001 questions. The worst performer got 400 wrong (40.0%).",
    accent: "pink" as const,
  },
  {
    stat: "91%",
    label: "Best category score",
    text: "Claude Opus scored 91% on Sustainability and Carbon. Well-documented, publicly available standards consistently produced higher AI accuracy.",
    accent: "teal" as const,
  },
  {
    stat: "Web",
    label: "Perplexity advantage",
    text: "Perplexity models consistently outperformed ChatGPT models, likely due to real-time web search giving access to current standards and guidance.",
    accent: "pink" as const,
  },
  {
    stat: "48%",
    label: "Worst category average",
    text: "Construction Technology, Contracts, Waterproofing and Demolition all averaged under 50%. Paywalled and niche specialist standards are poorly represented in AI training data.",
    accent: "teal" as const,
  },
];

const conclusions = [
  {
    title: "AI is useful but not reliable enough to replace professional judgment.",
    text: "Even the best model got 23% of answers wrong or only partially right. For safety-critical decisions, always verify AI output against published standards.",
  },
  {
    title: "Pay for your AI tools.",
    text: "The 10 percentage point gap between paid and free models is significant. If you're using AI for construction work, a paid subscription is recommended.",
  },
  {
    title: "Web-connected AI performs better.",
    text: "Perplexity's real-time web access gave it a measurable advantage over models relying purely on training data. Look for AI tools that can reference live sources.",
  },
  {
    title: "Specialist and paywalled standards remain a blind spot.",
    text: "AI struggles most with niche areas like waterproofing, construction technology and contracts. These are precisely the areas where professionals need the most help.",
  },
  {
    title: "AI accuracy tracks public data availability.",
    text: "Well-documented areas like planning, health and safety, and sustainability score highest. Industry bodies should consider how their standards are made accessible to AI systems.",
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
              Research published 2025
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-5xl lg:text-6xl leading-tight max-w-4xl">
            How Accurate is AI for UK Construction?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            1,001 questions. 10 AI models. 20 categories. One definitive answer.
          </p>

          {/* Hero stats */}
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-4">
            {heroStats.map((s) => (
              <div key={s.label} className="bg-navy-light p-5 text-center">
                <p className={`text-2xl md:text-3xl font-bold ${s.accent ? "text-teal" : "text-pink"}`}>{s.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">Methodology</h2>
          <p className="mt-2 text-warm-gray">
            How we tested AI&apos;s knowledge of UK construction standards and regulations.
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">Overall Rankings</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
              All 10 models ranked by accuracy
            </h2>
            <p className="mt-2 text-warm-gray">Across 1,001 questions covering UK construction standards and regulations.</p>
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">Key Findings</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl">
              What the data reveals about AI in UK construction
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {findings.map((f) => (
              <div key={f.label} className="rounded-2xl bg-navy-light p-6">
                <p className={`text-4xl font-bold ${f.accent === "pink" ? "text-pink" : "text-teal"}`}>{f.stat}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-400">{f.label}</p>
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">Paid vs Free</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
            Is paying for AI worth it in construction?
          </h2>
          <p className="mt-2 text-warm-gray">The data is decisive.</p>
        </div>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-teal p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Paid models average</p>
            <p className="mt-2 text-5xl font-bold">66.2%</p>
            <p className="mt-1 text-sm text-white/80">5 models tested</p>
          </div>
          <div className="rounded-2xl bg-pink p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Free models average</p>
            <p className="mt-2 text-5xl font-bold">55.9%</p>
            <p className="mt-1 text-sm text-white/80">5 models tested</p>
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
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">Category Heatmap</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
              All 20 categories across all 10 models
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
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">Category Deep Dive</span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
            Compare model performance by category
          </h2>
          <p className="mt-2 text-warm-gray">Select any of the 20 categories to see how each model performed.</p>
        </div>
        <AICategoryDeepDive />
      </section>

      {/* Conclusions */}
      <section className="bg-cream-dark py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-pink" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">Conclusions</span>
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

      {/* Footer note + back to research */}
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-cream-dark bg-white p-6">
          <p className="text-sm leading-relaxed text-warm-gray">
            This study was conducted by Fabrick in 2025. All questions were written by construction industry
            professionals and verified against published UK standards and regulations. Models tested using identical
            prompts and 3-point scoring (Correct / Partial / Wrong).
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
            >
              <BookOpen className="h-4 w-4" />
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
