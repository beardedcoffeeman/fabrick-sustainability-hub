/**
 * Construction output ingestion script.
 *
 * Replaces the live calls to the ONS "beta" CMD API in
 * src/app/api/construction-output/route.ts. That API stopped being updated
 * for this dataset in May 2026 (latest version 54, data to March 2026), which
 * left the dashboard returning 502 "No recent ONS construction data" from
 * August 2026 onwards.
 *
 * Source now: the reference-table workbook published alongside the monthly
 * ONS "Construction output in Great Britain" bulletin:
 *   https://www.ons.gov.uk/businessindustryandtrade/constructionindustry/datasets/outputintheconstructionindustry
 *   file: .../outputintheconstructionindustry/current/bulletindataset2.xlsx
 *
 * Table 2a = volume, seasonally adjusted, chained volume measures, GBP million,
 * by sector, monthly from Jan 2010. Every column carries an ONS dataset
 * identifier code (CDID) in the row under the header, which we keep in the
 * snapshot so the source is traceable.
 *
 * Output: src/data/construction-output-snapshot.json
 *
 * Run with:   npx tsx scripts/ingest-construction-output.ts
 *
 * Idempotent: generatedAt is derived from the workbook's "Released" date, so
 * re-running against the same release produces identical bytes.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";

const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(
  ROOT,
  "src",
  "data",
  "construction-output-snapshot.json"
);

const DATASET_PAGE =
  "https://www.ons.gov.uk/businessindustryandtrade/constructionindustry/datasets/outputintheconstructionindustry";
const WORKBOOK_URL =
  "https://www.ons.gov.uk/file?uri=/businessindustryandtrade/constructionindustry/datasets/outputintheconstructionindustry/current/bulletindataset2.xlsx";

// Keep the last N months of every series in the snapshot. 36 gives three
// years of trend for the dashboard without bloating the bundle.
const KEEP_MONTHS = 36;

// Column labels in Table 2a -> the keys the API route and widget expect.
// The labels are matched after whitespace/case normalisation.
const SERIES: Array<{ key: string; label: string; name: string }> = [
  { key: "allWork", label: "All work", name: "All work" },
  { key: "allNewWork", label: "All new work", name: "All new work" },
  { key: "allRepairMaintenance", label: "All R&M", name: "All repair & maintenance" },
  { key: "totalNewHousing", label: "Total new housing", name: "Total new housing" },
  { key: "publicNewHousing", label: "Public new housing", name: "Public Housing (New)" },
  { key: "privateNewHousing", label: "Private new housing", name: "Private Housing (New)" },
  { key: "infrastructureNewWork", label: "Infrastructure new work", name: "Infrastructure" },
  { key: "publicOtherNewWork", label: "Public other new work", name: "Public Other" },
  { key: "privateIndustrialNewWork", label: "Private industrial new work", name: "Industrial" },
  { key: "privateCommercialNewWork", label: "Private commercial new work", name: "Commercial" },
  { key: "totalHousingRM", label: "Total housing R&M", name: "Housing repair & maintenance" },
  { key: "nonHousingRM", label: "Non housing R&M", name: "Non-housing repair & maintenance" },
];

export interface SeriesSnapshot {
  key: string;
  name: string;
  cdid: string;
  /** Chronological, oldest first, KEEP_MONTHS entries at most. */
  values: Array<{ period: string; periodKey: string; value: number | null }>;
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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function norm(s: unknown): string {
  return String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

function parseNumber(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const n =
    typeof raw === "number" ? raw : parseFloat(String(raw).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** "Jul 2026" -> "2026-jul" (same key shape the old ONS beta route used). */
function periodKey(label: string): string {
  const [mon, year] = label.split(/\s+/);
  return `${year}-${mon.toLowerCase()}`;
}

/** "11 September 2026" -> "2026-09-11". Returns "" if unparseable. */
function parseLongDate(s: string): string {
  const m = s.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return "";
  const idx = MONTHS.findIndex((x) => m[2].toLowerCase().startsWith(x.toLowerCase()));
  if (idx < 0) return "";
  return `${m[3]}-${String(idx + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

function readCoverSheet(wb: XLSX.WorkBook): {
  released: string;
  nextRelease: string;
  title: string;
} {
  const ws = wb.Sheets["Cover Sheet"];
  if (!ws) return { released: "", nextRelease: "", title: "" };
  const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: false });
  let released = "";
  let nextRelease = "";
  const title = String(grid[0]?.[0] ?? "");
  for (const row of grid) {
    const k = norm(row[0]);
    if (k === "released:" || k === "released") released = String(row[1] ?? "");
    if (k === "next release:" || k === "next release") nextRelease = String(row[1] ?? "");
  }
  return { released, nextRelease, title };
}

function parseTable2a(wb: XLSX.WorkBook): {
  columns: string[];
  cdids: string[];
  monthly: Array<{ label: string; values: unknown[] }>;
} {
  const ws = wb.Sheets["Table 2a"];
  if (!ws) throw new Error("Sheet 'Table 2a' not found in workbook");
  const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: false,
    blankrows: false,
  });

  let headerIdx = -1;
  for (let i = 0; i < Math.min(grid.length, 20); i++) {
    if (norm(grid[i]?.[0]) === "time period") {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) throw new Error("Could not find 'Time period' header row in Table 2a");

  const columns = (grid[headerIdx] as unknown[]).map((c) => String(c ?? "").trim());
  const cdidRow = grid[headerIdx + 1] as unknown[];
  const cdids =
    norm(cdidRow?.[0]).includes("identifier")
      ? cdidRow.map((c) => String(c ?? "").trim())
      : columns.map(() => "");

  const monthly: Array<{ label: string; values: unknown[] }> = [];
  for (let i = headerIdx + 1; i < grid.length; i++) {
    const row = grid[i] as unknown[];
    const label = String(row?.[0] ?? "").trim();
    if (/^[A-Z][a-z]{2} \d{4}$/.test(label)) {
      monthly.push({ label, values: row });
    }
  }
  if (monthly.length < 24) {
    throw new Error(`Only ${monthly.length} monthly rows found in Table 2a; expected 24+`);
  }
  return { columns, cdids, monthly };
}

async function main(): Promise<void> {
  console.log("Downloading ONS construction output workbook...");
  const res = await fetch(WORKBOOK_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PulseByFabrick/1.0)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Workbook download failed: HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  console.log(`  ${(buf.byteLength / 1024).toFixed(0)} KB`);

  const wb = XLSX.read(new Uint8Array(buf), { type: "array" });
  const cover = readCoverSheet(wb);
  console.log(`  ${cover.title}`);
  console.log(`  released: ${cover.released}  next: ${cover.nextRelease}`);

  const table = parseTable2a(wb);
  const latest = table.monthly[table.monthly.length - 1];
  console.log(
    `  Table 2a: ${table.monthly.length} monthly rows, ${table.monthly[0].label} -> ${latest.label}`
  );

  const window = table.monthly.slice(-KEEP_MONTHS);
  const series: SeriesSnapshot[] = [];
  const missing: string[] = [];
  for (const s of SERIES) {
    const col = table.columns.findIndex((c) => norm(c) === norm(s.label));
    if (col < 0) {
      missing.push(s.label);
      continue;
    }
    series.push({
      key: s.key,
      name: s.name,
      cdid: table.cdids[col] ?? "",
      values: window.map((m) => ({
        period: m.label,
        periodKey: periodKey(m.label),
        value: parseNumber(m.values[col]),
      })),
    });
  }
  if (missing.length > 0) {
    throw new Error(
      `Table 2a column(s) not found: ${missing.join(", ")}. The ONS layout may have changed.`
    );
  }

  const allWork = series.find((s) => s.key === "allWork");
  const latestValue = allWork?.values[allWork.values.length - 1]?.value;
  if (latestValue == null || latestValue < 5000) {
    throw new Error(`Latest 'All work' value looks wrong (${latestValue}); refusing to write`);
  }

  const releaseDate = parseLongDate(cover.released);
  const generatedAt = releaseDate
    ? new Date(`${releaseDate}T07:00:00Z`).toISOString()
    : new Date().toISOString();

  const snapshot: ConstructionOutputSnapshot = {
    generatedAt,
    source: {
      name: "ONS - Output in the Construction Industry",
      publisher: "Office for National Statistics",
      url: DATASET_PAGE,
      workbook: WORKBOOK_URL,
      table: "Table 2a: volume, seasonally adjusted, by sector",
      releaseDate,
      nextRelease: cover.nextRelease,
      dataPeriod: latest.label,
      unit: "GBP million, chained volume measures, seasonally adjusted",
      notes:
        "Great Britain. Chained volume measures (2023 prices), seasonally adjusted. Published monthly, roughly six weeks after the reference month. Contains public sector information licensed under the Open Government Licence v3.0.",
    },
    series,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(
    `  ${series.length} series x ${window.length} months, data period ${latest.label}, All work GBP ${latestValue.toLocaleString()}m`
  );
}

main().catch((err) => {
  console.error("\nINGEST FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
