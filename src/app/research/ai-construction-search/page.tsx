import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import {
  Brain,
  Mail,
  ArrowRight,
  Search,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Shield,
  BookOpen,
} from "lucide-react";
import { EmailCaptureStacked } from "@/components/research/EmailCaptureForm";

export const metadata: Metadata = {
  title: "AI in Construction Search & Procurement | Fabrick Research",
  description:
    "How construction professionals use ChatGPT, AI search tools, and Google AI Overviews to find suppliers and products. The UK's first study into AI-driven discovery and procurement in the built environment.",
  keywords: [
    "AI construction search",
    "ChatGPT construction",
    "AI procurement construction",
    "Google AI Overviews construction",
    "AI supplier discovery",
    "construction AI research UK",
    "built environment AI study",
  ],
  openGraph: {
    title: "AI in Construction Search & Procurement | Fabrick Research",
    description:
      "How construction professionals use ChatGPT, AI search tools, and Google AI Overviews to find suppliers and products.",
    url: "https://fabrick-sustainability-hub.vercel.app/research/ai-construction-search",
  },
};

const measurementAreas = [
  {
    label: "AI tool usage frequency",
    detail: "Which tools, how often, and for what tasks",
  },
  {
    label: "Trust in AI recommendations",
    detail: "How much professionals rely on AI-generated supplier suggestions",
  },
  {
    label: "Verification behaviours",
    detail:
      "What people do after an AI recommends a product or supplier",
  },
  {
    label: "Role and sector differences",
    detail:
      "How usage varies across architects, contractors, specifiers, and procurement teams",
  },
  {
    label: "Impact on supplier selection",
    detail:
      "Whether AI recommendations influence shortlists, specifications, and purchasing decisions",
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
              { label: "AI in Construction Search" },
            ]}
          />

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink/20">
              <Brain className="h-5 w-5 text-pink" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <Clock className="h-3 w-3" />
              Research launching Q2 2026
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-5xl lg:text-6xl leading-tight max-w-4xl">
            AI in Construction: How the Industry Searches, Discovers & Decides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            The UK&apos;s first study into how construction professionals use AI
            tools to find and evaluate suppliers, products, and services.
          </p>

          {/* Key stats */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { label: "400+ survey respondents", icon: Users },
              { label: "20 expert interviews", icon: BarChart3 },
              { label: "6 sectors covered", icon: Target },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="inline-flex items-center gap-2 rounded-full bg-navy-light px-4 py-2"
                >
                  <Icon className="h-3.5 w-3.5 text-teal" />
                  <span className="text-sm font-medium text-gray-300">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left column - main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* 1. The Question */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink/10">
                  <Search className="h-4 w-4 text-pink" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
                  The Question
                </h2>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-warm-gray leading-relaxed">
                  Are construction professionals using AI to find and evaluate
                  suppliers? How is this changing search and procurement
                  behaviour across the built environment?
                </p>
                <p className="mt-4 text-warm-gray leading-relaxed">
                  From ChatGPT to Google AI Overviews, AI tools are reshaping
                  how professionals discover products, compare options, and make
                  purchasing decisions. But nobody has measured the scale or
                  nature of this shift in construction.
                </p>
              </div>
            </div>

            {/* 2. Why This Matters */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10">
                  <TrendingUp className="h-4 w-4 text-teal" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
                  Why This Matters
                </h2>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-warm-gray leading-relaxed">
                  No research currently examines how AI is changing construction
                  discovery, evaluation, and supplier selection. The brands that
                  understand this shift first will have a significant
                  competitive advantage.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "For manufacturers & suppliers",
                      text: "Understand how your customers are finding you (or your competitors) through AI tools",
                    },
                    {
                      title: "For specifiers & architects",
                      text: "Benchmark your own AI usage against the industry and discover better workflows",
                    },
                    {
                      title: "For marketing teams",
                      text: "Know whether your content strategy needs to evolve for AI-driven discovery",
                    },
                    {
                      title: "For industry bodies",
                      text: "Quantified data on AI adoption to inform guidance, training, and policy",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-lg bg-cream p-4"
                    >
                      <h4 className="text-sm font-semibold text-navy">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-xs text-warm-gray leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Methodology */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy/10">
                  <BarChart3 className="h-4 w-4 text-navy" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
                  Methodology
                </h2>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="rounded-xl bg-charcoal p-5 text-white">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-teal mb-2">
                      Quantitative
                    </h4>
                    <p className="text-3xl font-bold">400-600</p>
                    <p className="text-sm text-gray-400 mt-1">
                      survey respondents
                    </p>
                    <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                      Across architects, contractors, developers,
                      manufacturers, specifiers, and procurement professionals.
                    </p>
                  </div>
                  <div className="rounded-xl bg-charcoal p-5 text-white">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-pink mb-2">
                      Qualitative
                    </h4>
                    <p className="text-3xl font-bold">15-20</p>
                    <p className="text-sm text-gray-400 mt-1">
                      expert interviews
                    </p>
                    <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                      In-depth conversations with senior professionals to
                      understand nuance, context, and emerging behaviours.
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2 rounded-lg bg-cream px-4 py-3">
                  <Clock className="h-4 w-4 text-warm-gray shrink-0" />
                  <p className="text-sm text-warm-gray">
                    <span className="font-semibold text-navy">Timeline:</span>{" "}
                    April - June 2026
                  </p>
                </div>
              </div>
            </div>

            {/* 4. What We'll Measure */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink/10">
                  <Target className="h-4 w-4 text-pink" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
                  What We&apos;ll Measure
                </h2>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="space-y-3">
                  {measurementAreas.map((area) => (
                    <div
                      key={area.label}
                      className="flex gap-3 rounded-lg bg-cream p-4"
                    >
                      <CheckCircle className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-navy">
                          {area.label}
                        </h4>
                        <p className="mt-0.5 text-xs text-warm-gray">
                          {area.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Key Benchmarks */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10">
                  <Shield className="h-4 w-4 text-teal" />
                </div>
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
                  Key Benchmarks
                </h2>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="rounded-xl bg-navy p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal mb-3">
                    RICS 2025 Digital Technology Survey
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-4xl font-bold text-pink">50%</p>
                      <p className="text-xs text-gray-400 mt-1">
                        have no AI implementation
                      </p>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-teal">1%</p>
                      <p className="text-xs text-gray-400 mt-1">
                        report full AI integration
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-warm-gray leading-relaxed">
                  The RICS data tells us where the industry sits on broad AI
                  adoption. Our research goes deeper, specifically examining
                  how AI is changing the way construction professionals search
                  for, discover, and select suppliers and products. This is the
                  layer that directly affects marketing strategy, brand
                  visibility, and commercial outcomes.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-6">
            {/* Email capture card */}
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl bg-charcoal p-6 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink/20 mb-4">
                  <Mail className="h-5 w-5 text-pink" />
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold">
                  Get Early Access
                </h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                  We&apos;ll send you the report as soon as it&apos;s
                  published. No spam, just the research.
                </p>
                <EmailCaptureStacked />
              </div>

              {/* Timeline */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold text-navy mb-4">
                  Research Timeline
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      phase: "Survey Design",
                      date: "March 2026",
                      done: true,
                    },
                    {
                      phase: "Data Collection",
                      date: "April - May 2026",
                      done: false,
                    },
                    {
                      phase: "Expert Interviews",
                      date: "May - June 2026",
                      done: false,
                    },
                    {
                      phase: "Analysis & Writing",
                      date: "June 2026",
                      done: false,
                    },
                    {
                      phase: "Report Launch",
                      date: "Late Q2 2026",
                      done: false,
                    },
                  ].map((step) => (
                    <div
                      key={step.phase}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${
                          step.done
                            ? "bg-teal text-white"
                            : "bg-cream border-2 border-cream-dark"
                        }`}
                      >
                        {step.done && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            step.done ? "text-navy" : "text-warm-gray"
                          }`}
                        >
                          {step.phase}
                        </p>
                        <p className="text-xs text-warm-gray">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explore more */}
              <div className="rounded-2xl bg-cream-dark p-6">
                <h3 className="text-sm font-bold text-navy mb-3">
                  Explore more
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/research"
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-navy transition-colors hover:bg-cream"
                  >
                    <BookOpen className="h-4 w-4 text-teal" />
                    All Research
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-warm-gray" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-navy transition-colors hover:bg-cream"
                  >
                    <BarChart3 className="h-4 w-4 text-pink" />
                    Live Dashboards
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-warm-gray" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FabrickPlatformCTA />
    </div>
  );
}
