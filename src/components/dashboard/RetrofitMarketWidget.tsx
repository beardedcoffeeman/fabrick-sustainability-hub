"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Types - mirrors /api/epc/route.ts EPCCertificate shape
// ---------------------------------------------------------------------------

interface EPCCertificate {
  address: string;
  currentRating: string;
  potentialRating: string;
  sapScore: number;
  propertyType: string;
  floorArea: number;
  heatingType: string;
  wallConstruction: string;
  certificateDate: string;
  currentEnergyEfficiency: number;
  potentialEnergyEfficiency: number;
  uprn: number | null;
}

interface EPCResult {
  certificates: EPCCertificate[];
  postcode: string;
  totalResults: number;
  isSampleData: boolean;
}

// ---------------------------------------------------------------------------
// EPC band styling - official UK EPC palette
// ---------------------------------------------------------------------------

const RATING_COLOURS: Record<string, string> = {
  A: "#008054",
  B: "#19b459",
  C: "#8dce46",
  D: "#ffd500",
  E: "#fcaa65",
  F: "#ef8023",
  G: "#e9153b",
};

const ALL_BANDS = ["A", "B", "C", "D", "E", "F", "G"];

function getRatingColour(rating: string): string {
  return RATING_COLOURS[rating?.toUpperCase()] || "#8A8A9A";
}

// ---------------------------------------------------------------------------
// Dedupe certificates by UPRN - keep most recent per property.
// Re-registrations skew the band distribution otherwise (a property that
// got a new EPC after refurb will appear twice, once at old band, once at
// new). Counting unique properties gives a truer retrofit-pipeline figure.
// ---------------------------------------------------------------------------

function dedupeByLatest(certs: EPCCertificate[]): EPCCertificate[] {
  const byUprn = new Map<number, EPCCertificate>();
  const noUprn: EPCCertificate[] = [];
  for (const c of certs) {
    if (c.uprn == null) {
      noUprn.push(c);
      continue;
    }
    const existing = byUprn.get(c.uprn);
    if (!existing || c.certificateDate > existing.certificateDate) {
      byUprn.set(c.uprn, c);
    }
  }
  return [...byUprn.values(), ...noUprn];
}

// ---------------------------------------------------------------------------
// Headline metric: % of unique properties below band C
// ---------------------------------------------------------------------------

interface HeadlineStats {
  total: number;
  belowC: number;
  belowCPct: number;
  bandCounts: { band: string; count: number; pct: number }[];
  tier: "high" | "moderate" | "low";
}

function computeHeadline(uniqueCerts: EPCCertificate[]): HeadlineStats | null {
  if (uniqueCerts.length === 0) return null;
  const total = uniqueCerts.length;
  const belowC = uniqueCerts.filter((c) =>
    ["D", "E", "F", "G"].includes(c.currentRating?.toUpperCase())
  ).length;
  const belowCPct = (belowC / total) * 100;

  const bandCounts = ALL_BANDS.map((band) => {
    const count = uniqueCerts.filter(
      (c) => c.currentRating?.toUpperCase() === band
    ).length;
    return { band, count, pct: (count / total) * 100 };
  });

  // Tier thresholds match the brief: >50% high, 30-50% moderate, <30% low
  const tier: HeadlineStats["tier"] =
    belowCPct > 50 ? "high" : belowCPct >= 30 ? "moderate" : "low";

  return { total, belowC, belowCPct, bandCounts, tier };
}

// ---------------------------------------------------------------------------
// Headline card - colour-coded by tier
// ---------------------------------------------------------------------------

function HeadlineCard({
  stats,
  postcode,
}: {
  stats: HeadlineStats;
  postcode: string;
}) {
  const tierConfig = {
    high: {
      bg: "bg-pink/10",
      ring: "ring-pink/30",
      text: "text-pink",
      label: "High retrofit demand",
      blurb:
        "Most buildings on this postcode are below band C. A large pipeline of MEES-driven upgrade work - insulation, glazing, heating systems, fabric improvements.",
    },
    moderate: {
      bg: "bg-amber-100/60",
      ring: "ring-amber-300/40",
      text: "text-amber-700",
      label: "Moderate retrofit demand",
      blurb:
        "A meaningful share of properties sit below band C. Worth targeting for retrofit services as 2027 and 2030 deadlines approach.",
    },
    low: {
      bg: "bg-teal/10",
      ring: "ring-teal/30",
      text: "text-teal-dark",
      label: "Low retrofit demand",
      blurb:
        "Most buildings here are already at or above band C. A smaller retrofit pipeline - but pockets of older or rented stock may still need work.",
    },
  }[stats.tier];

  return (
    <div
      className={`rounded-2xl ${tierConfig.bg} ring-1 ${tierConfig.ring} p-6 md:p-8`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-warm-gray mb-2">
            Retrofit pipeline · {postcode}
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-[family-name:var(--font-playfair)] text-5xl md:text-6xl font-bold ${tierConfig.text} tabular-nums`}
            >
              {stats.belowCPct.toFixed(0)}%
            </span>
            <span className="text-sm text-warm-gray">below band C</span>
          </div>
          <p className={`mt-2 text-sm font-semibold ${tierConfig.text}`}>
            {tierConfig.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-warm-gray">Sample size</p>
          <p className="text-2xl font-bold text-navy tabular-nums">
            {stats.total}
          </p>
          <p className="text-[11px] text-warm-gray">
            unique properties
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm text-navy/80 leading-relaxed max-w-2xl">
        {tierConfig.blurb}
      </p>

      {/* Band distribution bar - proportional widths */}
      <div className="mt-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-2">
          Band distribution
        </p>
        <div className="flex h-6 w-full overflow-hidden rounded-md ring-1 ring-charcoal/[0.08]">
          {stats.bandCounts.map(({ band, count, pct }) =>
            count > 0 ? (
              <div
                key={band}
                className="flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  width: `${pct}%`,
                  backgroundColor: getRatingColour(band),
                  minWidth: pct > 0 ? "16px" : 0,
                }}
                title={`Band ${band}: ${count} (${pct.toFixed(0)}%)`}
              >
                {pct >= 8 ? band : ""}
              </div>
            ) : null
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-warm-gray">
          {stats.bandCounts
            .filter((b) => b.count > 0)
            .map(({ band, count, pct }) => (
              <span key={band} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: getRatingColour(band) }}
                />
                <span className="font-semibold text-navy">{band}</span>
                <span className="tabular-nums">
                  {count} · {pct.toFixed(0)}%
                </span>
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Certificate list - collapsed by default
// ---------------------------------------------------------------------------

function CertificateList({
  certs,
  postcode,
}: {
  certs: EPCCertificate[];
  postcode: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white border border-cream-dark overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-cream/30 transition-colors"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-navy">
            Individual certificates
          </p>
          <p className="text-[11px] text-warm-gray mt-0.5">
            {certs.length} most-recent EPC{certs.length !== 1 ? "s" : ""} for {postcode}
          </p>
        </div>
        <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-cream-dark text-charcoal">
          {open ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-cream-dark max-h-[480px] overflow-y-auto">
              <ul className="divide-y divide-cream-dark">
                {certs.map((c, i) => (
                  <li
                    key={`${c.uprn ?? c.address}-${i}`}
                    className="px-5 py-3 flex items-center gap-3"
                  >
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded font-bold text-white text-sm"
                      style={{
                        backgroundColor: getRatingColour(c.currentRating),
                      }}
                    >
                      {c.currentRating}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-navy truncate">
                        {c.address}
                      </p>
                      <p className="text-[10px] text-warm-gray">
                        {c.certificateDate
                          ? `Registered ${new Date(c.certificateDate).toLocaleDateString(
                              "en-GB",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}`
                          : "MHCLG EPC register"}
                      </p>
                    </div>
                    <a
                      href={`https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${encodeURIComponent(postcode)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-teal hover:text-teal-dark inline-flex items-center gap-1"
                    >
                      Full cert
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

export function RetrofitMarketWidget() {
  const [postcode, setPostcode] = useState("");
  const [data, setData] = useState<EPCResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uniqueCerts = useMemo(
    () => (data ? dedupeByLatest(data.certificates) : []),
    [data]
  );
  const stats = useMemo(() => computeHeadline(uniqueCerts), [uniqueCerts]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = postcode.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `/api/epc?postcode=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to fetch EPC data");
      }
      const json: EPCResult = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load EPC data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search card */}
      <div className="rounded-2xl bg-charcoal p-6 md:p-8 text-white">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-teal" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-teal">
            Postcode lookup
          </span>
        </div>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold mb-1">
          Find the retrofit pipeline in any UK postcode
        </h2>
        <p className="text-sm text-gray-400 mb-5 max-w-2xl">
          We pull the latest domestic EPC certificates from the MHCLG register,
          dedupe to one record per property, and report the share below band C
          - the threshold MEES is moving to.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Enter a postcode, e.g. SW19 1HQ"
              className="w-full rounded-lg bg-navy-light border border-gray-700/40 pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !postcode.trim()}
            className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search
          </button>
        </form>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-navy-light/50 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Data is from the MHCLG &ldquo;Get Energy Performance of Buildings&rdquo;
            domestic register - England and Wales only. Non-domestic stock is
            not currently included in this lookup. Certificates are valid for 10
            years.
          </p>
        </div>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl bg-white p-5 shadow-sm border border-pink/20"
          >
            <div className="flex items-center gap-2 text-pink">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => handleSearch()}
              className="mt-2 text-teal underline text-sm"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
          <div className="h-5 w-32 bg-cream-dark rounded mb-3" />
          <div className="h-14 w-48 bg-cream-dark rounded mb-4" />
          <div className="h-6 w-full bg-cream-dark rounded" />
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {data && !loading && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {data.isSampleData && (
              <div className="rounded-2xl bg-white p-4 border border-teal/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  <p className="text-[11px] text-warm-gray leading-relaxed">
                    <span className="font-semibold text-navy">
                      Sample data.
                    </span>{" "}
                    The MHCLG API token is not configured for this environment;
                    the figures above are illustrative.
                  </p>
                </div>
              </div>
            )}

            {!stats && (
              <div className="rounded-2xl bg-white p-6 shadow-sm text-sm text-warm-gray">
                <div className="flex items-center gap-2 text-navy">
                  <TrendingUp className="h-4 w-4" />
                  <p className="font-semibold">No certificates found</p>
                </div>
                <p className="mt-2">
                  We couldn&rsquo;t find any registered EPCs for{" "}
                  <span className="font-semibold">{data.postcode}</span>. Try a
                  nearby postcode, or check the format (e.g. <code>SW19 1HQ</code>
                  ).
                </p>
              </div>
            )}

            {stats && <HeadlineCard stats={stats} postcode={data.postcode} />}

            {stats && uniqueCerts.length > 0 && (
              <CertificateList certs={uniqueCerts} postcode={data.postcode} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
