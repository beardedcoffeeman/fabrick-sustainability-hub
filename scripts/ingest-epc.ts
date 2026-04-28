/**
 * EPC retrofit-market ingestion script.
 *
 * Builds a per-city snapshot of domestic EPC band distributions from the
 * MHCLG "Get Energy Performance of Buildings" register (England + Wales).
 *
 * Why this exists:
 *   - The MHCLG search endpoint requires a FULL postcode (M1, SW19 etc are
 *     rejected with HTTP 400). Confirmed 28 Apr 2026.
 *   - There is no aggregate / distribution / per-LA endpoint on the new API.
 *   - The legacy epc.opendatacommunities.org service is being retired
 *     30 May 2026 and gates bulk downloads behind a manual sign-up flow.
 *
 * Approach:
 *   - Curate ~30 UK cities with 8-12 representative residential postcodes each.
 *   - Hit the search endpoint with page_size=500 per postcode.
 *   - Dedupe by UPRN, count bands per city, write to src/data/epc-snapshot.json.
 *
 * Run with:   npx tsx scripts/ingest-epc.ts
 *
 * Reads EPC_API_TOKEN from .env.local (or process.env).
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");
const OUT_FILE = path.join(ROOT, "src", "data", "epc-snapshot.json");

// ---------------------------------------------------------------------------
// Env loader (no dotenv dependency)
// ---------------------------------------------------------------------------

function loadEnv(): void {
  if (!fs.existsSync(ENV_FILE)) return;
  const raw = fs.readFileSync(ENV_FILE, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const TOKEN = process.env.EPC_API_TOKEN;
if (!TOKEN) {
  console.error("EPC_API_TOKEN not set in .env.local");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// City -> representative residential postcodes.
// Postcodes were chosen to cover residential outcodes across the city, not
// the city centre BX (which is often commercial / has no domestic certs).
// ---------------------------------------------------------------------------

interface CitySpec {
  city: string;
  region: string;
  postcodes: string[];
}

const CITY_SEEDS: CitySpec[] = [
  {
    city: "London (Inner)",
    region: "Greater London",
    postcodes: [
      "E1 6AN", "E2 7DG", "E14 9TX", "N1 8AS", "N7 8DJ",
      "SE1 7TY", "SE15 4DU", "SW9 0NS", "SW19 1HQ", "W2 1JU",
      "W11 1AA", "NW1 8AB",
    ],
  },
  {
    city: "London (Outer)",
    region: "Greater London",
    postcodes: [
      "BR1 1NN", "CR0 1XP", "UB1 1ED", "TW3 1NL", "HA1 2EX",
      "EN1 1XQ", "IG1 1NN", "RM1 3BB", "DA1 1AT", "KT1 1EE",
    ],
  },
  {
    city: "Birmingham",
    region: "West Midlands",
    postcodes: [
      "B14 7BL", "B23 7SH", "B14 6HE", "B29 6JS", "B17 8RG",
      "B30 2DT", "B31 1RA", "B33 8RS", "B44 8LH", "B27 6PF",
    ],
  },
  {
    city: "Manchester",
    region: "North West",
    postcodes: [
      "M14 5AB", "M21 9GG", "M3 4LZ", "M19 2QH", "M20 4UJ",
      "M22 4SA", "M8 0RJ", "M9 5XW", "M40 7DA", "M11 1HQ",
    ],
  },
  {
    city: "Leeds",
    region: "Yorkshire",
    postcodes: [
      "LS6 1AB", "LS11 5DT", "LS17 5LF", "LS8 1ND", "LS12 4PG",
      "LS15 8AA", "LS16 7BG", "LS19 7DG", "LS27 9AA", "LS28 9DT",
    ],
  },
  {
    city: "Sheffield",
    region: "Yorkshire",
    postcodes: [
      "S11 8FL", "S7 1NX", "S10 3GE", "S8 0QH", "S6 3WF",
      "S5 6AA", "S12 2AA", "S13 9AA", "S35 9AA", "S20 7AA",
    ],
  },
  {
    city: "Liverpool",
    region: "North West",
    postcodes: [
      "L18 1HA", "L25 0LJ", "L17 4LE", "L15 4LG", "L19 9BS",
      "L13 0DL", "L4 9XW", "L6 7UN", "L11 9DR", "L12 7HQ",
    ],
  },
  {
    city: "Newcastle upon Tyne",
    region: "North East",
    postcodes: [
      "NE3 1DJ", "NE2 4AA", "NE15 6AA", "NE5 1DL", "NE6 4AA",
      "NE7 7BB", "NE13 6AA", "NE12 9AA", "NE4 9AA", "NE16 4AA",
    ],
  },
  {
    city: "Bristol",
    region: "South West",
    postcodes: [
      "BS3 4UQ", "BS5 7AA", "BS6 6JN", "BS7 9XS", "BS9 1AA",
      "BS10 7AA", "BS13 8AA", "BS14 9AA", "BS16 1AA", "BS4 5AA",
    ],
  },
  {
    city: "Cardiff",
    region: "Wales",
    postcodes: [
      "CF24 4AB", "CF14 4HX", "CF11 9DG", "CF23 5AA", "CF5 1AA",
      "CF3 4AA", "CF15 7AA", "CF10 5AA", "CF14 7AA", "CF24 1AA",
    ],
  },
  {
    city: "Swansea",
    region: "Wales",
    postcodes: [
      "SA1 6AA", "SA2 7AA", "SA3 4AA", "SA4 9AA", "SA5 8AA",
      "SA6 7AA", "SA1 1AA", "SA2 0AA", "SA3 5AA", "SA5 4AA",
    ],
  },
  {
    city: "Brighton & Hove",
    region: "South East",
    postcodes: [
      "BN1 6AA", "BN2 9AA", "BN3 4AA", "BN1 4AA", "BN2 1AA",
      "BN3 1AA", "BN1 8AA", "BN2 5AA", "BN3 7AA", "BN41 1AA",
    ],
  },
  {
    city: "Southampton",
    region: "South East",
    postcodes: [
      "SO14 6AA", "SO15 7AA", "SO16 9AA", "SO17 1AA", "SO18 1AA",
      "SO19 5AA", "SO15 3AA", "SO16 4AA", "SO17 3AA", "SO18 4AA",
    ],
  },
  {
    city: "Portsmouth",
    region: "South East",
    postcodes: [
      "PO1 5AA", "PO2 7AA", "PO3 5AA", "PO4 9AA", "PO5 3AA",
      "PO6 1AA", "PO1 3AA", "PO4 8AA", "PO5 1AA", "PO6 4AA",
    ],
  },
  {
    city: "Nottingham",
    region: "East Midlands",
    postcodes: [
      "NG7 1AA", "NG3 5AA", "NG5 1AA", "NG2 4AA", "NG8 1AA",
      "NG9 1AA", "NG11 7AA", "NG6 8AA", "NG4 1AA", "NG2 7AA",
    ],
  },
  {
    city: "Leicester",
    region: "East Midlands",
    postcodes: [
      "LE2 6FH", "LE3 1AA", "LE4 5AA", "LE5 4AA", "LE2 1AA",
      "LE3 9AA", "LE4 9AA", "LE5 1AA", "LE2 8AA", "LE3 0AA",
    ],
  },
  {
    city: "Coventry",
    region: "West Midlands",
    postcodes: [
      "CV1 5AA", "CV2 4AA", "CV3 1AA", "CV4 8AA", "CV5 6AA",
      "CV6 1AA", "CV2 1AA", "CV4 7AA", "CV5 9AA", "CV6 7AA",
    ],
  },
  {
    city: "Reading",
    region: "South East",
    postcodes: [
      "RG1 5AA", "RG2 7AA", "RG30 1AA", "RG4 5AA", "RG5 4AA",
      "RG6 7AA", "RG1 7AA", "RG2 9AA", "RG30 4AA", "RG4 8AA",
    ],
  },
  {
    city: "Oxford",
    region: "South East",
    postcodes: [
      "OX1 4AA", "OX2 6AA", "OX3 0AA", "OX4 1AA", "OX2 9AA",
      "OX3 7AA", "OX4 4AA", "OX1 2AA", "OX2 7AA", "OX4 7AA",
    ],
  },
  {
    city: "Cambridge",
    region: "East of England",
    postcodes: [
      "CB1 2AA", "CB2 1AA", "CB3 0AA", "CB4 1AA", "CB5 8AA",
      "CB1 7AA", "CB4 3AA", "CB1 9AA", "CB2 8AA", "CB4 8AA",
    ],
  },
  {
    city: "Norwich",
    region: "East of England",
    postcodes: [
      "NR1 1AA", "NR2 4AA", "NR3 1AA", "NR4 6AA", "NR5 9AA",
      "NR6 5AA", "NR7 0AA", "NR2 1AA", "NR3 4AA", "NR4 7AA",
    ],
  },
  {
    city: "Plymouth",
    region: "South West",
    postcodes: [
      "PL1 4AA", "PL2 1AA", "PL3 5AA", "PL4 8AA", "PL5 2AA",
      "PL6 5AA", "PL1 1AA", "PL2 4AA", "PL3 4AA", "PL4 6AA",
    ],
  },
  {
    city: "Bath",
    region: "South West",
    postcodes: [
      "BA1 5AA", "BA2 1AA", "BA1 6AA", "BA2 4AA", "BA1 3AA",
      "BA2 7AA", "BA1 7AA", "BA2 8AA", "BA1 4AA", "BA2 5AA",
    ],
  },
  {
    city: "Bournemouth",
    region: "South West",
    postcodes: [
      "BH1 1AA", "BH2 5AA", "BH3 7AA", "BH4 8AA", "BH5 1AA",
      "BH6 3AA", "BH7 6AA", "BH8 8AA", "BH9 1AA", "BH10 4AA",
    ],
  },
  {
    city: "York",
    region: "Yorkshire",
    postcodes: [
      "YO1 7AA", "YO10 4AA", "YO24 1AA", "YO26 4AA", "YO30 4AA",
      "YO31 1AA", "YO10 5AA", "YO24 4AA", "YO26 6AA", "YO30 5AA",
    ],
  },
  {
    city: "Hull",
    region: "Yorkshire",
    postcodes: [
      "HU1 1AA", "HU3 1AA", "HU5 1AA", "HU6 7AA", "HU7 4AA",
      "HU8 8AA", "HU9 1AA", "HU3 6AA", "HU5 5AA", "HU6 9AA",
    ],
  },
  {
    city: "Stoke-on-Trent",
    region: "West Midlands",
    postcodes: [
      "ST1 1AA", "ST2 7AA", "ST3 1AA", "ST4 5AA", "ST6 1AA",
      "ST7 1AA", "ST1 4AA", "ST2 9AA", "ST3 7AA", "ST4 8AA",
    ],
  },
  {
    city: "Wolverhampton",
    region: "West Midlands",
    postcodes: [
      "WV1 1AA", "WV2 4AA", "WV3 7AA", "WV4 5AA", "WV6 8AA",
      "WV10 6AA", "WV11 1AA", "WV1 4AA", "WV2 1AA", "WV3 9AA",
    ],
  },
  {
    city: "Derby",
    region: "East Midlands",
    postcodes: [
      "DE1 1AA", "DE21 4AA", "DE22 1AA", "DE23 6AA", "DE24 8AA",
      "DE3 9AA", "DE21 7AA", "DE22 4AA", "DE23 1AA", "DE24 0AA",
    ],
  },
  {
    city: "Milton Keynes",
    region: "South East",
    postcodes: [
      "MK1 1AA", "MK2 2AA", "MK3 5AA", "MK4 4AA", "MK5 6AA",
      "MK6 1AA", "MK7 8AA", "MK8 9AA", "MK9 1AA", "MK10 7AA",
    ],
  },
  {
    city: "Preston",
    region: "North West",
    postcodes: [
      "PR1 1AA", "PR2 1AA", "PR3 0AA", "PR4 0AA", "PR5 4AA",
      "PR1 4AA", "PR2 9AA", "PR1 8AA", "PR2 4AA", "PR5 6AA",
    ],
  },
  {
    city: "Bradford",
    region: "Yorkshire",
    postcodes: [
      "BD1 1AA", "BD3 7AA", "BD5 0AA", "BD7 1AA", "BD8 7AA",
      "BD9 6AA", "BD10 0AA", "BD15 7AA", "BD2 4AA", "BD6 1AA",
    ],
  },
];

// ---------------------------------------------------------------------------
// API row + aggregation types
// ---------------------------------------------------------------------------

interface MHCLGRow {
  certificateNumber: string;
  postcode: string;
  postTown: string | null;
  council: string | null;
  currentEnergyEfficiencyBand: string;
  registrationDate: string;
  uprn: number | null;
}

interface MHCLGResponse {
  data: MHCLGRow[] | { error: string };
  pagination?: { totalRecords: number };
}

const ALL_BANDS = ["A", "B", "C", "D", "E", "F", "G"] as const;
type Band = (typeof ALL_BANDS)[number];

interface CityAggregate {
  city: string;
  region: string;
  total: number; // unique properties (UPRN-deduped + no-UPRN appended)
  bandCounts: Record<Band, number>;
  belowCPct: number; // D + E + F + G
  urgentPct: number; // E + F + G
  compliantPct: number; // A + B + C
  postcodesSampled: number;
  postcodesWithData: number;
}

interface Snapshot {
  generatedAt: string;
  source: string;
  notes: string[];
  national: {
    total: number;
    belowCPct: number;
    urgentPct: number;
    compliantPct: number;
    bandCounts: Record<Band, number>;
  };
  cities: CityAggregate[];
}

// ---------------------------------------------------------------------------
// Fetch helper with retries
// ---------------------------------------------------------------------------

async function fetchPostcode(
  postcode: string,
  retries = 2
): Promise<MHCLGRow[]> {
  const url = `https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search?postcode=${encodeURIComponent(
    postcode
  )}&page_size=500`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
        },
      });

      if (res.status === 404) return []; // no certs is normal
      if (res.status === 429 || res.status >= 500) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      if (!res.ok) {
        console.warn(`  ${postcode}: HTTP ${res.status}`);
        return [];
      }

      const json = (await res.json()) as MHCLGResponse;
      if (Array.isArray(json.data)) return json.data;
      return [];
    } catch (err) {
      if (attempt === retries) {
        console.warn(`  ${postcode}: fetch failed`, err);
        return [];
      }
      await sleep(800 * (attempt + 1));
    }
  }
  return [];
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Per-city aggregate
// ---------------------------------------------------------------------------

async function aggregateCity(spec: CitySpec): Promise<CityAggregate> {
  const byUprn = new Map<number, MHCLGRow>();
  const noUprn: MHCLGRow[] = [];
  let postcodesWithData = 0;

  for (const pc of spec.postcodes) {
    const rows = await fetchPostcode(pc);
    if (rows.length > 0) postcodesWithData += 1;

    for (const r of rows) {
      if (r.uprn == null) {
        noUprn.push(r);
        continue;
      }
      const existing = byUprn.get(r.uprn);
      if (!existing || r.registrationDate > existing.registrationDate) {
        byUprn.set(r.uprn, r);
      }
    }
    // Be nice to the API
    await sleep(120);
  }

  const all = [...byUprn.values(), ...noUprn];
  const total = all.length;

  const bandCounts: Record<Band, number> = {
    A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0,
  };
  for (const r of all) {
    const b = (r.currentEnergyEfficiencyBand || "").toUpperCase() as Band;
    if (b in bandCounts) bandCounts[b] += 1;
  }

  const compliant = bandCounts.A + bandCounts.B + bandCounts.C;
  const belowC = bandCounts.D + bandCounts.E + bandCounts.F + bandCounts.G;
  const urgent = bandCounts.E + bandCounts.F + bandCounts.G;

  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return {
    city: spec.city,
    region: spec.region,
    total,
    bandCounts,
    belowCPct: pct(belowC),
    urgentPct: pct(urgent),
    compliantPct: pct(compliant),
    postcodesSampled: spec.postcodes.length,
    postcodesWithData,
  };
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`Ingesting ${CITY_SEEDS.length} cities...`);
  const cities: CityAggregate[] = [];

  for (const spec of CITY_SEEDS) {
    process.stdout.write(`\n${spec.city}: `);
    const agg = await aggregateCity(spec);
    cities.push(agg);
    console.log(
      `total=${agg.total}, belowC=${agg.belowCPct.toFixed(1)}%, ` +
        `pcs=${agg.postcodesWithData}/${agg.postcodesSampled}`
    );
  }

  // National rollup across all cities (sample, not census)
  const nationalBands: Record<Band, number> = {
    A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0,
  };
  let nationalTotal = 0;
  for (const c of cities) {
    nationalTotal += c.total;
    for (const b of ALL_BANDS) nationalBands[b] += c.bandCounts[b];
  }
  const nCompliant = nationalBands.A + nationalBands.B + nationalBands.C;
  const nBelowC = nationalBands.D + nationalBands.E + nationalBands.F + nationalBands.G;
  const nUrgent = nationalBands.E + nationalBands.F + nationalBands.G;
  const nPct = (n: number) =>
    nationalTotal > 0 ? (n / nationalTotal) * 100 : 0;

  const snapshot: Snapshot = {
    generatedAt: new Date().toISOString(),
    source:
      "MHCLG Get Energy Performance of Buildings register (api.get-energy-performance-data.communities.gov.uk)",
    notes: [
      "England + Wales only. Scotland and Northern Ireland use separate registers.",
      "Domestic certificates only. Non-domestic stock is not included in this snapshot.",
      "Per-city sample: 8-12 representative residential postcodes per city, deduped by UPRN, latest cert per property.",
      "Below-C share covers bands D, E, F, G. Band D is currently MEES-compliant; the 2027/2030 proposals bring D into scope.",
    ],
    national: {
      total: nationalTotal,
      belowCPct: nPct(nBelowC),
      urgentPct: nPct(nUrgent),
      compliantPct: nPct(nCompliant),
      bandCounts: nationalBands,
    },
    cities: cities.sort((a, b) => b.belowCPct - a.belowCPct),
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2));
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(
    `National: ${nationalTotal} certs, ${nPct(nBelowC).toFixed(1)}% below C`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
