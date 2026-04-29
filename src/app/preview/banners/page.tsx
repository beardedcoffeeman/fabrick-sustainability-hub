"use client";

import { useState } from "react";
import { BannerVideo } from "@/components/home/BannerVideo";

const OPTIONS = [
  {
    id: "1",
    label: "Option 1",
    file: "3730571061-preview.mp4",
    src: "/hero/option-1.mp4",
  },
  {
    id: "2",
    label: "Option 2",
    file: "3802413297-preview.mp4",
    src: "/hero/option-2.mp4",
  },
  {
    id: "3",
    label: "Option 3",
    file: "3761675247-preview.mp4",
    src: "/hero/option-3.mp4",
  },
];

function HeroCopy() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pt-32 md:pb-32">
      <div className="max-w-4xl">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
          Fabrick - A Built Environment Marketing Agency
        </p>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.98] tracking-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.4)]">
          Building a smarter construction industry.
        </h1>
        <p className="mt-4 font-[family-name:var(--font-playfair)] italic text-2xl md:text-3xl text-white/85 [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
          Sharper data. Better decisions. From site to strategy.
        </p>

        <p className="mt-6 text-base md:text-lg text-white/90 max-w-2xl leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]">
          We&rsquo;re putting live data, original analysis and open tools in
          front of the people building Britain, so every decision, from how
          materials are specified at RIBA Stage 4 to how a construction
          company goes to market, is informed by evidence.
        </p>
      </div>
    </div>
  );
}

export default function BannerPreviewPage() {
  const [mode, setMode] = useState<"stacked" | "1" | "2" | "3">("stacked");

  const visible =
    mode === "stacked"
      ? OPTIONS
      : OPTIONS.filter((o) => o.id === mode);

  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Sticky control bar */}
      <div className="sticky top-0 z-50 bg-charcoal/95 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mr-2">
            Banner Previews
          </span>
          {(["stacked", "1", "2", "3"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                mode === m
                  ? "bg-white text-charcoal"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {m === "stacked" ? "All three" : `Option ${m}`}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-white/50">
            Brightness lifted - same hero copy across all three.
          </span>
        </div>
      </div>

      {/* Banner mockups */}
      {visible.map((opt) => (
        <div key={opt.id}>
          <div className="bg-cream-dark text-charcoal px-4 sm:px-6 lg:px-8 py-3">
            <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
                  {opt.label}
                </span>
                <p className="text-xs text-warm-gray mt-0.5">
                  Source: {opt.file}
                </p>
              </div>
            </div>
          </div>

          <section className="relative overflow-hidden text-white">
            <BannerVideo src={opt.src} />
            <HeroCopy />
          </section>
        </div>
      ))}

      {/* Footer note */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-sm text-white/70">
        <p className="mb-3">
          To make any of these the live banner, replace the file at{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px]">
            public/hero/banner.mp4
          </code>{" "}
          with the chosen option (or update the{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-[12px]">
            BannerVideo
          </code>{" "}
          src on the homepage).
        </p>
        <p className="text-white/50">
          Page is unlinked from the main nav - delete after the choice is
          made.
        </p>
      </div>
    </div>
  );
}
