"use client";

// Planning Explorer: "By discipline" tab.
//
// Pick the kind of consultancy or supplier you are (acoustic consultant,
// ecologist, drainage engineer...) and see only the schemes whose decision
// notices carry a condition in your field: where in the country they are,
// which kinds of organisation are submitting them, which sectors, which
// LPAs, and the conditions themselves. The matching rules live in
// src/lib/planning-lens.ts.

import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import {
  Application,
  Condition,
  CONDITION_LABELS,
  Region,
  Sector,
  SECTOR_LABELS,
} from "@/lib/planning";
import {
  APPLICANT_TYPE_LABELS,
  ApplicantType,
  DISCIPLINE_BY_ID,
  DISCIPLINES,
  DisciplineId,
  REGION_GRID,
  classifyApplicant,
  conditionMatches,
  lensHits,
} from "@/lib/planning-lens";
import { ApplicationDrawer, Chip, Kpi, SECTORS, SECTOR_COLORS } from "./shared";

const MAX_LIST_RENDER = 50;

const REGION_SHORT: Record<Region, string> = {
  London: "London",
  "South East": "South East",
  "South West": "South West",
  "East of England": "East of Eng.",
  "East Midlands": "E. Midlands",
  "West Midlands": "W. Midlands",
  "Yorkshire & Humber": "Yorks & Humber",
  "North West": "North West",
  "North East": "North East",
  Wales: "Wales",
  Scotland: "Scotland",
};

interface Props {
  applications: Application[];
}

export function DisciplineLensTab({ applications }: Props) {
  const [disciplineId, setDisciplineId] = useState<DisciplineId>("acoustic");
  const [sectors, setSectors] = useState<Sector[]>([...SECTORS]);
  const [region, setRegion] = useState<Region | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const discipline = DISCIPLINE_BY_ID[disciplineId];

  useEffect(() => {
    track("planning_lens_selected", { discipline: disciplineId });
  }, [disciplineId]);

  // Only decisions whose notices we have read can carry conditions.
  const analysed = useMemo(
    () => applications.filter((a) => a.conditions.length > 0),
    [applications]
  );
  const analysedLpas = useMemo(
    () => new Set(analysed.map((a) => a.lpa)).size,
    [analysed]
  );

  // Hits before the region filter: drives the map so you can see where
  // everything is, then click a tile to narrow the rest of the page.
  const hitsAllRegions = useMemo(
    () =>
      lensHits(analysed, discipline).filter((h) =>
        sectors.includes(h.application.sector)
      ),
    [analysed, discipline, sectors]
  );

  const schemesAllRegions = useMemo(() => {
    const byId = new Map<string, Application>();
    for (const h of hitsAllRegions) byId.set(h.application.id, h.application);
    return Array.from(byId.values()).sort((a, b) =>
      b.decisionDate.localeCompare(a.decisionDate)
    );
  }, [hitsAllRegions]);

  const regionCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of schemesAllRegions) m.set(a.region, (m.get(a.region) ?? 0) + 1);
    return m;
  }, [schemesAllRegions]);

  const hits = useMemo(
    () =>
      region === null
        ? hitsAllRegions
        : hitsAllRegions.filter((h) => h.application.region === region),
    [hitsAllRegions, region]
  );
  const schemes = useMemo(
    () =>
      region === null
        ? schemesAllRegions
        : schemesAllRegions.filter((a) => a.region === region),
    [schemesAllRegions, region]
  );

  const applicantTypes = useMemo(() => tallyApplicantTypes(schemes), [schemes]);

  const namedApplicants = useMemo(() => {
    const m = new Map<
      string,
      { count: number; type: ApplicantType; sectors: Set<Sector> }
    >();
    for (const a of schemes) {
      const type = classifyApplicant(a.applicant);
      if (type === "not-stated") continue;
      const name = a.applicant.trim();
      const cur = m.get(name) ?? { count: 0, type, sectors: new Set<Sector>() };
      cur.count += 1;
      cur.sectors.add(a.sector);
      m.set(name, cur);
    }
    return Array.from(m.entries())
      .map(([name, v]) => ({ name, ...v, sectors: Array.from(v.sectors) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [schemes]);

  const sectorSplit = useMemo(
    () =>
      SECTORS.map((s) => ({
        sector: s,
        count: schemes.filter((a) => a.sector === s).length,
      })).filter((r) => r.count > 0),
    [schemes]
  );

  const lpaTally = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of schemes) m.set(a.lpa, (m.get(a.lpa) ?? 0) + 1);
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [schemes]);

  const shareOfAnalysed =
    analysed.length > 0
      ? Math.round((100 * schemesAllRegions.length) / analysed.length)
      : 0;

  const openApp = useMemo(
    () => (openId ? applications.find((a) => a.id === openId) ?? null : null),
    [openId, applications]
  );

  const isMatch = (c: Condition) => conditionMatches(c, discipline);

  return (
    <div className="space-y-8">
      {/* DISCIPLINE PICKER */}
      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
          I am a...
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <Chip
              key={d.id}
              active={d.id === disciplineId}
              onClick={() => {
                setDisciplineId(d.id);
                setRegion(null);
                setOpenId(null);
              }}
              label={d.label}
            />
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-cream/60 p-4">
          <p className="text-sm font-semibold text-navy">{discipline.audience}</p>
          <p className="mt-1 text-xs text-warm-gray leading-relaxed">
            {discipline.rule}
          </p>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray/80 mb-2">
            Limit to sector
          </p>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <Chip
                key={s}
                active={sectors.includes(s)}
                onClick={() =>
                  setSectors((cur) =>
                    cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
                  )
                }
                label={SECTOR_LABELS[s]}
              />
            ))}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-warm-gray/70 leading-relaxed">
          Conditions exist only for decisions whose notices we have read:{" "}
          <strong className="text-navy">{analysed.length}</strong> of the{" "}
          {applications.length.toLocaleString()} applications in the dataset,
          across {analysedLpas} local planning authorities. Counts below are
          from that analysed set, so treat them as a sample of what LPAs are
          asking for, not a census.
        </p>
      </section>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Schemes with a matching condition" value={String(schemes.length)} />
        <Kpi label="Matching conditions" value={String(hits.length)} />
        <Kpi label="Local planning authorities" value={String(lpaTally.length)} />
        <Kpi
          label="Share of analysed decisions"
          value={`${shareOfAnalysed}%`}
        />
      </section>

      {/* GEOGRAPHY + APPLICANT TYPE */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/10 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-navy">Where in the country</h2>
              <p className="mt-1 text-xs text-warm-gray">
                Schemes with a {discipline.label.toLowerCase()} condition, by
                region. Click a tile to narrow everything below to that region.
              </p>
            </div>
            {region !== null && (
              <button
                onClick={() => setRegion(null)}
                className="shrink-0 rounded-full bg-navy/5 hover:bg-navy/10 px-3 py-1 text-[11px] font-semibold text-navy"
              >
                Clear region
              </button>
            )}
          </div>
          <RegionTileMap
            counts={regionCounts}
            active={region}
            onSelect={(r) => {
              setRegion((cur) => (cur === r ? null : r));
              track("planning_lens_region", { discipline: disciplineId, region: r });
            }}
          />
          <p className="mt-3 text-[10px] text-warm-gray/60">
            Schematic layout, not to scale. Regions with no analysed decisions
            show zero; coverage follows the LPAs whose portals we read.
          </p>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Who is submitting them</h2>
          <p className="mt-1 text-xs text-warm-gray">
            Type of organisation named as applicant on the LPA portal, for the
            schemes shown. Classified from the applicant name.
          </p>
          <ApplicantTypeBars rows={applicantTypes} />
        </div>
      </section>

      {/* SECTOR + NAMED APPLICANTS */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Which sectors</h2>
          <p className="mt-1 text-xs text-warm-gray">
            The kind of development that attracts this condition.
          </p>
          <div className="mt-4 space-y-2">
            {sectorSplit.map((row) => {
              const pct = schemes.length > 0 ? (100 * row.count) / schemes.length : 0;
              return (
                <div key={row.sector} className="flex items-center gap-3 text-xs">
                  <span className="w-40 shrink-0 text-navy truncate">
                    {SECTOR_LABELS[row.sector]}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-cream overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: SECTOR_COLORS[row.sector],
                      }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right tabular-nums text-warm-gray">
                    {row.count} ({Math.round(pct)}%)
                  </span>
                </div>
              );
            })}
            {sectorSplit.length === 0 && (
              <p className="py-4 text-center text-xs text-warm-gray">
                No schemes match.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">Named applicants</h2>
          <p className="mt-1 text-xs text-warm-gray">
            Organisations and people filing these schemes, where the portal
            names them. A prospect list for anyone selling into this
            discipline.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-warm-gray border-b border-navy/10">
                  <th className="py-2 pr-4">Applicant</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4 text-right">Schemes</th>
                </tr>
              </thead>
              <tbody>
                {namedApplicants.map((row) => (
                  <tr key={row.name} className="border-b border-navy/5 last:border-0">
                    <td className="py-2 pr-4 text-navy">{row.name}</td>
                    <td className="py-2 pr-4 text-warm-gray text-xs">
                      {APPLICANT_TYPE_LABELS[row.type]}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold tabular-nums">
                      {row.count}
                    </td>
                  </tr>
                ))}
                {namedApplicants.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-warm-gray text-xs">
                      No named applicants in this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* LPAs */}
      {lpaTally.length > 0 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">
            Local planning authorities imposing it
          </h2>
          <p className="mt-1 text-xs text-warm-gray">
            Councils whose decision notices carry a {discipline.label.toLowerCase()}{" "}
            condition in this selection.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {lpaTally.map(([lpa, n]) => (
              <span
                key={lpa}
                className="rounded-full bg-cream px-3 py-1 text-xs text-navy"
              >
                {lpa} <strong className="tabular-nums">{n}</strong>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CONDITIONS LIST */}
      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-navy">
              {hits.length} matching condition{hits.length === 1 ? "" : "s"}
            </h2>
            <p className="mt-1 text-xs text-warm-gray">
              One row per condition. Click a row for the full wording, the
              application and a link to the LPA portal.
              {hits.length > MAX_LIST_RENDER && (
                <> Showing the {MAX_LIST_RENDER} most recent.</>
              )}
            </p>
          </div>
          {schemes.length > 0 && (
            <button
              onClick={() => downloadLensCsv(discipline.label, hits)}
              className="rounded-full bg-navy/5 hover:bg-navy/10 px-3 py-1.5 text-[11px] font-semibold text-navy"
            >
              ↓ Download CSV ({hits.length})
            </button>
          )}
        </div>
        <div className="mt-4 divide-y divide-navy/5">
          {hits.slice(0, MAX_LIST_RENDER).map(({ application, condition }) => (
            <button
              key={`${application.id}-${condition.number}`}
              onClick={() => setOpenId(application.id)}
              className="w-full text-left py-4 hover:bg-cream/50 px-2 -mx-2 rounded-lg transition-colors"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-dark">
                  {CONDITION_LABELS[condition.type]}
                </span>
                <span className="text-sm font-semibold text-navy">
                  {condition.summary}
                </span>
                <span className="text-[11px] text-warm-gray">
                  {application.applicant || "Applicant not stated"} ·{" "}
                  {application.lpa} · {SECTOR_LABELS[application.sector]} ·{" "}
                  {application.decisionDate}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-warm-gray leading-relaxed line-clamp-2">
                {condition.text}
              </p>
            </button>
          ))}
          {hits.length === 0 && (
            <p className="py-6 text-center text-warm-gray text-sm">
              No conditions match. Try another discipline, add sectors back in
              or clear the region.
            </p>
          )}
        </div>
      </section>

      {openApp && (
        <ApplicationDrawer
          app={openApp}
          highlightTypes={discipline.conditionTypes}
          isHighlighted={isMatch}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pieces reused by the Trends tab
// ---------------------------------------------------------------------------

export interface ApplicantTypeRow {
  type: ApplicantType;
  count: number;
}

export function tallyApplicantTypes(apps: Application[]): ApplicantTypeRow[] {
  const m = new Map<ApplicantType, number>();
  for (const a of apps) {
    const t = classifyApplicant(a.applicant);
    m.set(t, (m.get(t) ?? 0) + 1);
  }
  return Array.from(m.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function ApplicantTypeBars({ rows }: { rows: ApplicantTypeRow[] }) {
  const named = rows.filter((r) => r.type !== "not-stated");
  const notStated = rows.find((r) => r.type === "not-stated")?.count ?? 0;
  const namedTotal = named.reduce((n, r) => n + r.count, 0);
  return (
    <div className="mt-4">
      <div className="space-y-2">
        {named.map((row) => {
          const pct = namedTotal > 0 ? (100 * row.count) / namedTotal : 0;
          return (
            <div key={row.type} className="flex items-center gap-3 text-xs">
              <span className="w-44 shrink-0 text-navy truncate">
                {APPLICANT_TYPE_LABELS[row.type]}
              </span>
              <div className="flex-1 h-2.5 rounded-full bg-cream overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right tabular-nums text-warm-gray">
                {row.count} ({Math.round(pct)}%)
              </span>
            </div>
          );
        })}
        {named.length === 0 && (
          <p className="py-4 text-center text-xs text-warm-gray">
            No named applicants in this selection.
          </p>
        )}
      </div>
      {notStated > 0 && (
        <p className="mt-3 text-[10px] text-warm-gray/70">
          Plus {notStated} where the portal lists only an agent or no
          applicant. Percentages exclude those.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Region tile map
// ---------------------------------------------------------------------------

function RegionTileMap({
  counts,
  active,
  onSelect,
}: {
  counts: Map<string, number>;
  active: Region | null;
  onSelect: (r: Region) => void;
}) {
  const max = Math.max(1, ...Array.from(counts.values()));
  return (
    <div className="mt-4 grid grid-cols-3 gap-1.5 max-w-sm">
      {REGION_GRID.flatMap((row, ri) =>
        row.map((r, ci) => {
          if (r === null) return <div key={`${ri}-${ci}`} />;
          const n = counts.get(r) ?? 0;
          const intensity = n === 0 ? 0 : 0.18 + 0.82 * (n / max);
          const isActive = active === r;
          return (
            <button
              key={r}
              onClick={() => onSelect(r)}
              title={`${r}: ${n} scheme${n === 1 ? "" : "s"}`}
              className={`rounded-lg px-2 py-3 text-left transition-shadow ${
                isActive ? "ring-2 ring-pink ring-offset-1" : "hover:ring-1 hover:ring-navy/30"
              }`}
              style={{
                backgroundColor:
                  n === 0 ? "#F3F1EC" : `rgba(0, 163, 137, ${intensity.toFixed(2)})`,
                color: n > 0 && intensity > 0.55 ? "#ffffff" : "#1F2937",
              }}
            >
              <span className="block text-[10px] font-semibold leading-tight">
                {REGION_SHORT[r]}
              </span>
              <span className="block mt-1 text-lg font-bold tabular-nums leading-none">
                {n}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

function csvEscape(v: string | number | undefined): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadLensCsv(
  label: string,
  hits: Array<{ application: Application; condition: Condition }>
) {
  const headers = [
    "reference",
    "lpa",
    "region",
    "sector",
    "applicant",
    "applicantType",
    "decision",
    "decisionDate",
    "conditionNumber",
    "conditionType",
    "conditionSummary",
    "conditionText",
    "sourceUrl",
  ];
  const rows = hits.map(({ application: a, condition: c }) => [
    a.reference,
    a.lpa,
    a.region,
    SECTOR_LABELS[a.sector],
    a.applicant,
    APPLICANT_TYPE_LABELS[classifyApplicant(a.applicant)],
    a.decision,
    a.decisionDate,
    c.number,
    CONDITION_LABELS[c.type],
    c.summary,
    c.text,
    a.sourceUrl ?? "",
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `planning-explorer-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
