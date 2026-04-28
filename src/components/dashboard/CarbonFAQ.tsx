"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

// Questions selected from SEMrush research:
// - "what is carbon intensity" - 40 searches/mo (UK)
// - "what is the best time to use electricity" + variants - ~150 searches/mo combined
// - "how is carbon intensity calculated" + "measured" - 40 searches/mo combined
// - "what does carbon intensity mean" - 20 searches/mo
// - "what is embodied carbon in construction" - 20 searches/mo
// - "how to reduce embodied carbon in construction" - 20 searches/mo
// Plus implicit GEO/LLM-friendly questions a construction professional would ask.

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "What is carbon intensity?",
    a: "Carbon intensity is the amount of carbon dioxide (CO₂) emitted per unit of electricity generated, measured in grams of CO₂ per kilowatt-hour (gCO₂/kWh). It tells you how clean the grid is at any moment. The UK average over the last 90 days was around 118 gCO₂/kWh; on the cleanest hours it drops below 90, on the highest-carbon hours it rises above 160.",
  },
  {
    q: "What is the best time of day to use electricity in the UK?",
    a: "Based on 90 days of National Grid ESO data, the cleanest hours of the UK week are typically Sunday between 2am and 4am, when overnight wind generation is high and demand is low. Mid-Saturday afternoons are also consistently low-carbon. The highest-carbon hours are weekday evenings between 5pm and 7pm, when household demand peaks and gas plants ramp up to meet it.",
  },
  {
    q: "How is carbon intensity calculated?",
    a: "Carbon intensity is calculated by dividing total grid CO₂ emissions by total generation in a given period. National Grid ESO publishes half-hourly figures using the actual generation mix - wind, solar, nuclear, gas, biomass, hydro, imports - multiplied by each fuel's emission factor. Our heatmap aggregates 4,000+ of these half-hour readings into 168 hour-of-day × day-of-week buckets.",
  },
  {
    q: "Why is the UK grid cleaner at certain times?",
    a: "Three things drive the pattern: wind output (highest overnight, especially in winter), solar (only during daylight, April–September), and demand (lowest overnight and on weekends). When low-carbon generation is high and demand is low - typically weekend afternoons and overnight - gas plants run less, so the grid is cleaner. When demand spikes on weekday evenings, gas plants fill the gap and intensity rises sharply.",
  },
  {
    q: "How can construction projects reduce scope 2 carbon emissions?",
    a: "Schedule grid-powered work - site huts, electric plant, off-site fabrication, electric arc steel, concrete batching with electric hoists - into the lowest-carbon hours of the week. Even shifting power-intensive operations from weekday evenings to weekend mornings can cut scope 2 emissions by 30–40% on identical workloads. The data also feeds tender narratives: most clients want evidence of a carbon-aware programme, not just a carbon target.",
  },
  {
    q: "What is the average UK grid carbon intensity?",
    a: "The 90-day UK rolling average is currently 118 gCO₂/kWh, down from around 200 gCO₂/kWh a decade ago. The annual average has fallen consistently as wind capacity has grown. UK grid intensity is now among the lowest in Europe, but the within-week variation is large - cleanest hours are roughly half the carbon of the highest-carbon hours.",
  },
  {
    q: "What is embodied carbon in construction?",
    a: "Embodied carbon is the total CO₂ emitted to manufacture, transport and install the materials in a building - separate from operational carbon (the energy the building uses once occupied). Concrete, steel and aluminium typically dominate. Lower-carbon alternatives like GGBS-blend cement, recycled steel, and engineered timber can cut embodied carbon by 30–60% on the same building. Our carbon calculator compares 100+ materials from the ICE database.",
  },
  {
    q: "How can we reduce embodied carbon in construction projects?",
    a: "Five high-impact moves: (1) specify GGBS or PFA blend cements in place of CEM I; (2) replace structural steel with engineered timber where feasible; (3) increase recycled content in aggregates, plasterboard and insulation; (4) reduce material quantities through better structural design, not finishes; (5) source locally to cut transport emissions. The biggest carbon wins almost always come from the structural frame, not the fitout.",
  },
  {
    q: "Where does this data come from?",
    a: "Grid carbon and generation mix data is published by National Grid ESO (the Electricity System Operator) via the open Carbon Intensity API at carbonintensity.org.uk. The API has half-hourly resolution back to 2018. Our 90-day rolling heatmap aggregates these readings by hour-of-day and day-of-week. Methodology and source attribution are listed below the heatmap.",
  },
  {
    q: "Can I use this analysis in tender submissions and BREEAM reports?",
    a: "Yes. The data is from National Grid ESO under the Open Government Licence and can be cited directly. For tenders, the heatmap supports a carbon-aware programme narrative; for BREEAM and similar frameworks, you can use the underlying half-hourly data to build project-specific scope 2 emissions evidence. Cite National Grid ESO Carbon Intensity API as the source, with the date of the data extract.",
  },
];

export function CarbonFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // JSON-LD schema for SEO + GEO. Both Google and LLMs (ChatGPT, Claude,
  // Perplexity, Google AI Overviews) read FAQPage schema to extract direct
  // answers from the page.
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <section className="py-16 md:py-20 bg-cream-dark">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink mb-3">
            Frequently Asked
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl font-bold text-navy">
            UK grid carbon, explained.
          </h2>
          <p className="mt-3 text-warm-gray">
            Plain-English answers for the questions construction teams, sustainability
            leads and specifiers ask most.
          </p>
        </div>

        <div className="space-y-2">
          {FAQS.map((f, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={f.q}
                className="rounded-2xl bg-white border border-charcoal/[0.06] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-cream/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <h3 className="font-semibold text-navy text-base">
                    {f.q}
                  </h3>
                  <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-cream-dark text-charcoal">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${i}`}
                    className="px-5 pb-5 text-sm text-warm-gray leading-relaxed border-t border-cream-dark"
                  >
                    <p className="pt-4">{f.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-warm-gray">
          Have a question we haven&rsquo;t answered?{" "}
          <a
            href="mailto:hello@fabrick.agency"
            className="text-teal font-semibold hover:underline"
          >
            hello@fabrick.agency
          </a>
        </p>
      </div>

      {/* JSON-LD FAQPage schema for SEO and Generative Engine Optimisation */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
