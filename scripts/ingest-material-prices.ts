/**
 * Material prices ingestion script.
 *
 * Replaces the hand-transcribed snapshot in
 * src/app/api/material-prices/route.ts with an automated monthly pull from
 * DBT's "Building Materials and Components Statistics" release.
 *
 * Pipeline:
 *   1. Discover the latest release via the gov.uk content API. Walk back from
 *      the current month up to 6 months until a 200 is returned.
 *   2. Pull the .xlsx attachment URL from the content API response (no HTML
 *      scraping needed - the content API exposes attachment metadata).
 *   3. Download the xlsx, parse Sheet "2" (Table 2: Monthly PPI of construction
 *      materials).
 *   4. Map the 28 indices we already track (by DBT name) into our snapshot
 *      shape, skip confidential rows ([c]).
 *   5. Write src/data/material-prices-snapshot.json.
 *
 * Run with:   npx tsx scripts/ingest-material-prices.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";

const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "src", "data", "material-prices-snapshot.json");

// ---------------------------------------------------------------------------
// Types matching src/app/api/material-prices/route.ts
// ---------------------------------------------------------------------------

type Trend = "up" | "down" | "stable";

interface MaterialPriceEntry {
  id: string;
  name: string;
  category: string;
  currentIndex: number;
  previousMonthIndex: number;
  yearAgoIndex: number;
  momChange: number;
  yoyChange: number;
  trend: Trend;
  unit: string;
  sparkline: number[];
  sparklineLabels: string[];
}

interface SourceInfo {
  name: string;
  publisher: string;
  url: string;
  releaseDate: string;
  dataPeriod: string;
  indexBase: string;
  nextRelease: string;
  note?: string;
}

interface Snapshot {
  generatedAt: string;
  source: SourceInfo;
  materials: MaterialPriceEntry[];
}

// ---------------------------------------------------------------------------
// Mapping: existing 28 IDs -> DBT row name (column "Index" in sheet "2")
// IDs and display names match what the dashboard widgets and ICE-database
// lookups in MaterialPricesAnalysis.tsx already expect, so we keep them stable.
// DBT names are the values that appear in the xlsx column B. Normalised
// (lowercase, whitespace-collapsed) for matching.
// ---------------------------------------------------------------------------

interface MaterialMap {
  id: string;
  displayName: string;
  category: string;
  dbtName: string;
}

const MATERIAL_MAP: MaterialMap[] = [
  // Metals
  { id: "structural-steel", displayName: "Fabricated structural steel", category: "Metals", dbtName: "Fabricated structural steel" },
  { id: "metal-doors-windows", displayName: "Metal doors & windows", category: "Metals", dbtName: "Metal doors and windows" },
  { id: "taps-valves", displayName: "Taps & valves (sanitaryware)", category: "Metals", dbtName: "Taps and valves for sanitaryware" },
  { id: "screws-fixings", displayName: "Screws & fixings", category: "Metals", dbtName: "Screws etc" },
  { id: "central-heating-boilers", displayName: "Central heating boilers", category: "Metals", dbtName: "Central heating boilers" },
  { id: "metal-sanitaryware", displayName: "Metal sanitaryware", category: "Metals", dbtName: "Metal sanitaryware" },
  { id: "builders-ironmongery", displayName: "Builders' ironmongery", category: "Metals", dbtName: "Other builders' ironmongery" },

  // Cement & Concrete
  { id: "precast-concrete", displayName: "Pre-cast concrete products", category: "Cement & Concrete", dbtName: "Pre-cast concrete products" },
  { id: "concrete-blocks-bricks", displayName: "Concrete blocks, bricks & flagstones", category: "Cement & Concrete", dbtName: "Precast concrete: blocks, bricks, tiles and flagstones" },
  { id: "readymix-concrete", displayName: "Ready-mixed concrete", category: "Cement & Concrete", dbtName: "Ready-mixed concrete" },
  { id: "cement", displayName: "Cement", category: "Cement & Concrete", dbtName: "Cement" },
  { id: "rebar-steel", displayName: "Reinforcing bar (rebar steel)", category: "Cement & Concrete", dbtName: "Concrete reinforcing bars (steel)" },

  // Aggregates
  { id: "sand-gravel-incl-levy", displayName: "Sand & gravel (incl. aggregate levy)", category: "Aggregates", dbtName: "Gravel, Sand, Clays and Kaolin - incl Aggregate Levy" },
  { id: "sand-gravel-excl-levy", displayName: "Sand & gravel (excl. aggregate levy)", category: "Aggregates", dbtName: "Gravel, Sand, Clays and Kaolin - exc Aggregate Levy" },
  { id: "asphalt-bituminous", displayName: "Bituminous mixtures (asphalt)", category: "Aggregates", dbtName: "Bituminous Mixtures based on Natural and Artificial Stone" },

  // Timber
  { id: "softwood-imported", displayName: "Imported sawn/planed timber", category: "Timber", dbtName: "Imported sawn or planed wood" },
  { id: "timber-doors-windows", displayName: "Timber doors & windows", category: "Timber", dbtName: "Builders woodwork: doors and windows" },
  { id: "builders-woodwork", displayName: "Builders' woodwork", category: "Timber", dbtName: "Builders woodwork" },
  { id: "plywood-imported", displayName: "Imported plywood", category: "Timber", dbtName: "Imported plywood" },

  // Plastics
  { id: "plastic-doors-windows", displayName: "Plastic doors & windows", category: "Plastics", dbtName: "Plastic doors and windows" },
  { id: "plastic-sanitaryware", displayName: "Plastic sanitaryware", category: "Plastics", dbtName: "Plastic sanitaryware" },
  { id: "plastic-pipes-flexible", displayName: "Plastic pipes (flexible)", category: "Plastics", dbtName: "Pipes and fittings (flexible)" },
  { id: "plastic-pipes-rigid", displayName: "Plastic pipes (rigid)", category: "Plastics", dbtName: "Pipes and fittings (rigid)" },

  // Other
  { id: "electric-water-heaters", displayName: "Electric water heaters", category: "Other", dbtName: "Electric water heaters" },
  { id: "paint-solvent", displayName: "Paint (solvent-based)", category: "Other", dbtName: "Paint (non-aqueous)" },
  { id: "paint-water", displayName: "Paint (water-based)", category: "Other", dbtName: "Paint (aqueous)" },
  { id: "insulation", displayName: "Insulation (thermal & acoustic)", category: "Other", dbtName: "Insulating materials (thermal or acoustic)" },
  { id: "kitchen-furniture", displayName: "Kitchen furniture", category: "Other", dbtName: "Kitchen furniture" },
];

// ---------------------------------------------------------------------------
// Discovery: walk back through months looking for a published release
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface ContentApiAttachment {
  content_type?: string;
  url?: string;
  filename?: string;
}

interface ContentApiResponse {
  title?: string;
  first_published_at?: string;
  details?: {
    attachments?: ContentApiAttachment[];
  };
}

interface DiscoveredRelease {
  monthIndex: number; // 0-11
  year: number;
  monthLabel: string; // "March"
  pageUrl: string;
  xlsxUrl: string;
  publishedAt: string; // ISO
  title: string;
}

async function discoverLatestRelease(): Promise<DiscoveredRelease> {
  const now = new Date();
  let m = now.getUTCMonth();
  let y = now.getUTCFullYear();

  // Walk back up to 6 months. DBT publishes about a month after the data
  // period (e.g. March 2026 release published 8 April 2026).
  for (let i = 0; i < 6; i++) {
    const slug = MONTH_NAMES[m];
    const pageUrl = `https://www.gov.uk/government/statistics/building-materials-and-components-statistics-${slug}-${y}`;
    const apiUrl = `https://www.gov.uk/api/content/government/statistics/building-materials-and-components-statistics-${slug}-${y}`;

    try {
      const res = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as ContentApiResponse;
        const attachments = data?.details?.attachments ?? [];
        const xlsxAttachment = attachments.find(
          (a) =>
            a.content_type ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            (typeof a.url === "string" && a.url.toLowerCase().endsWith(".xlsx"))
        );
        if (!xlsxAttachment?.url) {
          throw new Error(
            `Found ${slug} ${y} release but no .xlsx attachment in content API`
          );
        }
        return {
          monthIndex: m,
          year: y,
          monthLabel: MONTH_LABELS[m],
          pageUrl,
          xlsxUrl: xlsxAttachment.url,
          publishedAt: data.first_published_at ?? "",
          title: data.title ?? `Building materials and components statistics: ${MONTH_LABELS[m]} ${y}`,
        };
      }
      // 404 etc - step back another month
    } catch (err) {
      // Network issue at this step shouldn't kill discovery if a later month
      // works, but log it
      console.warn(
        `  discovery: ${slug} ${y} fetch error - ${err instanceof Error ? err.message : String(err)}`
      );
    }

    m -= 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
  }

  throw new Error(
    "No DBT 'Building materials and components statistics' release found in the last 6 months. The slug pattern may have changed."
  );
}

// ---------------------------------------------------------------------------
// XLSX parsing
// ---------------------------------------------------------------------------

interface ParsedRow {
  category: string;
  name: string;
  values: { label: string; value: number | null }[]; // chronological, 13 entries
}

interface ParsedTable {
  rows: ParsedRow[];
  monthLabels: string[]; // chronological, e.g. ["Feb 2025", ..., "Feb 2026"]
}

function parseTable2(xlsxBuf: ArrayBuffer): ParsedTable {
  const wb = XLSX.read(new Uint8Array(xlsxBuf), { type: "array" });
  const ws = wb.Sheets["2"];
  if (!ws) {
    throw new Error("Sheet '2' (Table 2 - Monthly PPI) not found in workbook");
  }
  const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: false,
    blankrows: true,
  });

  // Locate the header row. Expected shape:
  // ["Category", "Index", "Code", "Rating [note 4]", <month labels...>]
  let headerIdx = -1;
  for (let i = 0; i < Math.min(grid.length, 30); i++) {
    const row = grid[i];
    if (
      Array.isArray(row) &&
      typeof row[0] === "string" &&
      row[0].trim().toLowerCase() === "category" &&
      typeof row[1] === "string" &&
      row[1].trim().toLowerCase() === "index"
    ) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 0) {
    throw new Error(
      "Could not locate header row (Category | Index | Code | Rating | <months>) in sheet '2'"
    );
  }

  const headerRow = grid[headerIdx] as unknown[];
  // Month columns start at index 4 ("Rating" is column 3).
  const monthLabelsRaw = headerRow.slice(4).map((c) => (typeof c === "string" ? c.trim() : ""));
  const monthLabels = monthLabelsRaw
    .map((label) => label.replace(/\s*\[p\]\s*$/i, "").trim())
    .filter((l) => l.length > 0);

  if (monthLabels.length < 6) {
    throw new Error(
      `Expected at least 6 monthly columns in Table 2, found ${monthLabels.length}: ${monthLabelsRaw.join(" | ")}`
    );
  }

  const rows: ParsedRow[] = [];
  for (let i = headerIdx + 1; i < grid.length; i++) {
    const r = grid[i];
    if (!Array.isArray(r) || r.length === 0) continue;
    const cat = typeof r[0] === "string" ? r[0].trim() : "";
    const name = typeof r[1] === "string" ? r[1].trim() : "";
    if (!cat || !name) continue;

    const values: { label: string; value: number | null }[] = [];
    for (let j = 0; j < monthLabels.length; j++) {
      const raw = r[4 + j];
      if (raw == null || raw === "" || (typeof raw === "string" && raw.trim() === "[c]")) {
        values.push({ label: monthLabels[j], value: null });
      } else {
        const n = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/,/g, ""));
        values.push({ label: monthLabels[j], value: Number.isFinite(n) ? n : null });
      }
    }
    rows.push({ category: cat, name, values });
  }
  return { rows, monthLabels };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normaliseName(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function findRow(rows: ParsedRow[], dbtName: string): ParsedRow | undefined {
  const target = normaliseName(dbtName);
  return rows.find((r) => normaliseName(r.name) === target);
}

function deriveTrend(momChange: number): Trend {
  if (momChange > 1) return "up";
  if (momChange < -1) return "down";
  return "stable";
}

function shortMonth(label: string): string {
  // "Jan 2026" -> "Jan", "January 2026" -> "Jan"
  const head = label.split(/\s+/)[0] ?? label;
  return head.slice(0, 3);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function nextReleaseEstimate(currentMonthIdx: number, currentYear: number): string {
  // The publication slug month is the release name (e.g. "march-2026"), and
  // historically that bulletin is published early in the FOLLOWING month
  // (March 2026 release was published 8 April 2026). So the next bulletin
  // - the "april-2026" release - is expected early May. That is two months
  // after the current slug month.
  const target = (currentMonthIdx + 2) % 12;
  const yearShift = currentMonthIdx + 2 >= 12 ? 1 : 0;
  return `Early ${MONTH_LABELS[target]} ${currentYear + yearShift}`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Discovering latest DBT release...");
  const release = await discoverLatestRelease();
  console.log(
    `  found: ${release.title}\n  page:  ${release.pageUrl}\n  xlsx:  ${release.xlsxUrl}\n  pub:   ${release.publishedAt}`
  );

  console.log("Downloading xlsx...");
  const dlRes = await fetch(release.xlsxUrl);
  if (!dlRes.ok) {
    throw new Error(`xlsx download failed: HTTP ${dlRes.status}`);
  }
  const buf = await dlRes.arrayBuffer();
  console.log(`  ${(buf.byteLength / 1024).toFixed(0)} KB`);

  console.log("Parsing Table 2...");
  const parsed = parseTable2(buf);
  console.log(
    `  ${parsed.rows.length} data rows, ${parsed.monthLabels.length} monthly columns (${parsed.monthLabels[0]} -> ${parsed.monthLabels[parsed.monthLabels.length - 1]})`
  );

  // Latest column = data period of the release. We need at least 13 monthly
  // columns to compute year-on-year. The DBT sheet provides 13.
  const months = parsed.monthLabels;
  const lastIdx = months.length - 1;
  const prevIdx = lastIdx - 1;
  const yearAgoIdx = lastIdx - 12;

  if (yearAgoIdx < 0) {
    throw new Error(
      `Not enough monthly columns to compute year-on-year (need 13, found ${months.length})`
    );
  }

  const sparkStart = lastIdx - 5; // 6 values, oldest -> newest
  if (sparkStart < 0) {
    throw new Error(
      `Not enough monthly columns to build a 6-month sparkline (need 6, found ${months.length})`
    );
  }

  const materials: MaterialPriceEntry[] = [];
  const missing: string[] = [];

  for (const m of MATERIAL_MAP) {
    const row = findRow(parsed.rows, m.dbtName);
    if (!row) {
      missing.push(`${m.id} (${m.dbtName})`);
      continue;
    }

    const cur = row.values[lastIdx]?.value;
    const prev = row.values[prevIdx]?.value;
    const ya = row.values[yearAgoIdx]?.value;

    if (cur == null || prev == null || ya == null) {
      // Confidential or missing in the most recent reference points - skip
      // (matches manual snapshot policy of dropping [c] rows).
      console.warn(
        `  skipping ${m.id} - missing/confidential values (cur=${cur}, prev=${prev}, ya=${ya})`
      );
      continue;
    }

    const sparkSlice = row.values.slice(sparkStart, lastIdx + 1);
    if (sparkSlice.some((v) => v.value == null)) {
      console.warn(`  skipping ${m.id} - confidential value in 6-month sparkline window`);
      continue;
    }

    const sparkline = sparkSlice.map((v) => round1(v.value as number));
    const sparklineLabels = sparkSlice.map((v) => shortMonth(v.label));

    const momChange = round1(((cur - prev) / prev) * 100);
    const yoyChange = round1(((cur - ya) / ya) * 100);

    materials.push({
      id: m.id,
      name: m.displayName,
      category: m.category,
      currentIndex: round1(cur),
      previousMonthIndex: round1(prev),
      yearAgoIndex: round1(ya),
      momChange,
      yoyChange,
      trend: deriveTrend(momChange),
      unit: "Index (2015=100)",
      sparkline,
      sparklineLabels,
    });
  }

  if (missing.length > 0) {
    throw new Error(
      `DBT row not found for ${missing.length} material(s): ${missing.join(", ")}. The publication's row labels may have changed.`
    );
  }

  if (materials.length < 20) {
    throw new Error(
      `Only ${materials.length} materials parsed; expected ~28. Aborting rather than write a partial snapshot.`
    );
  }

  const dataPeriodLabel = months[lastIdx]; // e.g. "Feb 2026"
  const releaseDateIso = release.publishedAt
    ? release.publishedAt.slice(0, 10)
    : "";

  // Use the release's publish timestamp for `generatedAt` so the script is
  // idempotent. Re-running against the same DBT release produces the same
  // bytes; only a new release will change the file.
  const generatedAt = release.publishedAt
    ? new Date(release.publishedAt).toISOString()
    : new Date().toISOString();

  const snapshot: Snapshot = {
    generatedAt,
    source: {
      name: "Building Materials and Components Statistics",
      publisher: "Department for Business and Trade (DBT)",
      url: release.pageUrl,
      releaseDate: releaseDateIso,
      dataPeriod: dataPeriodLabel,
      indexBase: "2015 = 100",
      nextRelease: nextReleaseEstimate(release.monthIndex, release.year),
      note: "Auto-ingested from Table 2 (Monthly PPI of construction materials) of the DBT Excel attachment. Confidential indices ([c] in source) excluded.",
    },
    materials,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(
    `  ${materials.length} materials, data period ${dataPeriodLabel}, release ${releaseDateIso || "(unknown)"}`
  );
}

main().catch((err) => {
  console.error("\nINGEST FAILED:", err instanceof Error ? err.message : err);
  process.exit(1);
});
