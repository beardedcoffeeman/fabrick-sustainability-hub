"use client";

// Shared building blocks for the Planning Explorer tabs (Trends, Conditions
// search, By discipline). Pulled out of page.tsx so the discipline lens tab
// can live in its own component file.

import { X } from "lucide-react";
import {
  Application,
  Condition,
  ConditionType,
  CONDITION_LABELS,
  Sector,
  SECTOR_LABELS,
} from "@/lib/planning";

export const SECTORS: Sector[] = [
  "data-centre",
  "logistics",
  "btr-pbsa",
  "healthcare",
  "education",
  "renewable-energy",
  "hotels",
  "mixed-use",
];

export const SECTOR_COLORS: Record<Sector, string> = {
  "data-centre": "#00A389",
  logistics: "#2D2D3F",
  "btr-pbsa": "#FF3D7F",
  healthcare: "#1A8FE3",
  education: "#F2994A",
  "renewable-energy": "#27AE60",
  hotels: "#9B51E0",
  "mixed-use": "#EB5757",
};


export function AudienceCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-navy-light/40 border border-white/5 p-5">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="mt-2 text-xs text-gray-300 leading-relaxed">{body}</p>
    </div>
  );
}

export function HowToCard({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-5">
      <p className="text-[11px] font-semibold tracking-wider text-pink tabular-nums">
        {number}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-navy">{title}</h3>
      <p className="mt-2 text-xs text-warm-gray leading-relaxed">{body}</p>
    </div>
  );
}

export function csvEscape(v: string | number | undefined): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function downloadCsv(apps: Application[]) {
  const headers = [
    "id",
    "reference",
    "lpa",
    "region",
    "address",
    "useClass",
    "sector",
    "description",
    "applicant",
    "agent",
    "decision",
    "decisionDate",
    "grossFloorAreaSqm",
    "source",
    "conditionCount",
    "sourceUrl",
  ];
  const rows = apps.map((a) => [
    a.id,
    a.reference,
    a.lpa,
    a.region,
    a.address,
    a.useClass,
    SECTOR_LABELS[a.sector],
    a.description,
    a.applicant,
    a.agent,
    a.decision,
    a.decisionDate,
    a.grossFloorAreaSqm,
    a.source,
    a.conditions.length,
    a.sourceUrl ?? "",
  ]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `planning-explorer-${date}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ConditionTeaser({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl bg-cream/60 p-4 border border-navy/5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-dark">
        {label}
      </p>
      <p className="mt-1.5 text-xs text-warm-gray leading-relaxed">{body}</p>
    </div>
  );
}

export function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray/80 mb-2">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors border ${
        active
          ? "bg-navy text-white border-navy"
          : "bg-white text-warm-gray border-navy/15 hover:border-navy/40"
      }`}
    >
      {label}
    </button>
  );
}

export function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function SourceBadge({ source }: { source: Application["source"] }) {
  if (source === "claude-extraction") {
    return (
      <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-pink">
        Conditions extracted
      </span>
    );
  }
  if (source === "lpa-portal-scrape") {
    return (
      <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-pink">
        LPA portal
      </span>
    );
  }
  return (
    <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-teal-dark">
      Open data
    </span>
  );
}

export function ApplicationRow({ app }: { app: Application }) {
  return (
    <div className="py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            app.decision === "approved"
              ? "bg-teal/10 text-teal-dark"
              : app.decision === "refused"
              ? "bg-pink/10 text-pink"
              : "bg-warm-gray/10 text-warm-gray"
          }`}
        >
          {app.decision}
        </span>
        <SourceBadge source={app.source} />
        <span className="text-sm font-semibold text-navy">
          {app.applicant || <em className="text-warm-gray font-normal">(applicant not in dataset)</em>}
        </span>
        <span className="text-[11px] text-warm-gray">
          {app.lpa} · {app.useClass || "—"} · {app.decisionDate || "pending"}
        </span>
      </div>
      <p className="mt-1 text-xs text-warm-gray leading-relaxed">
        {app.description}
      </p>
      <p className="mt-1 text-[11px] text-warm-gray/70">
        Ref {app.reference} · {app.address}
        {app.grossFloorAreaSqm
          ? ` · ${app.grossFloorAreaSqm.toLocaleString()} sqm`
          : ""}
        {app.conditions.length > 0
          ? ` · ${app.conditions.length} condition${
              app.conditions.length === 1 ? "" : "s"
            }`
          : ""}
      </p>
    </div>
  );
}

export function ApplicationDrawer({
  app,
  highlightTypes,
  isHighlighted,
  onClose,
}: {
  app: Application;
  highlightTypes: ConditionType[];
  /** Optional predicate; when given it overrides highlightTypes. */
  isHighlighted?: (c: Condition) => boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-navy/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-navy/10 px-6 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray">
              {app.lpa} · Ref {app.reference}
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-xl font-bold text-navy">
              {app.applicant}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-cream"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-warm-gray" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">
              About the application
            </p>
            <p className="mt-1 text-sm text-navy">{app.description}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-warm-gray">
              <dt>Address</dt>
              <dd className="text-navy">
                {app.address}, {app.postcode}
              </dd>
              <dt>Region</dt>
              <dd className="text-navy">{app.region}</dd>
              <dt>Sector / Use class</dt>
              <dd className="text-navy">
                {SECTOR_LABELS[app.sector]} · {app.useClass}
              </dd>
              <dt>Agent</dt>
              <dd className="text-navy">{app.agent}</dd>
              <dt>Decision</dt>
              <dd className="text-navy capitalize">
                {app.decision} · {app.decisionDate}
              </dd>
              {app.grossFloorAreaSqm && (
                <>
                  <dt>GIA</dt>
                  <dd className="text-navy tabular-nums">
                    {app.grossFloorAreaSqm.toLocaleString()} sqm
                  </dd>
                </>
              )}
            </dl>
            {app.sourceUrl && (
              <a
                href={app.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-navy-light"
              >
                View on the LPA portal
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray">
              Conditions ({app.conditions.length})
            </p>
            <div className="mt-2 space-y-3">
              {app.conditions.map((c) => {
                const highlighted = isHighlighted ? isHighlighted(c) : highlightTypes.includes(c.type);
                return (
                  <div
                    key={c.number}
                    className={`rounded-xl border p-3 ${
                      highlighted
                        ? "border-teal/40 bg-teal/5"
                        : "border-navy/10 bg-cream/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-navy border border-navy/10">
                        {c.number}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-dark">
                        {CONDITION_LABELS[c.type]}
                      </span>
                      <span className="text-xs font-semibold text-navy">
                        {c.summary}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-warm-gray leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                );
              })}
              {app.conditions.length === 0 && (
                <p className="text-xs text-warm-gray">
                  No conditions on record (refused / withdrawn / pending).
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
