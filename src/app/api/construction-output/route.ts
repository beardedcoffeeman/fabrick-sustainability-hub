import { NextResponse } from "next/server";
import snapshot from "@/data/construction-output-snapshot.json";

// ──────────────────────────────────────────────────
// ONS CONSTRUCTION OUTPUT
// ──────────────────────────────────────────────────
// Served from src/data/construction-output-snapshot.json, which
// scripts/ingest-construction-output.ts rebuilds monthly from Table 2a of
// the ONS "Output in the construction industry" reference workbook
// (GitHub Action: refresh-construction-output.yml).
//
// History: until October 2026 this route called the ONS beta (CMD) API live.
// That API stopped being updated for this dataset in May 2026 (latest
// version 54, data to March 2026), so the dashboard returned 502 from
// August 2026 until the snapshot approach replaced it.
//
// The response shape is unchanged so ConstructionOutputWidget and the
// My Pulse widget keep working. `history` is new: 36 months of every series
// for richer charts.
// ──────────────────────────────────────────────────

interface SeriesPoint {
  period: string;
  periodKey: string;
  value: number | null;
}

interface SeriesSnapshot {
  key: string;
  name: string;
  cdid: string;
  values: SeriesPoint[];
}

interface Snapshot {
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

const SECTOR_ORDER: Array<{ key: string; seriesKey: string; name: string }> = [
  { key: "privateNewHousing", seriesKey: "privateNewHousing", name: "Private Housing (New)" },
  { key: "publicNewHousing", seriesKey: "publicNewHousing", name: "Public Housing (New)" },
  { key: "infrastructure", seriesKey: "infrastructureNewWork", name: "Infrastructure" },
  { key: "commercial", seriesKey: "privateCommercialNewWork", name: "Commercial" },
  { key: "industrial", seriesKey: "privateIndustrialNewWork", name: "Industrial" },
  { key: "publicOther", seriesKey: "publicOtherNewWork", name: "Public Other" },
];

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function at(values: SeriesPoint[], offsetFromEnd: number): number | null {
  const idx = values.length - 1 - offsetFromEnd;
  return idx >= 0 ? values[idx].value : null;
}

function buildResponse(s: Snapshot) {
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

// Simple in-memory cache. The snapshot only changes on deploy, so this is
// really just saving the per-request rebuild.
let cached: ReturnType<typeof buildResponse> | null = null;

export async function GET() {
  try {
    if (!cached) cached = buildResponse(snapshot as unknown as Snapshot);
    return NextResponse.json({ ...cached, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Construction output API error:", error);
    return NextResponse.json(
      { error: "Failed to load construction output data" },
      { status: 500 }
    );
  }
}
