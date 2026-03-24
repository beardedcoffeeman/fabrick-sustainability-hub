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
      "Embodied carbon accounts for up to 50% of a building's total lifecycle emissions. Here's everything you need to know about measuring, reducing, and reporting it.",
    category: "Fundamentals",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "part-z-explained",
    title: "Part Z Explained: What Whole-Life Carbon Regulation Means for You",
    excerpt:
      "Part Z is an industry-backed proposal to regulate whole-life carbon in buildings. With growing Parliamentary support, it could require large projects to report whole-life carbon. We break down what this means for developers, architects, and contractors.",
    category: "Regulations",
    readTime: "10 min read",
    featured: true,
  },
  {
    id: "future-homes-standard-2026",
    title: "Future Homes Standard 2026: The Complete Guide",
    excerpt:
      "Taking full legal effect in December 2026, the Future Homes Standard requires 75-80% less carbon in new homes. Here's how to prepare.",
    category: "Regulations",
    readTime: "12 min read",
    featured: true,
  },
  {
    id: "what-is-epd",
    title: "What Is an EPD and Why Does It Matter?",
    excerpt:
      "Environmental Product Declarations are becoming essential for material specification. Learn how to read them and why they're increasingly required.",
    category: "Fundamentals",
    readTime: "6 min read",
  },
  {
    id: "whole-life-carbon-assessment",
    title: "How to Conduct a Whole-Life Carbon Assessment",
    excerpt:
      "A step-by-step guide to assessing the total carbon footprint of a building project, from cradle to grave, including modules A-D.",
    category: "Guides",
    readTime: "15 min read",
  },
  {
    id: "low-carbon-concrete",
    title: "The Carbon Footprint of Concrete: Alternatives and Reduction Strategies",
    excerpt:
      "Concrete is responsible for 8% of global CO2 emissions. Explore GGBS, PFA, and other strategies to cut your concrete carbon by up to 50%.",
    category: "Materials",
    readTime: "9 min read",
  },
  {
    id: "timber-vs-steel",
    title: "Timber vs Steel Frame: A Carbon Comparison",
    excerpt:
      "With CLT and glulam gaining ground in UK construction, we compare the embodied carbon, cost, and performance of timber versus steel framing systems.",
    category: "Materials",
    readTime: "7 min read",
  },
  {
    id: "uk-cbam-construction",
    title: "UK CBAM: What It Means for Construction Material Imports",
    excerpt:
      "From January 2027, the UK Carbon Border Adjustment Mechanism will apply to steel, aluminium, and cement imports. Here's what you need to know.",
    category: "Regulations",
    readTime: "8 min read",
  },
  {
    id: "uknzcbs-guide",
    title: "UK Net Zero Carbon Building Standard: Requirements Explained",
    excerpt:
      "Launched early 2026, the UKNZCBS defines what 'net zero carbon' means for UK buildings. We explain the requirements for embodied and operational emissions.",
    category: "Regulations",
    readTime: "11 min read",
  },
  {
    id: "carbon-reduction-case-studies",
    title: "5 UK Construction Projects That Slashed Embodied Carbon",
    excerpt:
      "Real-world case studies showing how leading UK projects achieved 30-60% reductions in embodied carbon through smart material choices and design.",
    category: "Case Studies",
    readTime: "10 min read",
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
