/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  Calculator,
  ScrollText,
  Compass,
  BookOpen,
} from "lucide-react";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "Preview: Built-card images",
  robots: { index: false, follow: false },
};

const PREVIEW_DIR = "public/built-cards/preview";

type CardKey = "dashboard" | "materials" | "regulations" | "knowledge" | "research";

const CARDS: Array<{
  key: CardKey;
  eyebrow: string;
  headline: string;
  detail: string;
  cta: string;
  icon: React.ElementType;
  overlay: string; // hex used to tint the photo
}> = [
  {
    key: "dashboard",
    eyebrow: "Dashboard",
    headline: "Live view of the industry's key metrics.",
    detail:
      "Carbon, material prices, planning activity, construction output and EPC ratings, refreshed automatically.",
    cta: "Open the dashboards",
    icon: LayoutDashboard,
    overlay: "#00A389",
  },
  {
    key: "materials",
    eyebrow: "Materials",
    headline: "Understand the real impact of what you specify.",
    detail:
      "Embodied carbon calculator with multi-criteria comparison: carbon, thermal performance, fire rating and indicative cost.",
    cta: "Run the calculator",
    icon: Calculator,
    overlay: "#FF3D7F",
  },
  {
    key: "regulations",
    eyebrow: "Regulations",
    headline: "Stay ahead of changing requirements.",
    detail:
      "Future Homes Standard, Part Z, CBAM, EPC. What is coming, when, and what it means for your work.",
    cta: "See the timeline",
    icon: ScrollText,
    overlay: "#2D2D3F",
  },
  {
    key: "knowledge",
    eyebrow: "Knowledge",
    headline: "Build a deeper understanding of the issues.",
    detail:
      "Plain-English explainers on the policies, standards and ideas shaping the construction industry.",
    cta: "Read the explainers",
    icon: Compass,
    overlay: "#1A1A2E",
  },
  {
    key: "research",
    eyebrow: "Research",
    headline: "Data turned into insight you can act on.",
    detail:
      "Original Fabrick research into how UK construction professionals search, evaluate suppliers and make decisions.",
    cta: "See the research",
    icon: BookOpen,
    overlay: "#00BFA5",
  },
];

function listCandidates(prefix: string): string[] {
  try {
    const dir = path.join(process.cwd(), PREVIEW_DIR);
    return fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`${prefix}-`) && /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort();
  } catch {
    return [];
  }
}

function CandidateCard({
  filename,
  card,
  idx,
}: {
  filename: string;
  card: (typeof CARDS)[number];
  idx: number;
}) {
  const Icon = card.icon;
  const src = `/built-cards/preview/${filename}`;
  return (
    <div className="space-y-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-warm-gray/70">
        Option {idx + 1} - {filename}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white border border-charcoal/[0.08] shadow-sm">
        <div
          className="relative"
          style={{ aspectRatio: "2 / 1", background: card.overlay }}
        >
          <img
            src={src}
            alt={`${card.eyebrow} candidate ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${card.overlay}33 0%, ${card.overlay}66 100%)`,
              mixBlendMode: "multiply",
            }}
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-dark">
              <Icon className="h-4 w-4 text-teal" />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-warm-gray/60">
              {card.eyebrow}
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair)] text-[1.35rem] font-bold text-navy leading-[1.15] tracking-tight">
            {card.headline}
          </h3>
          <p className="mt-3 text-xs text-warm-gray leading-relaxed">
            {card.detail}
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-teal">
            {card.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-warm-gray hover:text-navy">
          Show raw photo (no overlay)
        </summary>
        <div className="mt-2 overflow-hidden rounded-lg border border-charcoal/[0.08]">
          <img
            src={src}
            alt={`Raw ${card.eyebrow} ${idx + 1}`}
            className="w-full h-auto block"
          />
        </div>
      </details>
    </div>
  );
}

export default function PreviewCardsPage() {
  return (
    <div className="min-h-screen bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to homepage
        </Link>

        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-2">
          Preview - Built-card photos
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-navy leading-tight">
          Compare candidates per card.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-charcoal/80 leading-relaxed">
          Each card section below shows its candidate photos in the actual
          card layout with a brand-tinted overlay. Drop more files into{" "}
          <code>public/built-cards/preview/</code> with the right prefix
          (e.g. <code>dashboard-2.jpg</code>) and refresh to see them.
        </p>

        {CARDS.map((card) => {
          const files = listCandidates(card.key);
          return (
            <section key={card.key} className="mt-12">
              <div className="flex items-baseline justify-between gap-4 mb-5">
                <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy">
                  {card.eyebrow}
                </h2>
                <span className="text-xs text-warm-gray">
                  {files.length} candidate{files.length === 1 ? "" : "s"}
                </span>
              </div>
              {files.length === 0 ? (
                <div className="rounded-xl border border-dashed border-charcoal/15 bg-white/40 p-6 text-sm text-warm-gray">
                  No <code>{card.key}-*.jpg</code> files yet. Drop watermarked
                  previews into <code>public/built-cards/preview/</code> with
                  this prefix.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {files.map((f, i) => (
                    <CandidateCard key={f} filename={f} card={card} idx={i} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
