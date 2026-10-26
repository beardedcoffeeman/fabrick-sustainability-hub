"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock, Tag, CheckCircle } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  featured?: boolean;
}

const articles: Article[] = [
  {
    id: "what-is-embodied-carbon",
    title: "What Is Embodied Carbon? A Plain-English Guide for Construction",
    excerpt:
      "Embodied carbon can represent 40 to 70% of a new building's whole-life carbon (LETI). What it is, how it is measured under the RICS standard, and where UK policy stands.",
    category: "Fundamentals",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: "part-z-explained",
    title: "Part Z Explained: Where the Whole-Life Carbon Proposal Stands",
    excerpt:
      "Part Z is an industry proposal to regulate whole-life carbon in England. The latest bill fell in April 2026 and the Government has commissioned research rather than committed to regulate. What it proposes and what applies today.",
    category: "Regulations",
    readTime: "3 min read",
  },
  {
    id: "future-homes-standard-2026",
    title: "Future Homes Standard: What the March 2026 Regulations Require and When",
    excerpt:
      "Laid 24 March 2026 and in force from 24 March 2027, the Future Homes Standard requires new homes in England to emit on average at least 75% less carbon than 2013 standards. Dates, transition rules and requirements from the official documents.",
    category: "Regulations",
    readTime: "3 min read",
  },
  {
    id: "what-is-epd",
    title: "What Is an EPD and Why Does It Matter?",
    excerpt:
      "Environmental Product Declarations are the preferred carbon data for specified products under GLA guidance and the RICS standard. What EN 15804+A2 requires them to cover and how to read one.",
    category: "Fundamentals",
    readTime: "3 min read",
  },
  {
    id: "whole-life-carbon-assessment",
    title: "How to Conduct a Whole-Life Carbon Assessment",
    excerpt:
      "A step-by-step guide to assessing a building's whole-life carbon to the RICS professional standard, with the LETI, RIBA 2030 and UKNZCBS benchmarks and their module scopes.",
    category: "Guides",
    readTime: "4 min read",
  },
  {
    id: "low-carbon-concrete",
    title: "The Carbon Footprint of Concrete: Alternatives and Reduction Strategies",
    excerpt:
      "Cement production is around 8% of global CO₂ emissions. The MPA's published factors for CEM I, GGBS and fly ash blends, what has changed in fly ash supply, and the design moves that use less concrete.",
    category: "Materials",
    readTime: "3 min read",
  },
  {
    id: "timber-vs-steel",
    title: "Timber vs Steel Frame: A Carbon Comparison",
    excerpt:
      "Published factors from IStructE, the BCSA and manufacturer EPDs, how biogenic carbon is counted, and the fire rules that actually apply to timber in England.",
    category: "Materials",
    readTime: "4 min read",
  },
  {
    id: "uk-cbam-construction",
    title: "UK CBAM: What It Means for Construction Material Imports",
    excerpt:
      "From 1 January 2027 the UK CBAM charges a carbon price on imported iron and steel, aluminium, cement, fertiliser and hydrogen. It is a tax from day one, with the first return due 31 May 2028.",
    category: "Regulations",
    readTime: "3 min read",
  },
  {
    id: "uknzcbs-guide",
    title: "UK Net Zero Carbon Buildings Standard: Requirements Explained",
    excerpt:
      "Piloted in September 2024 and published as Version 1 in March 2026, the UKNZCBS sets pass/fail upfront carbon and energy limits by building type and start year. Verification opened in July 2026.",
    category: "Regulations",
    readTime: "3 min read",
  },
  {
    id: "carbon-reduction-case-studies",
    title: "Five UK Projects With Published Embodied Carbon Figures",
    excerpt:
      "Five named UK projects whose design teams have published their embodied carbon results through LETI, UKGBC or their own case studies, with the figures quoted as published.",
    category: "Case Studies",
    readTime: "4 min read",
  },
];

const categories = ["All", "Fundamentals", "Regulations", "Materials", "Guides", "Case Studies"];

export function KnowledgeHub() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const filteredArticles =
    selectedCategory === "All"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  const featured = filteredArticles.filter((a) => a.featured);
  const remaining = filteredArticles.filter((a) => !a.featured);

  return (
    <div className="space-y-8">
      {/* Featured Articles */}
      {featured.length > 0 && (
      <div className="grid gap-6 md:grid-cols-3">
        {featured.map((article) => (
          <Link
            key={article.id}
            href={`/knowledge/${article.id}`}
            className="group flex flex-col rounded-2xl bg-charcoal p-6 text-white transition-all hover:shadow-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-pink/20 px-2.5 py-0.5 text-[10px] font-semibold text-pink">
                Featured
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-gray-300">
                {article.category}
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold leading-tight">
              {article.title}
            </h3>
            <p className="mt-3 flex-1 text-sm text-gray-400 leading-relaxed">
              {article.excerpt}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {article.readTime}
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold text-teal group-hover:underline">
                Read article
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 text-xs font-medium shadow-sm transition-all ${
              selectedCategory === cat
                ? "bg-navy text-white"
                : "bg-white text-navy hover:bg-navy hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article List */}
      {remaining.length > 0 ? (
      <div className="grid gap-4 md:grid-cols-2">
        {remaining.map((article) => (
          <Link
            key={article.id}
            href={`/knowledge/${article.id}`}
            className="group flex gap-4 rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream">
              <BookOpen className="h-5 w-5 text-navy" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-semibold text-navy">
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-warm-gray">
                  <Clock className="h-2.5 w-2.5" />
                  {article.readTime}
                </span>
              </div>
              <h3 className="font-semibold text-navy leading-snug group-hover:text-teal transition-colors">
                {article.title}
              </h3>
              <p className="mt-1 text-xs text-warm-gray line-clamp-2">
                {article.excerpt}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-warm-gray group-hover:text-teal transition-colors" />
          </Link>
        ))}
      </div>
      ) : (
        !featured.length && (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <BookOpen className="mx-auto h-8 w-8 text-warm-gray mb-3" />
            <p className="text-sm text-warm-gray">
              No articles found in &ldquo;{selectedCategory}&rdquo;.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-2 text-sm font-semibold text-teal hover:underline"
            >
              View all articles
            </button>
          </div>
        )
      )}

      {/* CTA */}
      <div className="rounded-2xl bg-teal p-8 text-center text-white">
        {subscribed ? (
          <>
            <CheckCircle className="mx-auto h-10 w-10 mb-3" />
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
              You&apos;re subscribed!
            </h3>
            <p className="mt-2 text-sm text-white/80">
              We&apos;ll send sustainability insights and regulatory alerts to your inbox monthly.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
              Stay ahead of the regulations
            </h3>
            <p className="mt-2 text-sm text-white/80">
              Get monthly sustainability insights and regulatory alerts delivered to
              your inbox.
            </p>
            <form
              className="mt-4 flex max-w-md mx-auto gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSubscribed(true);
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-full bg-white/20 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:bg-white/30"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-cream"
              >
                Subscribe
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
