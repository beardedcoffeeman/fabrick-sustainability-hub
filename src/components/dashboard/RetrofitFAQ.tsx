"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

// GEO-targeted FAQs. Same pattern as CarbonFAQ - accordion + JSON-LD
// FAQPage schema so search engines and LLMs can lift direct answers.

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "What is MEES?",
    a: "MEES - the Minimum Energy Efficiency Standards - are the rules that set a minimum EPC band landlords must achieve before they can rent a property in England and Wales. They came in via the Energy Efficiency (Private Rented Property) (England and Wales) Regulations 2015 and have tightened over time. Since April 2018 it has been unlawful to grant a new lease on a non-domestic property rated F or G. Since April 2023 the same applies to existing non-domestic leases. Since April 2020 it has been unlawful to let a domestic property at F or G, with the same rule applied to existing tenancies from April 2023.",
  },
  {
    q: "What is the EPC C minimum 2027 deadline?",
    a: "The UK government has consulted on raising the MEES floor for non-domestic rented properties from band E to band C, with new tenancies expected to need a band C minimum from April 2027 and all existing non-domestic leases from April 2030. The detail is still subject to legislation, but the direction has been clear in policy documents and consultations since 2019. Any commercial landlord with stock at D or below should be planning their retrofit programme now - surveys, design, procurement and works on a typical commercial building can easily run 12 to 18 months.",
  },
  {
    q: "Which UK buildings need retrofit work for MEES compliance?",
    a: "Any rented building below the relevant MEES band. For commercial property that is currently band F or G (already non-compliant) and from April 2027 will likely include band D and E. For domestic rented property that is band F or G today, with band C proposed across the rented sector by 2030. Owner-occupied homes are not directly subject to MEES, but they are subject to government net-zero retrofit ambitions and are the largest pool of potential retrofit work in the UK. The lookup on this page reports the share of unique properties at bands D, E, F or G in any postcode.",
  },
  {
    q: "How is the EPC band calculated?",
    a: "An accredited energy assessor surveys the property and feeds inputs - built form, fabric, glazing, heating system, hot water, ventilation, lighting and renewables - into government-approved software (RdSAP for existing dwellings, SAP for new builds, SBEM for non-domestic). The output is a SAP score from 1 to 100+, with band A at 92+, B at 81 to 91, C at 69 to 80, D at 55 to 68, E at 39 to 54, F at 21 to 38 and G below 21. The score reflects modelled energy cost per square metre under standard occupancy assumptions; it is not a direct measure of actual energy use.",
  },
  {
    q: "What does it cost to upgrade an EPC band F to C?",
    a: "There is no single number, but typical ranges from BEIS and industry data point to £15,000 to £30,000 per dwelling for a deep retrofit lifting a band F home to band C - fabric insulation, glazing, heating system replacement and ventilation. Lighter measures (LED lighting, controls, heating tweaks) can move a property up one or two bands for £2,000 to £5,000. On the commercial side, costs scale with floor area but the rule of thumb is £30 to £150 per square metre for fabric and services upgrades that move a building from D or E up to C. The lower end is realistic where lighting, controls and heating system efficiency are the main levers; the upper end assumes fabric work.",
  },
  {
    q: "Where can I find buildings below EPC C in the UK?",
    a: "The MHCLG &ldquo;Get Energy Performance of Buildings&rdquo; register publishes every domestic and non-domestic EPC issued in England and Wales since 2008. You can search by postcode at find-energy-certificate.service.gov.uk, or use the API for bulk access. The lookup at the top of this page wraps the API and reports the share of properties below band C - the headline number that determines where retrofit demand is concentrated. For Scotland the register is held by the Scottish EPC Register; for Northern Ireland it is at epbniregister.com.",
  },
  {
    q: "What is the size of the UK retrofit market?",
    a: "Estimates from the Climate Change Committee, BEIS and industry bodies put the cumulative spend needed to bring the UK building stock to net zero at between £250 billion and £450 billion to 2050, with the bulk concentrated in the next 15 years. Annual spend is currently running at around £6 billion to £10 billion; it would need to rise to £30 billion or more per year to meet the trajectory. Within that, the rented-sector slice driven by MEES is conservatively a £40 billion to £70 billion programme of works between now and 2030 across non-domestic and domestic stock combined.",
  },
];

export function RetrofitFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // FAQPage JSON-LD - Google and LLMs use this to extract direct answers.
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
            UK retrofit market, explained.
          </h2>
          <p className="mt-3 text-warm-gray">
            Plain-English answers for the contractors, manufacturers and
            specifiers chasing MEES-driven work.
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
                  aria-controls={`retrofit-faq-panel-${i}`}
                >
                  <h3 className="font-semibold text-navy text-base">{f.q}</h3>
                  <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-cream-dark text-charcoal">
                    {isOpen ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`retrofit-faq-panel-${i}`}
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
  );
}
