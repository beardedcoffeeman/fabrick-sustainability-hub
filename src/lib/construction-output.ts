import snapshot from "@/data/construction-output-snapshot.json";

// ──────────────────────────────────────────────────
// ONS CONSTRUCTION OUTPUT: shared snapshot + maths
// ──────────────────────────────────────────────────
// The snapshot (src/data/construction-output-snapshot.json) is rebuilt
// monthly by scripts/ingest-construction-output.ts from Table 2a of the ONS
// "Output in the construction industry" reference workbook. Used by
// GET /api/construction-output (buildConstructionOutput, unchanged from the
// route) and by Ask Pulse (src/lib/ask), which reuses pctChange and at so the
// month-on-month and year-on-year figures match the dashboard exactly.
// ──────────────────────────────────────────────────

export interface SeriesPoint {
  period: string;
  periodKey: string;
  value: number | null;
}

export interface SeriesSnapshot {
  key: string;
  name: string;
  cdid: string;
  values: SeriesPoint[];
}

export interface ConstructionOutputSnapshot {
  generatedAt: string;
  source: {
    name: string;
    publisher: string;
    url: string;
    workbook: string;
    table: string;
    releaseDate: string;
    nextRelease: string;
    dataPeriod: string;
    unit: string;
    notes: string;
  };
  series: SeriesSnapshot[];
}

export function loadConstructionOutputSnapshot(): ConstructionOutputSnapshot {
  return snapshot as unknown as ConstructionOutputSnapshot;
}

const SECTOR_ORDER: Array<{ key: string; seriesKey: string; name: string }> = [
  { key: "privateNewHousing", seriesKey: "privateNewHousing", name: "Private Housing (New)" },
  { key: "publicNewHousing", seriesKey: "publicNewHousing", name: "Public Housing (New)" },
  { key: "infrastructure", seriesKey: "infrastructureNewWork", name: "Infrastructure" },
  { key: "commercial", seriesKey: "privateCommercialNewWork", name: "Commercial" },
  { key: "industrial", seriesKey: "privateIndustrialNewWork", name: "Industrial" },
  { key: "publicOther", seriesKey: "publicOtherNewWork", name: "Public Other" },
];

/** Percentage change from previous to current (0 when previous is 0). */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/** The value offsetFromEnd places before the last point (0 = latest), or null. */
export function at(values: SeriesPoint[], offsetFromEnd: number): number | null {
  const idx = values.length - 1 - offsetFromEnd;
  return idx >= 0 ? values[idx].value : null;
}

export function buildConstructionOutput(s: ConstructionOutputSnapshot) {
  const byKey = new Map(s.series.map((x) => [x.key, x]));
  const get = (key: string): SeriesPoint[] => byKey.get(key)?.values ?? [];

  const allWork = get("allWork");
  if (allWork.length === 0) throw new Error("snapshot has no allWork series");
  const latest = allWork[allWork.length - 1];

  const cur = latest.value;
  const prev = at(allWork, 1);
  const yearAgo = at(allWork, 12);

  const sectors = SECTOR_ORDER.map((sec) => {
    const v = get(sec.seriesKey);
    const value = at(v, 0);
    const p = at(v, 1);
    const y = at(v, 12);
    return {
      name: sec.name,
      key: sec.key,
      value,
      prev: p,
      yoy: y,
      momChange: value != null && p != null ? pctChange(value, p) : null,
      yoyChange: value != null && y != null ? pctChange(value, y) : null,
    };
  });

  const trend = allWork.slice(-12).map((pt) => ({
    month: pt.period,
    value: pt.value,
  }));

  return {
    period: latest.period,
    periodKey: latest.periodKey,
    releaseDate: s.source.releaseDate,
    nextRelease: s.source.nextRelease,
    totalOutput: {
      value: cur,
      unit: "GBP millions",
      momChange: cur != null && prev != null ? pctChange(cur, prev) : null,
      yoyChange: cur != null && yearAgo != null ? pctChange(cur, yearAgo) : null,
    },
    newWork: { value: at(get("allNewWork"), 0), unit: "GBP millions" },
    repairMaintenance: {
      value: at(get("allRepairMaintenance"), 0),
      unit: "GBP millions",
    },
    sectors,
    trend,
    history: s.series.map((x) => ({
      key: x.key,
      name: x.name,
      cdid: x.cdid,
      values: x.values,
    })),
    source: {
      name: s.source.name,
      url: s.source.url,
      api: s.source.workbook,
      table: s.source.table,
      unit: s.source.unit,
      notes: s.source.notes,
    },
    fetchedAt: new Date().toISOString(),
    snapshotGeneratedAt: s.generatedAt,
  };
}
