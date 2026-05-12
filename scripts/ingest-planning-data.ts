/**
 * Ingest real UK planning applications from planning.data.gov.uk into the
 * Planning Explorer dataset.
 *
 *   tsx scripts/ingest-planning-data.ts
 *
 * Pulls two CSVs from files.planning.data.gov.uk:
 *   - planning-application.csv (~45 MB, 100k+ rows)
 *   - local-authority.csv      (~120 KB)
 *
 * Classifies each application into one of our 8 sectors by keyword-matching
 * the description. Apps that don't match any sector are dropped (the dataset
 * is dominated by small residential extensions, not our target use cases).
 *
 * Output: src/data/applications-real.json
 *
 * Note: this dataset is "alpha" phase on gov.uk — coverage varies by LPA and
 * many fields (applicant, decision, conditions) are not yet populated. We
 * accept this and surface what's present. The conditions piece is filled in
 * separately by the PDF extractor pipeline (scripts/extract-pdfs.ts).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Sector, Region, Decision } from "../src/lib/planning";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const CACHE_DIR = join(PROJECT_ROOT, ".cache", "datasets");
const OUTPUT = join(PROJECT_ROOT, "src", "data", "applications-real.json");

const PLANNING_APP_CSV =
  "https://files.planning.data.gov.uk/dataset/planning-application.csv";
const LOCAL_AUTHORITY_CSV =
  "https://files.planning.data.gov.uk/dataset/local-authority.csv";

const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ──────────────────────────────────────────────────────────────
// Sector classification
// ──────────────────────────────────────────────────────────────
// Each sector has a list of required-keyword groups. A description matches
// the sector if it contains AT LEAST ONE keyword from the list. Keywords are
// case-insensitive word-ish matches.
//
// Order matters: a description is assigned to the FIRST sector it matches in
// the order listed below. Sectors are ordered most-specific first so e.g. a
// "data centre" description never gets mis-tagged as logistics just because
// it also mentions "warehouse".
const SECTOR_KEYWORDS: Array<[Sector, string[]]> = [
  [
    "data-centre",
    ["data centre", "data center", "hyperscale", "colocation", "co-location"],
  ],
  [
    "renewable-energy",
    [
      "solar farm",
      "solar pv",
      "battery energy storage",
      "battery storage",
      "bess",
      "wind turbine",
      "wind farm",
      "anaerobic digestion",
      "energy from waste",
    ],
  ],
  [
    "btr-pbsa",
    [
      "build to rent",
      "build-to-rent",
      "btr ",
      "purpose-built student",
      "purpose built student",
      "student accommodation",
      "pbsa",
      "co-living",
    ],
  ],
  [
    "healthcare",
    [
      "hospital",
      "gp surgery",
      "health centre",
      "care home",
      "nursing home",
      "medical centre",
      "polyclinic",
      "mental health unit",
    ],
  ],
  [
    "education",
    [
      "secondary school",
      "primary school",
      "free school",
      "academy school",
      "academy trust",
      " university",
      " college ",
      "sixth form",
      "nursery school",
      "sen school",
    ],
  ],
  [
    "hotels",
    ["new hotel", "proposed hotel", "aparthotel", "apart-hotel", "hostel", "hotel development", "hotel scheme", "hotel and ", "hotel use", "use as hotel"],
  ],
  [
    "logistics",
    [
      "warehouse",
      "distribution centre",
      "distribution center",
      "logistics park",
      "logistics hub",
      "logistics unit",
      "b8 use",
      "use class b8",
      "storage and distribution",
    ],
  ],
  [
    "mixed-use",
    [
      "mixed-use",
      "mixed use",
      "town centre regeneration",
      "masterplan",
      "master plan",
    ],
  ],
];

// Application types we don't want to surface. These are usually procedural
// follow-ups to a previously-decided application (variations, discharges,
// non-material amendments) or non-substantive consents (tree work, ads,
// listed-building minor works). They contaminate sector counts because the
// description often mentions the parent scheme.
const EXCLUDE_PREFIXES = [
  "variation of",
  "removal of",
  "discharge of",
  "application to vary",
  "non-material amendment",
  "approval of details",
  "approval of reserved matters",
  "reserved matters",
  "consent to",
  "tree ",
  "trees ",
  "tpo ",
  "fell ",
  "advertisement",
  "advert ",
  "listed building consent",
  "prior notification",
  "prior approval",
  "lawful development",
  "certificate of lawful",
];

function classify(description: string): Sector | null {
  const lc = description.toLowerCase().trim();
  for (const p of EXCLUDE_PREFIXES) {
    if (lc.startsWith(p)) return null;
  }
  for (const [sector, keywords] of SECTOR_KEYWORDS) {
    for (const k of keywords) {
      if (lc.includes(k)) return sector;
    }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────
// LPA → region mapping (best-effort; unknown LPAs get "" region)
// ──────────────────────────────────────────────────────────────
const REGION_BY_LPA: Record<string, Region> = {
  // London boroughs
  "London Borough of Barking and Dagenham": "London",
  "London Borough of Barnet": "London",
  "London Borough of Bexley": "London",
  "London Borough of Brent": "London",
  "London Borough of Bromley": "London",
  "London Borough of Camden": "London",
  "London Borough of Croydon": "London",
  "London Borough of Ealing": "London",
  "London Borough of Enfield": "London",
  "Royal Borough of Greenwich": "London",
  "London Borough of Hackney": "London",
  "London Borough of Hammersmith and Fulham": "London",
  "London Borough of Haringey": "London",
  "London Borough of Harrow": "London",
  "London Borough of Havering": "London",
  "London Borough of Hillingdon": "London",
  "London Borough of Hounslow": "London",
  "London Borough of Islington": "London",
  "Royal Borough of Kensington and Chelsea": "London",
  "Royal Borough of Kingston upon Thames": "London",
  "London Borough of Lambeth": "London",
  "London Borough of Lewisham": "London",
  "London Borough of Merton": "London",
  "London Borough of Newham": "London",
  "London Borough of Redbridge": "London",
  "London Borough of Richmond upon Thames": "London",
  "London Borough of Southwark": "London",
  "London Borough of Sutton": "London",
  "London Borough of Tower Hamlets": "London",
  "London Borough of Waltham Forest": "London",
  "London Borough of Wandsworth": "London",
  "City of Westminster": "London",
  "City of London": "London",
  // South East
  "Slough Borough Council": "South East",
  "Reading Borough Council": "South East",
  "Buckinghamshire Council": "South East",
  "Oxford City Council": "South East",
  "Brighton and Hove City Council": "South East",
  "Milton Keynes Council": "South East",
  "Dover District Council": "South East",
  "Southampton City Council": "South East",
  "Portsmouth City Council": "South East",
  // East
  "Cambridge City Council": "East of England",
  "South Cambridgeshire District Council": "East of England",
  "Hertsmere Borough Council": "East of England",
  "Norwich City Council": "East of England",
  // West Midlands
  "Birmingham City Council": "West Midlands",
  "Coventry City Council": "West Midlands",
  "Wolverhampton City Council": "West Midlands",
  // East Midlands
  "Leicester City Council": "East Midlands",
  "Nottingham City Council": "East Midlands",
  "Daventry District Council": "East Midlands",
  "South Holland District Council": "East Midlands",
  // Yorkshire & Humber
  "Sheffield City Council": "Yorkshire & Humber",
  "Leeds City Council": "Yorkshire & Humber",
  "Bradford Metropolitan District Council": "Yorkshire & Humber",
  "York City Council": "Yorkshire & Humber",
  "Doncaster Council": "Yorkshire & Humber",
  // North West
  "Manchester City Council": "North West",
  "Liverpool City Council": "North West",
  "Salford City Council": "North West",
  "Trafford Council": "North West",
  // North East
  "Newcastle upon Tyne LPA": "North East",
  "Newcastle City Council": "North East",
  "Sunderland City Council": "North East",
  // Yorkshire & Humber additions
  "Doncaster Metropolitan Borough Council": "Yorkshire & Humber",
  // South East additions
  "Worthing Borough Council": "South East",
  "Adur District Council": "South East",
  // Additional South East
  "Brighton & Hove City Council": "South East",
  "Hampshire County Council": "South East",
  "Surrey County Council": "South East",
  // East of England additions
  "Watford Borough Council": "East of England",
  "Dacorum Borough Council": "East of England",
  "Three Rivers District Council": "East of England",
  "Stevenage Borough Council": "East of England",
  "North Hertfordshire District Council": "East of England",
  "East Hertfordshire District Council": "East of England",
  "Welwyn Hatfield Borough Council": "East of England",
  "St Albans City and District Council": "East of England",
  "Broxbourne Borough Council": "East of England",
};

// ──────────────────────────────────────────────────────────────
// CSV helpers
// ──────────────────────────────────────────────────────────────

async function fetchWithCache(url: string, filename: string): Promise<string> {
  await mkdir(CACHE_DIR, { recursive: true });
  const cachePath = join(CACHE_DIR, filename);
  if (existsSync(cachePath)) {
    const s = await stat(cachePath);
    if (Date.now() - s.mtimeMs < CACHE_MAX_AGE_MS) {
      console.log(`  cached: ${filename}`);
      return readFile(cachePath, "utf-8");
    }
  }
  console.log(`  downloading: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${res.status} fetching ${url}`);
  const text = await res.text();
  await writeFile(cachePath, text);
  return text;
}

// Minimal CSV parser — handles quoted fields with embedded commas and escaped
// double quotes. Sufficient for the gov.uk CSVs which are well-formed.
function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else if (c === "\r") {
        // skip
      } else {
        field += c;
      }
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...data] = rows;
  if (!header) return [];
  return data.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h] = r[idx] ?? "";
    });
    return obj;
  });
}

// ──────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────

interface OutputApplication {
  id: string;
  reference: string;
  lpa: string;
  region: Region | "";
  address: string;
  postcode: string;
  useClass: string;
  sector: Sector;
  description: string;
  applicant: string;
  agent: string;
  decision: Decision;
  decisionDate: string;
  grossFloorAreaSqm?: number;
  conditions: never[];
  source: "planning.data.gov.uk";
}

async function main() {
  console.log("Fetching gov.uk planning data CSVs...");
  const [appsCsv, laCsv] = await Promise.all([
    fetchWithCache(PLANNING_APP_CSV, "planning-application.csv"),
    fetchWithCache(LOCAL_AUTHORITY_CSV, "local-authority.csv"),
  ]);

  console.log("Parsing local-authority...");
  const laRows = parseCsv(laCsv);
  const laByEntity = new Map<string, string>();
  for (const r of laRows) {
    if (r.entity && r.name) laByEntity.set(r.entity, r.name);
  }
  console.log(`  ${laByEntity.size} LPAs in lookup`);

  console.log("Parsing planning-application...");
  const appRows = parseCsv(appsCsv);
  console.log(`  ${appRows.length} application rows`);

  const out: OutputApplication[] = [];
  const sectorCounts: Record<string, number> = {};
  const unknownLpas = new Set<string>();

  for (const r of appRows) {
    const description = (r.description ?? "").trim();
    if (!description) continue;
    const sector = classify(description);
    if (!sector) continue;

    const lpaName = laByEntity.get(r["organisation-entity"]) ?? "";
    if (!lpaName) {
      unknownLpas.add(r["organisation-entity"]);
      continue;
    }

    const region: Region | "" = REGION_BY_LPA[lpaName] ?? "";

    // The dataset does NOT include a structured decision field as of the
    // current snapshot — only a decision-date. Where a decision-date is
    // present we infer "approved" (most decisions in the register are
    // grants); UI will distinguish source="planning.data.gov.uk" vs seed
    // entries so this caveat is auditable.
    const decisionDate = r["decision-date"] ?? "";
    const decision: Decision = decisionDate ? "approved" : "pending";

    out.push({
      id: `pd-${r.entity}`,
      reference: r.reference ?? "",
      lpa: lpaName,
      region,
      address: r.name ?? "",
      postcode: "",
      useClass: "",
      sector,
      description,
      applicant: "",
      agent: "",
      decision,
      decisionDate,
      conditions: [],
      source: "planning.data.gov.uk",
    });

    sectorCounts[sector] = (sectorCounts[sector] ?? 0) + 1;
  }

  // Restrict to recent applications (last 36 months) so the demo focuses on
  // current activity rather than archive.
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 36);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const recent = out.filter((a) => !a.decisionDate || a.decisionDate >= cutoffStr);

  console.log("\nSector counts (after 36-month filter):");
  const recentCounts: Record<string, number> = {};
  for (const a of recent) recentCounts[a.sector] = (recentCounts[a.sector] ?? 0) + 1;
  for (const [s, c] of Object.entries(recentCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(20)} ${c}`);
  }
  console.log(`\nTotal: ${recent.length} applications matched`);
  console.log(
    `Skipped (no LPA name match): ${unknownLpas.size} unknown org-entity values`
  );

  await writeFile(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "planning.data.gov.uk",
        note: "Real planning applications ingested from the UK government open data service. Decision is inferred as 'approved' where a decision-date is present, 'pending' otherwise. Conditions are not in this dataset and are filled in separately by the PDF extractor.",
        applications: recent,
      },
      null,
      2
    )
  );
  console.log(`\nWrote ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
