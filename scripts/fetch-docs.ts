/**
 * Walk the scraped applications and download decision-notice PDFs for any
 * that don't already have one. Generates sidecar .meta.json files so the
 * Claude extractor (extract-pdfs) can immediately process them.
 *
 *   tsx scripts/fetch-docs.ts                 # all scraped apps
 *   tsx scripts/fetch-docs.ts --lpa hertsmere # one LPA only
 *   tsx scripts/fetch-docs.ts --limit 5       # cap downloads
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IdoxDocFetcher, writeSidecar } from "./lib/idox-doc-fetcher";
import type { Application, Sector, Region } from "../src/lib/planning";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const SCRAPED = join(PROJECT_ROOT, "src", "data", "applications-scraped.json");

// Same LPA registry as the scraper. Keeping a small copy here to avoid the
// importing-from-a-script-into-a-script duplication problem; we only need
// the base URL + region per LPA id.
const LPA_BASE: Record<string, { baseUrl: string; region: Region; name: string }> = {
  hertsmere: {
    baseUrl: "https://www6.hertsmere.gov.uk",
    region: "East of England",
    name: "Hertsmere Borough Council",
  },
  "greater-cambridge": {
    baseUrl: "https://applications.greatercambridgeplanning.org",
    region: "East of England",
    name: "Greater Cambridge Shared Planning",
  },
  "mid-sussex": {
    baseUrl: "https://pa.midsussex.gov.uk",
    region: "South East",
    name: "Mid Sussex District Council",
  },
  basingstoke: {
    baseUrl: "https://planning.basingstoke.gov.uk",
    region: "South East",
    name: "Basingstoke and Deane Borough Council",
  },
  brent: {
    baseUrl: "https://pa.brent.gov.uk",
    region: "London",
    name: "London Borough of Brent",
  },
  guildford: {
    baseUrl: "https://publicaccess.guildford.gov.uk",
    region: "South East",
    name: "Guildford Borough Council",
  },
  "east-herts": {
    baseUrl: "https://publicaccess.eastherts.gov.uk",
    region: "East of England",
    name: "East Herts District Council",
  },
  // welwyn-hatfield removed — migrated off Idox PA.
  ealing: { baseUrl: "https://pam.ealing.gov.uk", region: "London", name: "London Borough of Ealing" },
  lambeth: { baseUrl: "https://planning.lambeth.gov.uk", region: "London", name: "London Borough of Lambeth" },
  lewisham: { baseUrl: "https://planning.lewisham.gov.uk", region: "London", name: "London Borough of Lewisham" },
  redbridge: { baseUrl: "https://planning.redbridge.gov.uk", region: "London", name: "London Borough of Redbridge" },
  bracknell: { baseUrl: "https://planapps.bracknell-forest.gov.uk", region: "South East", name: "Bracknell Forest Council" },
  "windsor-maidenhead": { baseUrl: "https://publicaccess.rbwm.gov.uk", region: "South East", name: "Royal Borough of Windsor and Maidenhead" },
  wokingham: { baseUrl: "https://planning.wokingham.gov.uk", region: "South East", name: "Wokingham Borough Council" },
  ashford: { baseUrl: "https://planning.ashford.gov.uk", region: "South East", name: "Ashford Borough Council" },
  "tunbridge-wells": { baseUrl: "https://twbcpa.midkent.gov.uk", region: "South East", name: "Tunbridge Wells Borough Council" },
  "tonbridge-malling": { baseUrl: "https://publicaccess.tmbc.gov.uk", region: "South East", name: "Tonbridge and Malling Borough Council" },
  dover: { baseUrl: "https://publicaccess.dover.gov.uk", region: "South East", name: "Dover District Council" },
  swale: { baseUrl: "https://pa.midkent.gov.uk", region: "South East", name: "Swale Borough Council" },
  "new-forest": { baseUrl: "https://planning.newforest.gov.uk", region: "South East", name: "New Forest District Council" },
  "north-herts": { baseUrl: "https://pa2.north-herts.gov.uk", region: "East of England", name: "North Hertfordshire District Council" },
  stevenage: { baseUrl: "https://publicaccess.stevenage.gov.uk", region: "East of England", name: "Stevenage Borough Council" },
  huntingdonshire: { baseUrl: "https://publicaccess.huntingdonshire.gov.uk", region: "East of England", name: "Huntingdonshire District Council" },
  "east-cambridgeshire": { baseUrl: "https://pa.eastcambs.gov.uk", region: "East of England", name: "East Cambridgeshire District Council" },
  shropshire: { baseUrl: "https://pa.shropshire.gov.uk", region: "West Midlands", name: "Shropshire Council" },
  "north-kesteven": { baseUrl: "https://planningonline.n-kesteven.gov.uk", region: "East Midlands", name: "North Kesteven District Council" },
  rutland: { baseUrl: "https://publicaccess.rutland.gov.uk", region: "East Midlands", name: "Rutland County Council" },
  harborough: { baseUrl: "https://pa2.harborough.gov.uk", region: "East Midlands", name: "Harborough District Council" },
  leeds: { baseUrl: "https://publicaccess.leeds.gov.uk", region: "Yorkshire & Humber", name: "Leeds City Council" },
  trafford: { baseUrl: "https://publicaccess.trafford.gov.uk", region: "North West", name: "Trafford Council" },
  bristol: { baseUrl: "https://pa.bristol.gov.uk", region: "South West", name: "Bristol City Council" },
};

interface ScrapedFile {
  applications: Application[];
}

interface Args {
  lpa?: string;
  limit?: number;
  sectors?: Sector[];
  onlyDecided: boolean;
}

function parseArgs(): Args {
  const out: Args = { onlyDecided: true };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--lpa") out.lpa = argv[++i];
    else if (a === "--limit") out.limit = parseInt(argv[++i], 10);
    else if (a === "--sectors") {
      out.sectors = argv[++i].split(",") as Sector[];
    } else if (a === "--include-undecided") out.onlyDecided = false;
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const raw = JSON.parse(await readFile(SCRAPED, "utf-8")) as ScrapedFile;
  let apps = raw.applications;

  if (args.lpa) {
    apps = apps.filter((a) => a.id.startsWith(`${args.lpa}-`));
  }
  if (args.sectors) {
    apps = apps.filter((a) => args.sectors!.includes(a.sector));
  }
  if (args.onlyDecided) {
    apps = apps.filter(
      (a) => a.decision === "approved" || a.decision === "refused"
    );
  }
  if (args.limit) {
    apps = apps.slice(0, args.limit);
  }

  console.log(`Fetching decision-notice PDFs for ${apps.length} applications`);
  console.log(args);

  const fetcher = new IdoxDocFetcher();
  await fetcher.start();

  let downloaded = 0;
  let cached = 0;
  let noNotice = 0;
  let errors = 0;

  try {
    for (const app of apps) {
      // id is of the form "<lpa-id>-<keyVal>". LPA ids may themselves contain
      // dashes (e.g. "greater-cambridge"), so match against the longest known
      // prefix in LPA_BASE rather than splitting on the first dash.
      const lpaId = Object.keys(LPA_BASE)
        .sort((a, b) => b.length - a.length)
        .find((k) => app.id.startsWith(`${k}-`));
      if (!lpaId) {
        console.warn(`  ! ${app.id}: cannot resolve LPA prefix`);
        continue;
      }
      const keyVal = app.id.slice(lpaId.length + 1);
      const lpaCfg = LPA_BASE[lpaId];
      const lpa = {
        id: lpaId,
        name: lpaCfg.name,
        baseUrl: lpaCfg.baseUrl,
        region: lpaCfg.region,
      };
      process.stdout.write(`[${app.reference}] ${app.applicant || "(no applicant)"} ... `);
      const r = await fetcher.fetchDecisionNotice(lpa, keyVal);
      console.log(r.status, r.error ? `(${r.error})` : "");

      if (r.status === "downloaded" || r.status === "cached") {
        if (r.status === "downloaded") downloaded++;
        else cached++;
        if (r.pdfPath) {
          await writeSidecar(r.pdfPath, {
            id: app.id,
            reference: app.reference,
            lpa: app.lpa,
            region: app.region,
            address: app.address,
            useClass: app.useClass,
            sector: app.sector,
            description: app.description,
            applicant: app.applicant,
            agent: app.agent,
            decisionDate: app.decisionDate,
            // The application's summary page on the LPA portal — what users
            // expect "View source" to mean. The actual PDF URL is recorded
            // separately as pdfUrl for traceability.
            sourceUrl: `${lpaCfg.baseUrl}/online-applications/applicationDetails.do?keyVal=${keyVal}&activeTab=summary`,
            pdfUrl: r.pdfUrl ?? "",
          });
        }
      } else if (r.status === "no-decision-notice") {
        noNotice++;
      } else {
        errors++;
      }
    }
  } finally {
    await fetcher.stop();
  }

  console.log(`\nDone.`);
  console.log(`  downloaded: ${downloaded}`);
  console.log(`  cached:     ${cached}`);
  console.log(`  no notice:  ${noNotice}`);
  console.log(`  errors:     ${errors}`);
  console.log(`\nNext: npm run extract:pdfs`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
