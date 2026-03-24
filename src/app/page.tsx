import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Search,
  Calendar,
  BookOpen,
  BarChart3,
  Building2,
  Leaf,
  TrendingDown,
  Factory,
  Shield,
} from "lucide-react";
import { FabrickMarketingCTA } from "@/components/layout/FabrickCTA";

const features = [
  {
    title: "Live Carbon Dashboard",
    description:
      "Real-time UK grid carbon intensity with regional breakdowns. See when to run energy-intensive equipment for lowest carbon impact.",
    icon: Zap,
    href: "/dashboard",
    color: "bg-charcoal text-white",
    accent: "text-teal",
  },
  {
    title: "Material Carbon Calculator",
    description:
      "Search 100+ construction materials from the ICE database. Compare embodied carbon and find lower-carbon alternatives.",
    icon: Search,
    href: "/materials",
    color: "bg-teal text-white",
    accent: "text-white/80",
  },
  {
    title: "Regulation Tracker",
    description:
      "Every upcoming UK sustainability regulation in one timeline. Filter by your role — developer, architect, manufacturer, or contractor.",
    icon: Calendar,
    href: "/regulations",
    color: "bg-white text-navy",
    accent: "text-pink",
  },
  {
    title: "Knowledge Hub",
    description:
      "Plain-English guides to embodied carbon, EPDs, Part Z, Future Homes Standard, and every regulation that matters.",
    icon: BookOpen,
    href: "/knowledge",
    color: "bg-pink text-white",
    accent: "text-white/80",
  },
];

const stats = [
  { value: "100+", label: "Materials in database", icon: BarChart3 },
  { value: "10+", label: "Regulations tracked", icon: Shield },
  { value: "Live", label: "Carbon intensity data", icon: Zap },
  { value: "10+", label: "Expert articles", icon: BookOpen },
];

const upcomingRegs = [
  {
    title: "Future Homes Standard",
    date: "Dec 2026",
    description: "75-80% less carbon in new homes",
  },
  {
    title: "UK CBAM Launch",
    date: "Jan 2027",
    description: "Carbon levy on steel, aluminium, cement imports",
  },
  {
    title: "EPC Rating C Minimum",
    date: "Apr 2027*",
    description: "Non-domestic rented buildings (proposed)",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-cream pb-16 pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-teal pulse-live" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal">
                  Live Data &middot; Free Tools &middot; Expert Insight
                </span>
              </div>
              <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold leading-tight text-navy md:text-6xl lg:text-7xl">
                Construction sustainability,{" "}
                <span className="relative inline-block">
                  decoded
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8"
                      stroke="#FF3D7F"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                .
              </h1>
              <p className="mt-6 text-lg text-navy/70 leading-relaxed max-w-xl">
                The UK construction industry&apos;s sustainability data hub. Live
                carbon data, material calculators, regulatory intelligence, and
                practical tools — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-charcoal"
                >
                  Explore the Dashboard
                  <ArrowDownRight className="h-4 w-4 text-pink" />
                </Link>
                <Link
                  href="/materials"
                  className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-light"
                >
                  Carbon Calculator
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Hero right - Stats + mini widget */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                      <Icon className="h-5 w-5 text-teal mb-2" />
                      <p className="text-2xl font-bold text-navy">{stat.value}</p>
                      <p className="text-xs text-warm-gray">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
              {/* Mini regulation preview */}
              <div className="rounded-2xl bg-charcoal p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-pink" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Coming up
                  </span>
                </div>
                <div className="space-y-2">
                  {upcomingRegs.map((reg) => (
                    <div
                      key={reg.title}
                      className="flex items-center justify-between rounded-lg bg-navy-light/50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{reg.title}</p>
                        <p className="text-[10px] text-gray-400">
                          {reg.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-pink/20 px-2 py-0.5 text-[10px] font-bold text-pink">
                        {reg.date}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/regulations"
                  className="mt-3 flex items-center gap-1 text-xs font-semibold text-teal hover:underline"
                >
                  View all regulations
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-pink">
              The Challenge
            </span>
            <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl">
              A regulatory avalanche is coming
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-400">
              The UK construction industry faces unprecedented sustainability
              regulation. Companies that prepare now will thrive. Those that
              don&apos;t will be left behind.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-navy-light p-6">
              <Building2 className="h-8 w-8 text-teal mb-4" />
              <h3 className="text-xl font-bold">25%</h3>
              <p className="text-sm text-gray-400 mt-1">
                of UK carbon emissions come from the built environment —
                construction and buildings are the single largest sector.
              </p>
            </div>
            <div className="rounded-2xl bg-navy-light p-6">
              <Factory className="h-8 w-8 text-pink mb-4" />
              <h3 className="text-xl font-bold">8%</h3>
              <p className="text-sm text-gray-400 mt-1">
                of global CO2 emissions come from cement production alone.
                Material choices in construction have massive carbon
                implications.
              </p>
            </div>
            <div className="rounded-2xl bg-navy-light p-6">
              <TrendingDown className="h-8 w-8 text-teal mb-4" />
              <h3 className="text-xl font-bold">78%</h3>
              <p className="text-sm text-gray-400 mt-1">
                reduction in carbon emissions required by 2035 under the UK&apos;s
                Sixth Carbon Budget. Construction must lead the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
              Tools & Data
            </span>
            <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy md:text-4xl">
              Everything you need in one place
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className={`group rounded-2xl p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${feature.color}`}
                >
                  <div className="flex items-start justify-between">
                    <Icon className={`h-8 w-8 ${feature.accent}`} />
                    <ArrowUpRight className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                  <p
                    className={`mt-2 text-sm leading-relaxed ${
                      feature.color.includes("text-white")
                        ? "text-white/70"
                        : "text-navy/60"
                    }`}
                  >
                    {feature.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-charcoal py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Leaf className="mx-auto h-10 w-10 text-teal mb-4" />
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold md:text-4xl">
            Built for the people building Britain
          </h2>
          <p className="mt-4 text-gray-400 leading-relaxed">
            Whether you&apos;re a developer planning your next project, an
            architect specifying materials, or a manufacturer preparing for
            CBAM — the Sustainability Hub gives you the data and tools you need.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-teal-dark"
            >
              Start Exploring
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/knowledge"
              className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-light"
            >
              Read the Guides
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {["Developers", "Architects", "Manufacturers", "Contractors"].map(
              (role) => (
                <div
                  key={role}
                  className="rounded-xl bg-navy-light px-4 py-3 text-center"
                >
                  <p className="text-sm font-medium">{role}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Fabrick CTA */}
      <FabrickMarketingCTA />
    </div>
  );
}
