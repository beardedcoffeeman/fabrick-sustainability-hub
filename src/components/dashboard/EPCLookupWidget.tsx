"use client";

import { useState } from "react";
import {
  Search,
  Building,
  Flame,
  BrickWall,
  BarChart3,
  Info,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Home,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
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
}

interface EPCResult {
  certificates: EPCCertificate[];
  postcode: string;
  totalResults: number;
  isSampleData: boolean;
}

// ---------------------------------------------------------------------------
// EPC rating colours (matches the official UK EPC certificate palette)
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

const RATING_LABELS: Record<string, string> = {
  A: "Very efficient",
  B: "Efficient",
  C: "Fairly efficient",
  D: "Average",
  E: "Below average",
  F: "Poor",
  G: "Very poor",
};

const ALL_BANDS = ["A", "B", "C", "D", "E", "F", "G"];

function getRatingColour(rating: string): string {
  return RATING_COLOURS[rating?.toUpperCase()] || "#8A8A9A";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RatingBadge({
  rating,
  size = "md",
}: {
  rating: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-xl",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded font-bold text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: getRatingColour(rating) }}
    >
      {rating}
    </span>
  );
}

function RatingBar({ rating }: { rating: string }) {
  const idx = ALL_BANDS.indexOf(rating.toUpperCase());
  const widthPct = idx >= 0 ? 100 - idx * 12 : 50; // A is widest, G narrowest
  return (
    <div className="flex items-center gap-2 w-full">
      <motion.div
        className="h-5 rounded-r-sm flex items-center justify-end pr-1.5"
        style={{ backgroundColor: getRatingColour(rating) }}
        initial={{ width: 0 }}
        animate={{ width: `${widthPct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <span className="text-[10px] font-bold text-white">{rating}</span>
      </motion.div>
    </div>
  );
}

function EPCScale({ currentRating, potentialRating }: { currentRating: string; potentialRating: string }) {
  return (
    <div className="space-y-0.5">
      {ALL_BANDS.map((band) => {
        const idx = ALL_BANDS.indexOf(band);
        const widthPct = 100 - idx * 10;
        const isCurrent = band === currentRating.toUpperCase();
        const isPotential = band === potentialRating.toUpperCase();
        return (
          <div key={band} className="flex items-center gap-2">
            <div className="relative" style={{ width: `${widthPct}%` }}>
              <div
                className={`h-5 rounded-r-sm flex items-center justify-end pr-1.5 transition-opacity ${isCurrent || isPotential ? "opacity-100" : "opacity-30"}`}
                style={{ backgroundColor: getRatingColour(band) }}
              >
                <span className="text-[10px] font-bold text-white">{band}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {isCurrent && (
                <span className="text-[9px] font-semibold text-navy bg-cream-dark rounded px-1.5 py-0.5">
                  Current
                </span>
              )}
              {isPotential && !isCurrent && (
                <span className="text-[9px] font-semibold text-teal bg-teal/10 rounded px-1.5 py-0.5">
                  Potential
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Distribution chart
// ---------------------------------------------------------------------------

function RatingDistributionChart({
  certificates,
}: {
  certificates: EPCCertificate[];
}) {
  const counts = ALL_BANDS.map((band) => ({
    band,
    count: certificates.filter(
      (c) => c.currentRating?.toUpperCase() === band
    ).length,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={counts} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5DFD5" vertical={false} />
        <XAxis
          dataKey="band"
          tick={{ fontSize: 12, fontWeight: 600, fill: "#2D2D3F" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10, fill: "#8A8A9A" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "#1A1A2E",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: 12,
          }}
          formatter={(value, _name, props) => {
            const band = (props?.payload as Record<string, string>)?.band ?? "";
            return [`${value} properties`, `Band ${band}`];
          }}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {counts.map((entry) => (
            <Cell key={entry.band} fill={getRatingColour(entry.band)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Stats summary
// ---------------------------------------------------------------------------

function SummaryStats({ certificates }: { certificates: EPCCertificate[] }) {
  const total = certificates.length;
  if (total === 0) return null;

  // Average SAP score
  const avgSap =
    certificates.reduce((sum, c) => sum + c.sapScore, 0) / total;

  // Average band (compute from avgSap)
  function sapToBand(sap: number): string {
    if (sap >= 92) return "A";
    if (sap >= 81) return "B";
    if (sap >= 69) return "C";
    if (sap >= 55) return "D";
    if (sap >= 39) return "E";
    if (sap >= 21) return "F";
    return "G";
  }

  const avgBand = sapToBand(avgSap);

  // Band percentages
  const bandCounts = ALL_BANDS.map((band) => {
    const count = certificates.filter(
      (c) => c.currentRating?.toUpperCase() === band
    ).length;
    return { band, count, pct: ((count / total) * 100).toFixed(0) };
  });

  // Most common property type
  const typeCounts: Record<string, number> = {};
  certificates.forEach((c) => {
    const t = c.propertyType || "Unknown";
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
  const mostCommonType = Object.entries(typeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <motion.div
      className="grid grid-cols-2 gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Average rating */}
      <div className="rounded-xl bg-cream p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-1">
          Average Rating
        </p>
        <div className="flex items-center gap-2">
          <RatingBadge rating={avgBand} size="lg" />
          <div>
            <p className="text-lg font-bold text-navy tabular-nums">
              {avgSap.toFixed(0)} SAP
            </p>
            <p className="text-[10px] text-warm-gray">
              {RATING_LABELS[avgBand]}
            </p>
          </div>
        </div>
      </div>

      {/* Most common type */}
      <div className="rounded-xl bg-cream p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-1">
          Most Common Type
        </p>
        <div className="flex items-center gap-2">
          <Home className="h-8 w-8 text-teal opacity-60" />
          <div>
            <p className="text-sm font-bold text-navy">
              {mostCommonType?.[0] || "N/A"}
            </p>
            <p className="text-[10px] text-warm-gray">
              {mostCommonType?.[1] || 0} of {total} properties
            </p>
          </div>
        </div>
      </div>

      {/* Band breakdown */}
      <div className="col-span-2 rounded-xl bg-cream p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-2">
          Rating Distribution
        </p>
        <div className="flex items-end gap-1">
          {bandCounts.map(({ band, pct, count }) => (
            <div key={band} className="flex-1 text-center">
              <motion.div
                className="mx-auto rounded-t"
                style={{
                  backgroundColor: getRatingColour(band),
                  width: "100%",
                }}
                initial={{ height: 0 }}
                animate={{ height: count > 0 ? `${Math.max(Number(pct) * 0.6, 4)}px` : "2px" }}
                transition={{ duration: 0.4, delay: ALL_BANDS.indexOf(band) * 0.05 }}
              />
              <p className="text-[10px] font-bold text-navy mt-1">{band}</p>
              <p className="text-[9px] text-warm-gray tabular-nums">{pct}%</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Certificate card
// ---------------------------------------------------------------------------

function CertificateCard({
  cert,
  index,
}: {
  cert: EPCCertificate;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="rounded-xl bg-white border border-cream-dark overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cream/50 transition-colors"
      >
        <RatingBadge rating={cert.currentRating} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-navy truncate">
            {cert.address}
          </p>
          <p className="text-[10px] text-warm-gray">
            {cert.propertyType} &middot; {cert.floorArea}m&sup2; &middot;{" "}
            {cert.certificateDate}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <RatingBadge rating={cert.currentRating} size="sm" />
          <ArrowRight className="h-3 w-3 text-warm-gray" />
          <RatingBadge rating={cert.potentialRating} size="sm" />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-cream-dark">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Current vs potential scale */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-1">
                    Energy Rating
                  </p>
                  <EPCScale
                    currentRating={cert.currentRating}
                    potentialRating={cert.potentialRating}
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-0.5">
                      SAP Score
                    </p>
                    <p className="text-lg font-bold text-navy tabular-nums">
                      {cert.sapScore}
                      <span className="text-xs text-warm-gray font-normal ml-1">
                        / 100
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray mb-0.5">
                      Floor Area
                    </p>
                    <p className="text-sm font-semibold text-navy">
                      {cert.floorArea} m&sup2;
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-cream p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <Flame className="h-3 w-3 text-pink" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-warm-gray">
                      Heating
                    </span>
                  </div>
                  <p className="text-[11px] text-navy leading-snug">
                    {cert.heatingType}
                  </p>
                </div>
                <div className="rounded-lg bg-cream p-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    <BrickWall className="h-3 w-3 text-teal" />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-warm-gray">
                      Walls
                    </span>
                  </div>
                  <p className="text-[11px] text-navy leading-snug">
                    {cert.wallConstruction}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------

export function EPCLookupWidget() {
  const [postcode, setPostcode] = useState("");
  const [data, setData] = useState<EPCResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = postcode.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

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
      setError(
        err instanceof Error ? err.message : "Unable to load EPC data"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search card */}
      <div className="rounded-2xl bg-charcoal p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Building className="h-5 w-5 text-teal" />
          <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
            EPC Lookup
          </span>
        </div>

        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-1">
          Energy Performance Certificates
        </h3>
        <p className="text-sm text-gray-400 mb-5">
          Search any UK postcode to explore EPC ratings, energy efficiency, and
          building fabric data for domestic properties in that area.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="Enter a postcode, e.g. SW1A 1AA"
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

        {/* What this means */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-navy-light/50 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-300">
              Energy Performance Certificates
            </span>{" "}
            rate buildings from A (most efficient) to G (least efficient). They
            include data on heating, insulation, and estimated energy costs.
            Under the Minimum Energy Efficiency Standards (MEES), commercial
            landlords in England and Wales must achieve at least an E rating.
            The government has proposed raising this to B by 2030.
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
              onClick={handleSearch}
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
          <div className="h-6 w-40 bg-cream-dark rounded mb-4" />
          <div className="h-48 w-full bg-cream-dark rounded mb-4" />
          <div className="space-y-3">
            <div className="h-12 w-full bg-cream-dark rounded" />
            <div className="h-12 w-full bg-cream-dark rounded" />
            <div className="h-12 w-full bg-cream-dark rounded" />
          </div>
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
            {/* Sample data notice */}
            {data.isSampleData && (
              <motion.div
                className="rounded-2xl bg-white p-4 shadow-sm border border-teal/20"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-navy">
                      Sample Data
                    </p>
                    <p className="text-[11px] text-warm-gray leading-relaxed mt-0.5">
                      Showing representative sample data for demonstration
                      purposes. Set the{" "}
                      <code className="bg-cream-dark px-1 py-0.5 rounded text-[10px]">
                        EPC_API_KEY
                      </code>{" "}
                      environment variable to fetch real EPC data from DLUHC Open
                      Data.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Summary header */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
                    Results for {data.postcode}
                  </h4>
                  <p className="text-[10px] text-warm-gray/70 mt-0.5">
                    {data.totalResults} certificate
                    {data.totalResults !== 1 ? "s" : ""} found
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4 text-teal" />
                  <span className="text-xs font-semibold text-navy">
                    Area Overview
                  </span>
                </div>
              </div>

              <SummaryStats certificates={data.certificates} />
            </div>

            {/* Distribution chart */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-teal" />
                <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
                  Rating Distribution
                </span>
              </div>
              <p className="text-[10px] text-warm-gray/70 mb-3 leading-relaxed">
                Number of properties at each EPC band in {data.postcode}. Bands
                D-E are most common in UK housing stock. The government target is
                for all homes to reach band C by 2035.
              </p>
              <RatingDistributionChart certificates={data.certificates} />
            </div>

            {/* Individual certificates */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Building className="h-4 w-4 text-teal" />
                <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
                  Individual Certificates
                </span>
              </div>
              <p className="text-[10px] text-warm-gray/70 mb-3">
                Click a property to see full EPC details including heating, wall
                construction, and potential rating.
              </p>
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {data.certificates.map((cert, i) => (
                  <CertificateCard key={`${cert.address}-${i}`} cert={cert} index={i} />
                ))}
              </div>
            </div>

            {/* EPC rating scale reference */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-gray mb-3">
                EPC Rating Scale
              </h4>
              <div className="space-y-1">
                {ALL_BANDS.map((band) => (
                  <div key={band} className="flex items-center gap-3">
                    <div className="w-16 shrink-0">
                      <RatingBar rating={band} />
                    </div>
                    <span className="text-[11px] text-warm-gray w-8 shrink-0">
                      ({band === "A" ? "92-100" : band === "B" ? "81-91" : band === "C" ? "69-80" : band === "D" ? "55-68" : band === "E" ? "39-54" : band === "F" ? "21-38" : "1-20"})
                    </span>
                    <span className="text-[11px] text-navy">
                      {RATING_LABELS[band]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data source */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <Info className="h-3.5 w-3.5 text-warm-gray/60 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-warm-gray leading-relaxed">
                    <span className="font-semibold text-navy">
                      Data source:
                    </span>{" "}
                    <a
                      href="https://epc.opendatacommunities.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal hover:underline inline-flex items-center gap-0.5"
                    >
                      DLUHC EPC Open Data
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>{" "}
                    -- the Department for Levelling Up, Housing and Communities
                    publishes over 30 million Energy Performance Certificates for
                    domestic and non-domestic properties in England and Wales.
                  </p>
                  <p className="text-[10px] text-warm-gray/60 mt-1">
                    Certificates are valid for 10 years. Data is cached for 1
                    hour. SAP (Standard Assessment Procedure) scores range from 1
                    (worst) to 100+ (best).
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
