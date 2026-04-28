"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  MinusCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  MapPin,
  FileText,
  BarChart3,
  Sparkles,
} from "lucide-react";

export type PlanningCategory = "commercial" | "residential" | "mixed" | "all";

interface PlanningApplication {
  id: number;
  reference: string;
  description: string;
  decision: string;
  decisionType: string;
  decisionDate: string | null;
  startDate: string | null;
  entryDate: string;
  localAuthority: string;
  address: string | null;
  documentationUrl: string | null;
  coordinates: { lat: number; lng: number } | null;
  category: "commercial" | "residential" | "mixed" | "other" | "unclassified";
}

interface PlanningSummary {
  total: number;
  decided: number;
  approved: number;
  refused: number;
  pending: number;
  approvalRate: number;
  totalInDataset: number;
  poolSize: number;
  matchedInPool: number;
  breakdown: {
    commercial: number;
    residential: number;
    mixed: number;
    other: number;
    unclassified: number;
  };
  category: PlanningCategory;
}

interface PlanningData {
  applications: PlanningApplication[];
  summary: PlanningSummary;
  lastUpdated: string;
}

const ITEMS_PER_PAGE = 5;

const TAB_OPTIONS: { value: PlanningCategory; label: string }[] = [
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
  { value: "mixed", label: "Mixed use" },
  { value: "all", label: "All classified" },
];

const CATEGORY_LABEL: Record<PlanningCategory, string> = {
  commercial: "commercial",
  residential: "residential",
  mixed: "mixed-use",
  all: "classified",
};

function getDecisionBadge(decision: string) {
  switch (decision) {
    case "Approved":
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        dot: "bg-emerald-500",
      };
    case "Refused":
      return {
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        dot: "bg-red-500",
      };
    case "Withdrawn":
      return {
        bg: "bg-gray-100 text-gray-600 border-gray-200",
        icon: MinusCircle,
        dot: "bg-gray-400",
      };
    default:
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        dot: "bg-amber-500",
      };
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function buildAnalysis(summary: PlanningSummary): string {
  const label = CATEGORY_LABEL[summary.category];
  const breakdown = summary.breakdown;
  const classifiedTotal =
    breakdown.commercial + breakdown.residential + breakdown.mixed + breakdown.other;
  const share =
    classifiedTotal > 0 && summary.category !== "all"
      ? Math.round((breakdown[summary.category] / classifiedTotal) * 100)
      : null;

  if (summary.total === 0) {
    return `No ${label} applications surfaced in the latest pool of ${summary.poolSize} entries from Planning Data England - coverage of this category varies by local authority.`;
  }

  if (summary.decided === 0) {
    return `${summary.total} recent ${label} applications are tracked, but none have a published decision yet - local authority publishing schedules vary.`;
  }

  const rate = summary.approvalRate;
  const refusalShare =
    summary.decided > 0
      ? Math.round((summary.refused / summary.decided) * 100)
      : 0;

  if (summary.category === "all") {
    return `Across the latest classified batch, ${rate}% of decisions are approvals and ${refusalShare}% refusals. Residential dominates the pipeline (${breakdown.residential} entries) versus ${breakdown.commercial} commercial and ${breakdown.mixed} mixed-use.`;
  }

  const sharePhrase =
    share !== null
      ? `Within the classified pool, ${label} work accounts for roughly ${share}% of recent activity. `
      : "";

  return `${sharePhrase}Of the ${summary.decided} ${label} decisions in this batch, ${rate}% were approved and ${refusalShare}% refused - a useful read on what's actually getting through planning right now.`;
}

interface Props {
  category: PlanningCategory;
}

export function PlanningActivityWidget({ category }: Props) {
  const [data, setData] = useState<PlanningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const fetchData = async (cat: PlanningCategory) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/planning?category=${cat}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Unable to load planning data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchData(category);
    const interval = setInterval(() => fetchData(category), 3600000);
    return () => clearInterval(interval);
  }, [category]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
          <div className="h-8 w-56 bg-cream-dark rounded mb-4" />
          <div className="h-20 w-full bg-cream-dark rounded mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-cream-dark rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-warm-gray">{error}</p>
        <button
          onClick={() => fetchData(category)}
          className="mt-2 text-teal underline text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const applications = data?.applications || [];
  const summary = data?.summary;
  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const pageApps = applications.slice(
    page * ITEMS_PER_PAGE,
    (page + 1) * ITEMS_PER_PAGE
  );
  const labelText = CATEGORY_LABEL[category];

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="rounded-2xl bg-charcoal p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 pulse-live" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Live Planning Applications - England
            </span>
          </div>
          <button
            onClick={() => fetchData(category)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums text-teal">
                {summary ? formatNumber(summary.totalInDataset) : "--"}
              </span>
              <span className="text-lg text-gray-400">applications</span>
            </div>
            <span className="mt-1 inline-block text-xs text-gray-500">
              tracked by Planning Data England · {labelText} view
            </span>
          </div>
          <div className="flex-1" />
          <Landmark className="h-16 w-16 text-navy-light opacity-20" />
        </div>

        {/* Quick stats row */}
        {summary && (
          <div className="mt-5 grid grid-cols-4 gap-3">
            <div className="rounded-lg bg-navy-light/50 px-3 py-2.5 text-center">
              <p className="text-lg font-bold tabular-nums text-white">
                {summary.total}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Recent batch</p>
            </div>
            <div className="rounded-lg bg-navy-light/50 px-3 py-2.5 text-center">
              <p className="text-lg font-bold tabular-nums text-emerald-400">
                {summary.approved}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Approved</p>
            </div>
            <div className="rounded-lg bg-navy-light/50 px-3 py-2.5 text-center">
              <p className="text-lg font-bold tabular-nums text-red-400">
                {summary.refused}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Refused</p>
            </div>
            <div className="rounded-lg bg-navy-light/50 px-3 py-2.5 text-center">
              <p className="text-lg font-bold tabular-nums text-amber-400">
                {summary.pending}
              </p>
              <p className="text-[10px] text-gray-400 leading-tight">Pending</p>
            </div>
          </div>
        )}

        {/* Approval rate bar */}
        {summary && summary.decided > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-gray-400">
                Approval rate (decided applications)
              </span>
              <span className="text-xs font-semibold text-emerald-400 tabular-nums">
                {summary.approvalRate}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-navy-light overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal transition-all duration-700"
                style={{ width: `${summary.approvalRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Context box */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-navy-light/50 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-300">Planning data</span> from
            English local authorities, published openly by DLUHC. Showing the latest
            {" "}{labelText} applications with a published development classification -
            roughly two-thirds of upstream entries are unclassified and excluded from
            this view.
          </p>
        </div>
      </div>

      {/* Fabrick Analysis */}
      {summary && (
        <div className="rounded-2xl bg-charcoal p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-pink" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink">
              Fabrick Analysis
            </span>
          </div>
          <p className="text-base md:text-lg leading-relaxed text-white/90 max-w-3xl">
            {buildAnalysis(summary)}
          </p>
        </div>
      )}

      {/* Application Feed */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-teal" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
              Recent {labelText} applications
            </h3>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg p-1.5 text-warm-gray hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-warm-gray tabular-nums px-1">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded-lg p-1.5 text-warm-gray hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${category}-${page}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {pageApps.map((app, index) => {
              const badge = getDecisionBadge(app.decision);
              const BadgeIcon = badge.icon;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                  className="rounded-xl bg-cream p-4 hover:bg-cream-dark/60 transition-colors group"
                >
                  {/* Top row: reference + badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono font-semibold text-navy shrink-0">
                        {app.reference}
                      </span>
                      {app.documentationUrl && (
                        <a
                          href={app.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-warm-gray/50 hover:text-teal transition-colors shrink-0"
                          title="View on planning portal"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold shrink-0 ${badge.bg}`}
                    >
                      <BadgeIcon className="h-3 w-3" />
                      {app.decision}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-navy leading-relaxed mb-2">
                    {truncateText(app.description, 160)}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray">
                      <Landmark className="h-3 w-3" />
                      {app.localAuthority}
                    </span>
                    {app.address && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray">
                        <MapPin className="h-3 w-3" />
                        {truncateText(app.address, 40)}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[10px] text-warm-gray">
                      <Clock className="h-3 w-3" />
                      {app.decisionDate
                        ? formatDate(app.decisionDate)
                        : app.startDate
                        ? `Filed ${formatDate(app.startDate)}`
                        : formatDate(app.entryDate)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {applications.length === 0 && (
          <div className="text-center py-8 text-warm-gray text-sm">
            No {labelText} applications found in the latest batch
          </div>
        )}
      </div>

      {/* Decision breakdown mini-chart */}
      {summary && summary.decided > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-teal" />
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
              Decision Breakdown
            </span>
          </div>
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {summary.approved > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(summary.approved / summary.total) * 100}%`,
                }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-emerald-500 rounded-l-lg flex items-center justify-center"
                title={`Approved: ${summary.approved}`}
              >
                <span className="text-[10px] font-bold text-white">
                  {summary.approved}
                </span>
              </motion.div>
            )}
            {summary.refused > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(summary.refused / summary.total) * 100}%`,
                }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-red-500 flex items-center justify-center"
                title={`Refused: ${summary.refused}`}
              >
                <span className="text-[10px] font-bold text-white">
                  {summary.refused}
                </span>
              </motion.div>
            )}
            {summary.pending > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(summary.pending / summary.total) * 100}%`,
                }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-amber-400 rounded-r-lg flex items-center justify-center"
                title={`Pending: ${summary.pending}`}
              >
                <span className="text-[10px] font-bold text-white">
                  {summary.pending}
                </span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center justify-center gap-4 mt-2.5">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-warm-gray">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Approved
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-warm-gray">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Refused
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-warm-gray">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Pending
            </span>
          </div>
        </div>
      )}

      {/* Data Source Attribution */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-warm-gray/60 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-warm-gray leading-relaxed">
              <span className="font-semibold text-navy">Data source:</span>{" "}
              <a
                href="https://www.planning.data.gov.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline inline-flex items-center gap-0.5"
              >
                Planning Data England
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {" "}- published by the Department for Levelling Up, Housing and
              Communities (DLUHC). Open data from English local planning authorities.
            </p>
            <p className="text-[10px] text-warm-gray/60 mt-1">
              Data cached for 1 hour. Categorisation uses MHCLG planning
              development classification codes; entries without a published
              classification are excluded from the filtered views. Not all
              authorities publish at the same frequency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ControlProps {
  value: PlanningCategory;
  onChange: (value: PlanningCategory) => void;
}

export function PlanningCategoryTabs({ value, onChange }: ControlProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-warm-gray mr-1">View:</span>
      {TAB_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-3 py-1 font-semibold transition-colors ${
            value === opt.value
              ? "bg-charcoal text-white"
              : "bg-white text-warm-gray border border-cream-dark hover:bg-cream-dark hover:border-charcoal/30"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
