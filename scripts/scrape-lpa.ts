/**
 * Scrape a single LPA's planning portal and merge results into
 * src/data/applications-scraped.json.
 *
 *   tsx scripts/scrape-lpa.ts <lpa-id>
 *
 *   tsx scripts/scrape-lpa.ts hertsmere
 *
 * Adapters live in scripts/lib/. Today only the classic Idox Public Access
 * adapter is wired up (covers Hertsmere, Greater Cambridge, Mid Sussex,
 * Basingstoke and similar). Adding a new LPA means appending an entry to the
 * LPAS array below; adding a different portal type (Northgate, Civica) means
 * adding an adapter module.
 *
 * Sector classification uses the same keyword lists as the gov.uk ingest —
 * the description text drives it.
 */
// Several UK LPA portals ship incomplete TLS certificate chains that Node
// rejects (Hertsmere is one). The data we're fetching is public; this script
// only ever reads. Disable strict TLS for this scraper run.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Sector,
  Region,
  Decision,
  Application,
} from "../src/lib/planning";
import {
  searchAndHydrate,
  type IdoxLpa,
  type IdoxApplicationMetadata,
} from "./lib/idox-adapter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const OUTPUT = join(PROJECT_ROOT, "src", "data", "applications-scraped.json");

// ──────────────────────────────────────────────────────────────
// LPAs we know how to scrape
// ──────────────────────────────────────────────────────────────
const LPAS: Record<string, IdoxLpa> = {
  hertsmere: {
    id: "hertsmere",
    name: "Hertsmere Borough Council",
    baseUrl: "https://www6.hertsmere.gov.uk",
    region: "East of England",
  },
  "greater-cambridge": {
    id: "greater-cambridge",
    name: "Greater Cambridge Shared Planning",
    baseUrl: "https://applications.greatercambridgeplanning.org",
    region: "East of England",
  },
  "mid-sussex": {
    id: "mid-sussex",
    name: "Mid Sussex District Council",
    baseUrl: "https://pa.midsussex.gov.uk",
    region: "South East",
  },
  basingstoke: {
    id: "basingstoke",
    name: "Basingstoke and Deane Borough Council",
    baseUrl: "https://planning.basingstoke.gov.uk",
    region: "South East",
  },
  brent: {
    id: "brent",
    name: "London Borough of Brent",
    baseUrl: "https://pa.brent.gov.uk",
    region: "London",
  },
  guildford: {
    id: "guildford",
    name: "Guildford Borough Council",
    baseUrl: "https://publicaccess.guildford.gov.uk",
    region: "South East",
  },
  "east-herts": {
    id: "east-herts",
    name: "East Herts District Council",
    baseUrl: "https://publicaccess.eastherts.gov.uk",
    region: "East of England",
  },
  // welwyn-hatfield removed — they migrated off Idox Public Access. Their
  // search page now returns 404. Re-add when we ship a different adapter.
  ealing: {
    id: "ealing",
    name: "London Borough of Ealing",
    baseUrl: "https://pam.ealing.gov.uk",
    region: "London",
  },
  lambeth: {
    id: "lambeth",
    name: "London Borough of Lambeth",
    baseUrl: "https://planning.lambeth.gov.uk",
    region: "London",
  },
  lewisham: {
    id: "lewisham",
    name: "London Borough of Lewisham",
    baseUrl: "https://planning.lewisham.gov.uk",
    region: "London",
  },
  redbridge: {
    id: "redbridge",
    name: "London Borough of Redbridge",
    baseUrl: "https://planning.redbridge.gov.uk",
    region: "London",
  },
  bracknell: {
    id: "bracknell",
    name: "Bracknell Forest Council",
    baseUrl: "https://planapps.bracknell-forest.gov.uk",
    region: "South East",
  },
  "windsor-maidenhead": {
    id: "windsor-maidenhead",
    name: "Royal Borough of Windsor and Maidenhead",
    baseUrl: "https://publicaccess.rbwm.gov.uk",
    region: "South East",
  },
  wokingham: {
    id: "wokingham",
    name: "Wokingham Borough Council",
    baseUrl: "https://planning.wokingham.gov.uk",
    region: "South East",
  },
  ashford: {
    id: "ashford",
    name: "Ashford Borough Council",
    baseUrl: "https://planning.ashford.gov.uk",
    region: "South East",
  },
  "tunbridge-wells": {
    id: "tunbridge-wells",
    name: "Tunbridge Wells Borough Council",
    baseUrl: "https://twbcpa.midkent.gov.uk",
    region: "South East",
  },
  "tonbridge-malling": {
    id: "tonbridge-malling",
    name: "Tonbridge and Malling Borough Council",
    baseUrl: "https://publicaccess.tmbc.gov.uk",
    region: "South East",
  },
  dover: {
    id: "dover",
    name: "Dover District Council",
    baseUrl: "https://publicaccess.dover.gov.uk",
    region: "South East",
  },
  swale: {
    id: "swale",
    name: "Swale Borough Council",
    baseUrl: "https://pa.midkent.gov.uk",
    region: "South East",
  },
  "new-forest": {
    id: "new-forest",
    name: "New Forest District Council",
    baseUrl: "https://planning.newforest.gov.uk",
    region: "South East",
  },
  "north-herts": {
    id: "north-herts",
    name: "North Hertfordshire District Council",
    baseUrl: "https://pa2.north-herts.gov.uk",
    region: "East of England",
  },
  stevenage: {
    id: "stevenage",
    name: "Stevenage Borough Council",
    baseUrl: "https://publicaccess.stevenage.gov.uk",
    region: "East of England",
  },
  huntingdonshire: {
    id: "huntingdonshire",
    name: "Huntingdonshire District Council",
    baseUrl: "https://publicaccess.huntingdonshire.gov.uk",
    region: "East of England",
  },
  "east-cambridgeshire": {
    id: "east-cambridgeshire",
    name: "East Cambridgeshire District Council",
    baseUrl: "https://pa.eastcambs.gov.uk",
    region: "East of England",
  },
  shropshire: {
    id: "shropshire",
    name: "Shropshire Council",
    baseUrl: "https://pa.shropshire.gov.uk",
    region: "West Midlands",
  },
  "north-kesteven": {
    id: "north-kesteven",
    name: "North Kesteven District Council",
    baseUrl: "https://planningonline.n-kesteven.gov.uk",
    region: "East Midlands",
  },
  rutland: {
    id: "rutland",
    name: "Rutland County Council",
    baseUrl: "https://publicaccess.rutland.gov.uk",
    region: "East Midlands",
  },
  harborough: {
    id: "harborough",
    name: "Harborough District Council",
    baseUrl: "https://pa2.harborough.gov.uk",
    region: "East Midlands",
  },
  leeds: {
    id: "leeds",
    name: "Leeds City Council",
    baseUrl: "https://publicaccess.leeds.gov.uk",
    region: "Yorkshire & Humber",
  },
  trafford: {
    id: "trafford",
    name: "Trafford Council",
    baseUrl: "https://publicaccess.trafford.gov.uk",
    region: "North West",
  },
  bristol: {
    id: "bristol",
    name: "Bristol City Council",
    baseUrl: "https://pa.bristol.gov.uk",
    region: "South West",
  },
};

// ──────────────────────────────────────────────────────────────
// Sector search keywords — slightly more aggressive than the gov.uk
// classifier because we're querying the portal directly. Each row is one
// keyword that gets posted as searchCriteria.description.
// ──────────────────────────────────────────────────────────────
const SECTOR_QUERIES: Array<{ sector: Sector; description: string }> = [
  { sector: "data-centre", description: "data centre" },
  { sector: "data-centre", description: "hyperscale" },
  { sector: "logistics", description: "warehouse" },
  { sector: "logistics", description: "distribution centre" },
  { sector: "btr-pbsa", description: "build to rent" },
  { sector: "btr-pbsa", description: "student accommodation" },
  { sector: "healthcare", description: "care home" },
  { sector: "healthcare", description: "hospital" },
  { sector: "education", description: "secondary school" },
  { sector: "education", description: "primary school" },
  { sector: "renewable-energy", description: "solar farm" },
  { sector: "renewable-energy", description: "battery storage" },
  { sector: "hotels", description: "hotel" },
  { sector: "mixed-use", description: "mixed-use" },
];

// 36 months back from today.
const TODAY = new Date();
const THIRTY_SIX_MO_AGO = new Date(TODAY);
THIRTY_SIX_MO_AGO.setMonth(THIRTY_SIX_MO_AGO.getMonth() - 36);
const FROM = THIRTY_SIX_MO_AGO.toISOString().slice(0, 10);
const TO = TODAY.toISOString().slice(0, 10);

// ──────────────────────────────────────────────────────────────
// Mapping Idox metadata → our Application shape
// ──────────────────────────────────────────────────────────────

// Idox's "Decision" field commonly contains values like:
//   "Granted", "Refused", "Withdrawn", "Application Permitted", "Application Refused"
function mapDecision(raw: string): Decision {
  const lc = raw.toLowerCase();
  if (lc.includes("refus")) return "refused";
  if (lc.includes("withdraw")) return "withdrawn";
  if (lc.includes("permitted") || lc.includes("grant") || lc.includes("approv"))
    return "approved";
  return "pending";
}

// "Tue 21 Apr 2026" → "2026-04-21"
function parseUkDate(raw: string): string {
  if (!raw) return "";
  const m = raw.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!m) return "";
  const months: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const mm = months[m[2].slice(0, 3).toLowerCase()];
  if (!mm) return "";
  return `${m[3]}-${mm}-${String(m[1]).padStart(2, "0")}`;
}

interface ScrapedApplication extends Omit<Application, "source"> {
  source: "lpa-portal-scrape";
}

function toApplication(
  lpa: IdoxLpa,
  sector: Sector,
  meta: IdoxApplicationMetadata
): ScrapedApplication {
  return {
    id: `${lpa.id}-${meta.keyVal}`,
    reference: meta.reference,
    lpa: lpa.name,
    region: lpa.region as Region,
    address: meta.address,
    postcode: "",
    useClass: meta.applicationType,
    sector,
    description: meta.proposal,
    applicant: meta.applicantName,
    agent: meta.agentName,
    decision: mapDecision(meta.decision || meta.status),
    decisionDate: parseUkDate(meta.decisionIssuedDate),
    conditions: [],
    source: "lpa-portal-scrape",
    sourceUrl: meta.sourceUrl,
  };
}

// ──────────────────────────────────────────────────────────────

async function scrapeOne(lpa: IdoxLpa): Promise<ScrapedApplication[]> {
  console.log(`\n──────────────────────────────────────────────`);
  console.log(`Scraping ${lpa.name} (${lpa.baseUrl})`);
  console.log(`Decision dates: ${FROM} → ${TO}`);
  console.log(`Sectors: ${SECTOR_QUERIES.length} queries\n`);

  // Dedupe by keyVal across multiple queries (the same application can appear
  // for several keywords). First sector that matches wins.
  const byKeyVal = new Map<string, ScrapedApplication>();
  for (const { sector, description } of SECTOR_QUERIES) {
    console.log(`[${sector}] description="${description}"`);
    try {
      const results = await searchAndHydrate(lpa, {
        description,
        decisionFrom: FROM,
        decisionTo: TO,
      });
      for (const meta of results) {
        if (byKeyVal.has(meta.keyVal)) continue;
        byKeyVal.set(meta.keyVal, toApplication(lpa, sector, meta));
      }
    } catch (err) {
      console.warn(
        `  ! query failed: ${err instanceof Error ? err.message : err}`
      );
    }
  }
  return Array.from(byKeyVal.values());
}

async function main() {
  const lpaArg = process.argv[2];
  // Parallelism: each LPA hits a different host so they don't share rate
  // limits. Defaults to 1 (sequential — safest for cookie-jar correctness);
  // override with --parallel N for big runs.
  const parallelArg = process.argv.indexOf("--parallel");
  const parallel =
    parallelArg !== -1 && process.argv[parallelArg + 1]
      ? Math.max(1, parseInt(process.argv[parallelArg + 1], 10))
      : 1;

  if (!lpaArg) {
    console.error(`Usage: tsx scripts/scrape-lpa.ts <lpa-id|all> [--parallel N]`);
    console.error(`Available: ${Object.keys(LPAS).join(", ")}`);
    process.exit(1);
  }

  const targets: IdoxLpa[] = [];
  if (lpaArg === "all") {
    targets.push(...Object.values(LPAS));
  } else if (LPAS[lpaArg]) {
    targets.push(LPAS[lpaArg]);
  } else {
    console.error(`Unknown LPA id: ${lpaArg}`);
    console.error(`Available: ${Object.keys(LPAS).join(", ")}`);
    process.exit(1);
  }

  console.log(
    `Will scrape ${targets.length} LPA(s) with parallelism = ${parallel}.`
  );

  const allNewApps: ScrapedApplication[] = [];
  const succeededIds = new Set<string>();

  // Simple worker-pool: at most N LPAs running concurrently. Each LPA's work
  // is independent (own host, own cookies, own search results).
  const queue = [...targets];
  async function worker() {
    while (queue.length > 0) {
      const lpa = queue.shift();
      if (!lpa) return;
      try {
        const apps = await scrapeOne(lpa);
        console.log(`${lpa.name}: ${apps.length} unique applications`);
        allNewApps.push(...apps);
        succeededIds.add(lpa.id);
      } catch (err) {
        console.error(
          `! ${lpa.name} failed: ${err instanceof Error ? err.message : err}`
        );
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(parallel, targets.length) }, () => worker())
  );

  console.log(
    `\n══════════════════════════════════════════════\nTotal new: ${allNewApps.length} across ${succeededIds.size} LPAs`
  );

  const newApps = allNewApps;

  // Merge with anything already scraped from other LPAs. New entries for the
  // current LPA replace old ones (by id); entries from other LPAs are kept.
  let existing: ScrapedApplication[] = [];
  if (existsSync(OUTPUT)) {
    try {
      const raw = JSON.parse(await readFile(OUTPUT, "utf-8"));
      existing = (raw.applications ?? []) as ScrapedApplication[];
    } catch {
      /* fall through */
    }
  }
  const byId = new Map<string, ScrapedApplication>();
  // First add existing entries from LPAs we didn't touch this run (keep them).
  for (const a of existing) {
    // Resolve lpa prefix by matching the longest known LPA id.
    const lpaPrefix = Object.keys(LPAS)
      .sort((x, y) => y.length - x.length)
      .find((k) => a.id.startsWith(`${k}-`));
    if (!lpaPrefix || !succeededIds.has(lpaPrefix)) {
      byId.set(a.id, a);
    }
  }
  // Then add the freshly-scraped entries (replace any stale entries for the
  // LPAs we just scraped).
  for (const a of newApps) byId.set(a.id, a);
  const merged = Array.from(byId.values()).sort((a, b) =>
    b.decisionDate.localeCompare(a.decisionDate)
  );

  await writeFile(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "lpa-portal-scrape",
        note:
          "Real planning applications scraped directly from LPA portals. " +
          "Metadata + applicant + agent from the application detail pages. " +
          "Decision-notice PDFs (and the conditions they contain) are fetched separately via the Playwright doc-fetch pipeline.",
        applications: merged,
      },
      null,
      2
    )
  );
  console.log(`Wrote ${merged.length} total applications across all scraped LPAs → ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
