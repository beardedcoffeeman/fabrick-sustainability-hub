import { Sparkles } from "lucide-react";

// Static Fabrick analysis card. Mirrors the CarbonAnalysis pattern
// (charcoal card, pink "FABRICK ANALYSIS" eyebrow, Sparkles icon) but
// the content is a fixed editorial - there's no live data driving it.

export function RetrofitAnalysis() {
  return (
    <div className="rounded-2xl bg-charcoal p-6 md:p-10 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-pink" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink">
          Fabrick Analysis
        </span>
      </div>

      <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-5 max-w-3xl">
        MEES is the largest single demand signal in UK construction this decade
      </h2>

      <div className="space-y-4 max-w-3xl text-base md:text-lg leading-relaxed text-white/85">
        <p>
          The Minimum Energy Efficiency Standards have been ratcheting upward
          since 2018. F and G non-domestic rentals were already non-compliant
          that year. Domestic F and G followed in April 2023. The proposed next
          step - band C minimum for non-domestic rented properties from April
          2027 - would force every commercial landlord with stock at D or below
          to upgrade or take it off the rental market. Government ambition
          stretches that to a band C floor across the rented sector by 2030.
        </p>
        <p>
          On the domestic side, roughly six in ten English homes still sit at
          band D or worse. The non-domestic register skews even lower. Each
          one is a candidate for fabric upgrades, glazing, heat-pump
          installation, controls, or a deeper retrofit. The leaderboard above
          is the local read on where that pipeline is concentrated today.
          Bigger percentages mean more work to win, not better-quality
          housing.
        </p>
        <p>
          The size of the prize is in the tens of billions across the decade.
          Insulation manufacturers, glaziers, M&amp;E firms, energy assessors,
          PAS 2035 retrofit coordinators and MEP contractors are all working in
          the same market - but most are still finding it on hunches. Postcode
          band data lets you target where the volume actually is.
        </p>
      </div>

      <p className="mt-8 text-[11px] text-gray-400 max-w-3xl">
        Source: MHCLG &ldquo;Get Energy Performance of Buildings&rdquo; register,
        domestic certificates, England and Wales. The figure above is the share
        of unique properties (deduplicated by UPRN, latest certificate per
        property) at bands D, E, F or G.
      </p>
    </div>
  );
}
