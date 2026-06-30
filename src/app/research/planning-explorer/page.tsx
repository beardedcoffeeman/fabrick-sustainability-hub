"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, X, Building2, Target, MapPin, ListChecks } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
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
import {
  Application,
  Condition,
  ConditionType,
  CONDITION_LABELS,
  Sector,
  SECTOR_LABELS,
  Region,
  loadApplications,
  getDatasetCounts,
} from "@/lib/planning";

const SECTORS: Sector[] = [
  "data-centre",
  "logistics",
  "btr-pbsa",
  "healthcare",
  "education",
  "renewable-energy",
  "hotels",
  "mixed-use",
];

const SECTOR_COLORS: Record<Sector, string> = {
  "data-centre": "#00A389",
  logistics: "#2D2D3F",
  "btr-pbsa": "#FF3D7F",
  healthcare: "#1A8FE3",
  education: "#F2994A",
  "renewable-energy": "#27AE60",
  hotels: "#9B51E0",
  "mixed-use": "#EB5757",
};
const CONDITION_TYPES: ConditionType[] = [
  "noise",
  "bng",
  "transport",
  "ecology",
  "air-quality",
  "s106",
  "daylight",
  "hours",
  "lighting",
  "drainage",
  "heritage",
  "fire",
  "materials",
];

type Tab = "trends" | "conditions";

interface ConditionHit {
  application: Application;
  condition: Condition;
}

const APPLICATIONS = loadApplications();
const COUNTS = getDatasetCounts();
const MAX_LIST_RENDER = 50;

export default function PlanningExplorerPage() {
  const [tab, setTab] = useState<Tab>("trends");

  return (
    <main className="min-h-screen bg-cream">
      <div className="border-b border-navy/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-gray hover:text-navy"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Pulse
          </Link>
        </div>
      </div>

      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
          Planning Explorer
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-navy leading-[1.1] max-w-3xl">
          Where UK construction is actually building, by sector.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-warm-gray leading-relaxed">
          The Planning Explorer turns the UK planning register into a working
          intelligence tool. Real applications. Real LPAs. Real sectors. Use
          it to see where demand is moving, which regions are heating up, and
          which applicants are filing the schemes you want to be specified
          into.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-navy/5 px-3 py-1 text-warm-gray">
            <strong className="text-navy">{COUNTS.total.toLocaleString()}</strong>{" "}
            real applications
          </span>
          <span className="rounded-full bg-navy/5 px-3 py-1 text-warm-gray">
            <strong className="text-navy">{COUNTS.lpas.length}</strong>{" "}
            local planning authorities
          </span>
          <span className="rounded-full bg-navy/5 px-3 py-1 text-warm-gray">
            <strong className="text-navy">8</strong> sectors
          </span>
          {COUNTS.withApplicant > 0 && (
            <span className="rounded-full bg-teal/10 px-3 py-1 text-teal-dark">
              <strong>{COUNTS.withApplicant.toLocaleString()}</strong> with
              applicant names
            </span>
          )}
          {COUNTS.conditions > 0 && (
            <span className="rounded-full bg-pink/10 px-3 py-1 text-pink">
              <strong>{COUNTS.conditions.toLocaleString()}</strong>{" "}
              AI-extracted conditions
            </span>
          )}
        </div>
        {COUNTS.lastRefreshed && (
          <p className="mt-3 text-[10px] text-warm-gray/70">
            Data last refreshed{" "}
            {new Date(COUNTS.lastRefreshed).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            . Auto-updates weekly.
          </p>
        )}
      </header>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-navy text-white p-6 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
            Who this is for
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold leading-tight max-w-2xl">
            Anyone whose growth depends on knowing where construction
            is happening.
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4 text-sm">
            <AudienceCard
              icon={<Building2 className="h-5 w-5 text-teal" />}
              title="Building product manufacturers"
              body="Insulation, cladding, glazing, M&E, fit-out, structural, roofing. Find the schemes where your product needs to be specified — before the spec is set."
            />
            <AudienceCard
              icon={<Target className="h-5 w-5 text-pink" />}
              title="Specifier and BD teams"
              body="Architects, M&E consultants, contractors. See which schemes are active in your patch and who the applicants are."
            />
            <AudienceCard
              icon={<MapPin className="h-5 w-5 text-teal" />}
              title="Marketing and strategy"
              body="Spot sector momentum, geographic clusters and demand trends. Decide where to invest content, ad spend and sales coverage."
            />
            <AudienceCard
              icon={<ListChecks className="h-5 w-5 text-pink" />}
              title="Investors and analysts"
              body="Real planning activity by sector and region is a leading indicator of construction output. Use it to validate the macro picture."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal">
          How to use it
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <HowToCard
            number="01"
            title="Pick your sector"
            body="Filter to the sectors where your product, service or strategy lives. Eight options covering most of UK construction demand: data centres, logistics, BTR/PBSA, healthcare, education, renewable energy, hotels, mixed-use regen."
          />
          <HowToCard
            number="02"
            title="See where the activity is"
            body="Watch counts and approval rates move as you change region and decision filters. The 'Most active LPAs' table is your shortlist of councils worth tracking, attending committees in, or building relationships with."
          />
          <HowToCard
            number="03"
            title="Drill into specific schemes"
            body="Open any application to see the description, reference and LPA. Click through to the source portal for full applicant detail, documents and decision notices."
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-navy/10 bg-white p-1 shadow-sm">
          {(["trends", "conditions"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                tab === t
                  ? "bg-navy text-white"
                  : "text-warm-gray hover:text-navy"
              }`}
            >
              {t === "trends" ? "Trends" : "Conditions search"}
            </button>
          ))}
        </div>
        <ExportButton
          targetId="planning-explorer-capture"
          filename={`pulse-planning-explorer-${tab}`}
          source={`planning-explorer:${tab}`}
          label="Download view"
        />
      </div>

      <div
        id="planning-explorer-capture"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-12"
      >
        {tab === "trends" ? <TrendsTab /> : <ConditionsTab />}
      </div>

      <DataSourcesFooter />
    </main>
  );
}

function DataSourcesFooter() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
          How this is built
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold leading-tight max-w-2xl">
          Open government data and direct LPA-portal scrapes, classified by
          Claude.
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3 text-sm text-gray-300">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal mb-2">
              Primary source
            </p>
            <p className="leading-relaxed">
              <a
                href="https://www.planning.data.gov.uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-teal underline-offset-4 underline"
              >
                planning.data.gov.uk
              </a>{" "}
              — the UK government&apos;s open planning data service.
              Currently in alpha; coverage grows monthly as more councils
              join.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal mb-2">
              Local planning authorities
            </p>
            <p className="leading-relaxed">
              {COUNTS.lpas.length} councils scraped directly from their
              Idox Public Access portals for richer detail including real
              applicant names.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-teal mb-2">
              Condition extraction
            </p>
            <p className="leading-relaxed">
              Decision-notice PDFs are read by Claude Sonnet 4.6 and each
              condition is classified by type (noise, ecology, BNG,
              transport, fire, daylight, air quality, etc.).
            </p>
          </div>
        </div>
        <p className="mt-8 text-[11px] text-gray-500 leading-relaxed max-w-3xl">
          Planning Explorer is part of{" "}
          <a
            href="https://pulse.fabrick.agency"
            className="text-gray-300 hover:text-white underline-offset-4 underline"
          >
            Pulse by Fabrick
          </a>
          . Data refreshes weekly. We do not republish content that LPAs
          intend to keep behind their own portals — every record links
          back to the source. If you spot something we&apos;ve got wrong,{" "}
          <a
            href="mailto:hello@fabrick.agency?subject=Planning%20Explorer%20feedback"
            className="text-gray-300 hover:text-white underline-offset-4 underline"
          >
            tell us
          </a>
          .
        </p>
      </div>
    </footer>
  );
}

// ============================================================
// TRENDS TAB
// ============================================================

function TrendsTab() {
  const [sectors, setSectors] = useState<Sector[]>([...SECTORS]);
  const [regions, setRegions] = useState<Region[] | null>(null); // null = all
  const [decisionFilter, setDecisionFilter] = useState<
    "all" | "approved" | "refused"
  >("all");

  // All UK regions, always visible as filter chips — empty regions just yield
  // zero results when picked, rather than vanishing.
  const allRegions: Region[] = [
    "London",
    "South East",
    "South West",
    "East of England",
    "East Midlands",
    "West Midlands",
    "Yorkshire & Humber",
    "North West",
    "North East",
    "Wales",
    "Scotland",
  ];

  const filtered = useMemo(() => {
    return APPLICATIONS.filter((a) => sectors.includes(a.sector))
      .filter((a) =>
        regions === null
          ? true
          : a.region !== "" && regions.includes(a.region as Region)
      )
      .filter((a) =>
        decisionFilter === "all" ? true : a.decision === decisionFilter
      );
  }, [sectors, regions, decisionFilter]);

  const total = filtered.length;
  const approved = filtered.filter((a) => a.decision === "approved").length;
  const refused = filtered.filter((a) => a.decision === "refused").length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // LPA tally (the open dataset has LPA for every record; applicant is mostly
  // blank in the alpha so we surface LPAs instead — more useful for "which
  // councils are doing the work" anyway).
  const lpaTally = useMemo(() => {
    const map = new Map<string, { count: number; sectors: Set<Sector> }>();
    for (const a of filtered) {
      const cur = map.get(a.lpa) ?? { count: 0, sectors: new Set<Sector>() };
      cur.count += 1;
      cur.sectors.add(a.sector);
      map.set(a.lpa, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        count: v.count,
        sectors: Array.from(v.sectors),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // Applicants — only includes records where applicant is populated. Often
  // empty under current open data coverage; will fill in as we add LPA-portal
  // scrapes that capture applicant detail.
  const applicantTally = useMemo(() => {
    const map = new Map<string, { count: number; sectors: Set<Sector> }>();
    for (const a of filtered) {
      const name = a.applicant.trim();
      if (!name) continue;
      const cur = map.get(name) ?? { count: 0, sectors: new Set<Sector>() };
      cur.count += 1;
      cur.sectors.add(a.sector);
      map.set(name, cur);
    }
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name,
        count: v.count,
        sectors: Array.from(v.sectors),
      }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // sector chart
  const sectorChart = useMemo(() => {
    return SECTORS.filter((s) => sectors.includes(s)).map((s) => ({
      sector: SECTOR_LABELS[s],
      key: s,
      count: filtered.filter((a) => a.sector === s).length,
    }));
  }, [filtered, sectors]);

  return (
    <div className="space-y-8">
      {/* FILTERS */}
      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
          Filters
        </h2>

        <div className="mt-4 grid gap-5 lg:grid-cols-3">
          <FilterGroup title="Sector">
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
          </FilterGroup>

          <FilterGroup title="Region">
            <Chip
              active={regions === null}
              onClick={() => setRegions(null)}
              label="All regions"
            />
            {allRegions.map((r) => (
              <Chip
                key={r}
                active={regions !== null && regions.includes(r)}
                onClick={() =>
                  setRegions((cur) => {
                    const list = cur ?? [];
                    return list.includes(r)
                      ? list.filter((x) => x !== r)
                      : [...list, r];
                  })
                }
                label={r}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Decision">
            {(["all", "approved", "refused"] as const).map((d) => (
              <Chip
                key={d}
                active={decisionFilter === d}
                onClick={() => setDecisionFilter(d)}
                label={d[0].toUpperCase() + d.slice(1)}
              />
            ))}
          </FilterGroup>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Applications" value={String(total)} />
        <Kpi label="Approved" value={String(approved)} />
        <Kpi label="Refused" value={String(refused)} />
        <Kpi label="Approval rate" value={`${approvalRate}%`} />
      </section>

      {/* SECTOR CHART */}
      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">
          Applications by sector
        </h2>
        <p className="mt-1 text-xs text-warm-gray">
          Within current filters.
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="sector"
                tick={{ fontSize: 11, fill: "#4b5563" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#4b5563" }}
                allowDecimals={false}
              />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {sectorChart.map((row) => (
                  <Cell key={row.key} fill={SECTOR_COLORS[row.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* LPA TALLY */}
      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">
          Most active local planning authorities
        </h2>
        <p className="mt-1 text-xs text-warm-gray">
          Which councils are handling the bulk of the activity under your
          current filters. A shortlist for sales coverage, content targeting
          and committee tracking.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-warm-gray border-b border-navy/10">
                <th className="py-2 pr-4">LPA</th>
                <th className="py-2 pr-4">Sectors</th>
                <th className="py-2 pr-4 text-right">Apps</th>
              </tr>
            </thead>
            <tbody>
              {lpaTally.slice(0, 15).map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-navy/5 last:border-0"
                >
                  <td className="py-2 pr-4 text-navy">{row.name}</td>
                  <td className="py-2 pr-4 text-warm-gray text-xs">
                    {row.sectors.map((s) => SECTOR_LABELS[s]).join(", ")}
                  </td>
                  <td className="py-2 pr-4 text-right font-semibold tabular-nums">
                    {row.count}
                  </td>
                </tr>
              ))}
              {lpaTally.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-warm-gray">
                    No applications match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* APPLICANTS — only when we have any */}
      {applicantTally.length > 0 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">
            Applicants we&apos;ve identified
          </h2>
          <p className="mt-1 text-xs text-warm-gray">
            Applicant detail is sparse in the current open-data sources — most
            entries don&apos;t carry it. Where we have a named applicant, it&apos;s
            shown here. Coverage will grow as we add direct LPA-portal feeds.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-warm-gray border-b border-navy/10">
                  <th className="py-2 pr-4">Applicant</th>
                  <th className="py-2 pr-4">Sectors</th>
                  <th className="py-2 pr-4 text-right">Apps</th>
                </tr>
              </thead>
              <tbody>
                {applicantTally.slice(0, 15).map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-navy/5 last:border-0"
                  >
                    <td className="py-2 pr-4 text-navy">{row.name}</td>
                    <td className="py-2 pr-4 text-warm-gray text-xs">
                      {row.sectors.map((s) => SECTOR_LABELS[s]).join(", ")}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold tabular-nums">
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* APPLICATION LIST */}
      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-navy">
              Applications ({filtered.length})
            </h2>
            {filtered.length > MAX_LIST_RENDER && (
              <p className="mt-1 text-xs text-warm-gray">
                Showing the {MAX_LIST_RENDER} most recent. Narrow your filters
                to see the rest, or export the full filtered set as CSV.
              </p>
            )}
          </div>
          {filtered.length > 0 && (
            <button
              onClick={() => downloadCsv(filtered)}
              className="rounded-full bg-navy/5 hover:bg-navy/10 px-3 py-1.5 text-[11px] font-semibold text-navy"
            >
              ↓ Download CSV ({filtered.length})
            </button>
          )}
        </div>
        <div className="mt-4 divide-y divide-navy/5">
          {filtered
            .slice()
            .sort((a, b) => b.decisionDate.localeCompare(a.decisionDate))
            .slice(0, MAX_LIST_RENDER)
            .map((a) => (
              <ApplicationRow key={a.id} app={a} />
            ))}
        </div>
      </section>
    </div>
  );
}

// ============================================================
// CONDITIONS TAB
// ============================================================

function ConditionsTab() {
  const [types, setTypes] = useState<ConditionType[]>(["noise"]);
  const [sectors, setSectors] = useState<Sector[]>([...SECTORS]);
  const [openId, setOpenId] = useState<string | null>(null);

  const totalConditions = useMemo(
    () => APPLICATIONS.reduce((n, a) => n + a.conditions.length, 0),
    []
  );

  const hits = useMemo<ConditionHit[]>(() => {
    const out: ConditionHit[] = [];
    for (const a of APPLICATIONS) {
      if (!sectors.includes(a.sector)) continue;
      for (const c of a.conditions) {
        if (types.length === 0 || types.includes(c.type)) {
          out.push({ application: a, condition: c });
        }
      }
    }
    return out.sort((x, y) =>
      y.application.decisionDate.localeCompare(x.application.decisionDate)
    );
  }, [types, sectors]);

  const openApp = useMemo(
    () => (openId ? APPLICATIONS.find((a) => a.id === openId) ?? null : null),
    [openId]
  );

  // Condition type prevalence — what % of analysed applications carry each
  // condition type, across the *whole* dataset (sector filter doesn't change
  // the headline — we want a stable "across all decisions, this is how
  // often noise comes up" stat). Declared above the early return so hooks
  // are called in the same order on every render.
  const conditionPrevalence = useMemo(() => {
    const appsWithConditions = APPLICATIONS.filter((a) => a.conditions.length > 0);
    const totalApps = appsWithConditions.length;
    if (totalApps === 0) return [] as Array<{ type: ConditionType; count: number; pct: number }>;
    return CONDITION_TYPES.map((t) => {
      const count = appsWithConditions.filter((a) =>
        a.conditions.some((c) => c.type === t)
      ).length;
      return {
        type: t,
        count,
        pct: Math.round((100 * count) / totalApps),
      };
    })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);
  }, []);
  const appsWithConditionsCount = useMemo(
    () => APPLICATIONS.filter((a) => a.conditions.length > 0).length,
    []
  );

  // Feature pre-launch state: no decision notices have been processed yet, so
  // the dataset has zero conditions across all applications. Show a value-
  // led teaser instead of an empty table.
  if (totalConditions === 0) {
    return (
      <section className="rounded-3xl bg-white border border-navy/10 p-8 md:p-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
          Coming soon
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-navy leading-tight max-w-2xl">
          The conditions LPAs are actually imposing, searchable by the thing
          you sell.
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-warm-gray leading-relaxed">
          We&apos;re reading every decision notice we can lay hands on with
          Claude and tagging every condition by type: noise, ecology,
          biodiversity net gain, transport, lighting, hours, drainage, air
          quality, daylight, fire, materials, S106, heritage. The result is a
          search engine for &quot;which schemes need my product or my advice?&quot;
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3 max-w-3xl">
          <ConditionTeaser
            label="Acoustic / noise"
            body="Plant noise limits, BS4142, generator testing hours."
          />
          <ConditionTeaser
            label="Air quality"
            body="Construction dust, CHP exhausts, kitchen extracts, AQ Neutral."
          />
          <ConditionTeaser
            label="Biodiversity Net Gain"
            body="10%+ BNG via on-site or off-site units, S106-secured."
          />
          <ConditionTeaser
            label="Daylight / sunlight"
            body="BRE Guide, classroom BB101, overshadowing of neighbours."
          />
          <ConditionTeaser
            label="Fire safety"
            body="External wall builds, helipad fire, M&E fire strategy."
          />
          <ConditionTeaser
            label="Materials"
            body="Cladding sample panels, façade approval, finishes."
          />
        </div>
        <p className="mt-6 max-w-2xl text-xs text-warm-gray/70">
          Rolling out first to data centres, BTR/PBSA, healthcare and
          renewables. Want early access for your sector?{" "}
          <a
            href="mailto:hello@fabrick.agency?subject=Planning%20Explorer%20-%20Conditions%20access"
            className="text-teal underline underline-offset-2 hover:text-teal-dark"
          >
            Email us
          </a>
          .
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* CONDITION-TYPE PREVALENCE */}
      {conditionPrevalence.length > 0 && (
        <section className="rounded-2xl border border-navy/10 bg-white p-5">
          <h2 className="text-sm font-semibold text-navy">
            What conditions are LPAs imposing?
          </h2>
          <p className="mt-1 text-xs text-warm-gray">
            Share of the {appsWithConditionsCount} analysed decisions that
            carry each condition type. Sortable proxy for &quot;where is my
            discipline most needed?&quot;
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {conditionPrevalence.map((row) => (
              <div
                key={row.type}
                className="flex items-center gap-3 rounded-lg bg-cream/40 p-2 pr-3"
              >
                <div className="flex h-8 w-12 items-center justify-center rounded bg-teal/15 text-[11px] font-semibold tabular-nums text-teal-dark">
                  {row.pct}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-navy truncate">
                    {CONDITION_LABELS[row.type]}
                  </p>
                  <p className="text-[10px] text-warm-gray">
                    {row.count} of {appsWithConditionsCount} decisions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FILTERS */}
      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
          What are you looking for?
        </h2>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray/80 mb-2">
            Condition type
          </p>
          <div className="flex flex-wrap gap-2">
            {CONDITION_TYPES.map((t) => (
              <Chip
                key={t}
                active={types.includes(t)}
                onClick={() =>
                  setTypes((cur) =>
                    cur.includes(t)
                      ? cur.filter((x) => x !== t)
                      : [...cur, t]
                  )
                }
                label={CONDITION_LABELS[t]}
              />
            ))}
          </div>
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
      </section>

      <section className="rounded-2xl border border-navy/10 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">
          {hits.length} condition{hits.length === 1 ? "" : "s"} found
        </h2>
        <p className="mt-1 text-xs text-warm-gray">
          Each row is one condition attached to one decision notice. Click a
          row for the full wording and the application details.
          {hits.length > MAX_LIST_RENDER && (
            <>
              {" "}Showing the {MAX_LIST_RENDER} most recent — narrow the
              filters to see the rest.
            </>
          )}
        </p>

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
                  {application.applicant} · {application.lpa} ·{" "}
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
              No conditions match those filters. Try selecting more condition
              types.
            </p>
          )}
        </div>
      </section>

      {openApp && (
        <ApplicationDrawer
          app={openApp}
          highlightTypes={types}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function AudienceCard({
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

function HowToCard({
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

function csvEscape(v: string | number | undefined): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(apps: Application[]) {
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

function ConditionTeaser({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl bg-cream/60 p-4 border border-navy/5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-dark">
        {label}
      </p>
      <p className="mt-1.5 text-xs text-warm-gray leading-relaxed">{body}</p>
    </div>
  );
}

function FilterGroup({
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

function Chip({
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

function Kpi({ label, value }: { label: string; value: string }) {
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

function SourceBadge({ source }: { source: Application["source"] }) {
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

function ApplicationRow({ app }: { app: Application }) {
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

function ApplicationDrawer({
  app,
  highlightTypes,
  onClose,
}: {
  app: Application;
  highlightTypes: ConditionType[];
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
                const highlighted = highlightTypes.includes(c.type);
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
