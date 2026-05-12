/**
 * Probe a long list of candidate UK LPA Idox Public Access portals to find
 * which respond with the classic search form. Outputs a clean list ready to
 * paste into the LPAS registry.
 *
 *   tsx scripts/probe-lpas.ts
 *
 * Tests each candidate in parallel (8 at a time). A "match" means:
 *   - HTTP 200 on /online-applications/
 *   - The response HTML contains markers for classic Idox PA
 *     ("simpleSearch", "searchType=Application" or "online-applications-skin")
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

interface Candidate {
  id: string;
  name: string;
  region: string;
  baseUrl: string;
}

// Built environment priority sectors: data centres, logistics, BTR/PBSA,
// healthcare, education, renewables, hotels, mixed-use. The list below
// targets councils where these activities concentrate.
const CANDIDATES: Candidate[] = [
  // Already in registry — re-probed for sanity:
  { id: "hertsmere", name: "Hertsmere", region: "East of England", baseUrl: "https://www6.hertsmere.gov.uk" },
  { id: "mid-sussex", name: "Mid Sussex", region: "South East", baseUrl: "https://pa.midsussex.gov.uk" },
  { id: "basingstoke", name: "Basingstoke and Deane", region: "South East", baseUrl: "https://planning.basingstoke.gov.uk" },
  { id: "greater-cambridge", name: "Greater Cambridge Shared Planning", region: "East of England", baseUrl: "https://applications.greatercambridgeplanning.org" },
  { id: "brent", name: "London Borough of Brent", region: "London", baseUrl: "https://pa.brent.gov.uk" },
  { id: "guildford", name: "Guildford", region: "South East", baseUrl: "https://publicaccess.guildford.gov.uk" },
  { id: "east-herts", name: "East Herts", region: "East of England", baseUrl: "https://publicaccess.eastherts.gov.uk" },
  { id: "welwyn-hatfield", name: "Welwyn Hatfield", region: "East of England", baseUrl: "https://planning.welhat.gov.uk" },
  // New London boroughs:
  { id: "harrow", name: "London Borough of Harrow", region: "London", baseUrl: "https://www.harrow.gov.uk/planning/online-applications" },
  { id: "ealing", name: "London Borough of Ealing", region: "London", baseUrl: "https://pam.ealing.gov.uk/online-applications" },
  { id: "lambeth", name: "London Borough of Lambeth", region: "London", baseUrl: "https://planning.lambeth.gov.uk/online-applications" },
  { id: "lewisham", name: "London Borough of Lewisham", region: "London", baseUrl: "https://planning.lewisham.gov.uk/online-applications" },
  { id: "hackney", name: "London Borough of Hackney", region: "London", baseUrl: "https://pa.hackney.gov.uk/online-applications" },
  { id: "wandsworth", name: "London Borough of Wandsworth", region: "London", baseUrl: "https://planning1.wandsworth.gov.uk/Northgate/PlanningExplorer/" },
  { id: "redbridge", name: "London Borough of Redbridge", region: "London", baseUrl: "https://planning.redbridge.gov.uk/online-applications" },
  { id: "haringey", name: "London Borough of Haringey", region: "London", baseUrl: "https://www.planningservices.haringey.gov.uk/portal/servlets/ApplicationSearchServlet" },
  // South East — data centres + science:
  { id: "bracknell", name: "Bracknell Forest", region: "South East", baseUrl: "https://planapps.bracknell-forest.gov.uk/online-applications" },
  { id: "windsor-maidenhead", name: "Windsor and Maidenhead", region: "South East", baseUrl: "https://publicaccess.rbwm.gov.uk/online-applications" },
  { id: "wokingham", name: "Wokingham", region: "South East", baseUrl: "https://planning.wokingham.gov.uk/online-applications" },
  { id: "south-oxfordshire", name: "South Oxfordshire", region: "South East", baseUrl: "https://data.southoxon.gov.uk/ccm/support/Main.jsp" },
  { id: "vale-of-white-horse", name: "Vale of White Horse", region: "South East", baseUrl: "https://data.whitehorsedc.gov.uk/" },
  { id: "tunbridge-wells", name: "Tunbridge Wells", region: "South East", baseUrl: "https://twbcpa.midkent.gov.uk/online-applications" },
  { id: "tonbridge-malling", name: "Tonbridge and Malling", region: "South East", baseUrl: "https://publicaccess.tmbc.gov.uk/online-applications" },
  { id: "ashford", name: "Ashford", region: "South East", baseUrl: "https://planning.ashford.gov.uk/online-applications" },
  { id: "dover", name: "Dover", region: "South East", baseUrl: "https://publicaccess.dover.gov.uk/online-applications" },
  { id: "swale", name: "Swale", region: "South East", baseUrl: "https://pa.midkent.gov.uk/online-applications" },
  { id: "maidstone", name: "Maidstone", region: "South East", baseUrl: "https://pa.midkent.gov.uk/online-applications-mbc" },
  { id: "thanet", name: "Thanet", region: "South East", baseUrl: "https://publicaccess.thanet.gov.uk/online-applications" },
  { id: "winchester", name: "Winchester", region: "South East", baseUrl: "https://planning.winchester.gov.uk/online-applications" },
  { id: "test-valley", name: "Test Valley", region: "South East", baseUrl: "https://planning.testvalley.gov.uk/online-applications" },
  { id: "new-forest", name: "New Forest", region: "South East", baseUrl: "https://planning.newforest.gov.uk/online-applications" },
  // East of England:
  { id: "south-cambs", name: "South Cambridgeshire (legacy)", region: "East of England", baseUrl: "https://applications.scambs.gov.uk/online-applications" },
  { id: "north-herts", name: "North Hertfordshire", region: "East of England", baseUrl: "https://pa2.north-herts.gov.uk/online-applications" },
  { id: "stevenage", name: "Stevenage", region: "East of England", baseUrl: "https://publicaccess.stevenage.gov.uk/online-applications" },
  { id: "watford", name: "Watford", region: "East of England", baseUrl: "https://pa.watford.gov.uk/online-applications" },
  { id: "central-bedfordshire", name: "Central Bedfordshire", region: "East of England", baseUrl: "https://plan.centralbedfordshire.gov.uk/online-applications" },
  { id: "bedford", name: "Bedford Borough", region: "East of England", baseUrl: "https://www.bedford.gov.uk/planning-and-building/planning-applications/online-applications" },
  { id: "luton", name: "Luton Borough", region: "East of England", baseUrl: "https://m.luton.gov.uk/online-applications" },
  { id: "huntingdonshire", name: "Huntingdonshire", region: "East of England", baseUrl: "https://publicaccess.huntingdonshire.gov.uk/online-applications" },
  { id: "east-cambridgeshire", name: "East Cambridgeshire", region: "East of England", baseUrl: "https://pa.eastcambs.gov.uk/online-applications" },
  { id: "fenland", name: "Fenland", region: "East of England", baseUrl: "https://publicaccess.fenland.gov.uk/publicaccess" },
  // West Midlands:
  { id: "warwick", name: "Warwick District", region: "West Midlands", baseUrl: "https://planningdocuments.warwickdc.gov.uk/PADOCSAdvanced" },
  { id: "stratford-upon-avon", name: "Stratford-on-Avon", region: "West Midlands", baseUrl: "https://apps.stratford.gov.uk/eplanning" },
  { id: "wyre-forest", name: "Wyre Forest", region: "West Midlands", baseUrl: "https://publicaccess.wyreforestdc.gov.uk/online-applications" },
  { id: "shropshire", name: "Shropshire", region: "West Midlands", baseUrl: "https://pa.shropshire.gov.uk/online-applications" },
  { id: "north-warwickshire", name: "North Warwickshire", region: "West Midlands", baseUrl: "https://planning.northwarks.gov.uk/online-applications" },
  // East Midlands — solar + warehouses:
  { id: "south-holland", name: "South Holland", region: "East Midlands", baseUrl: "https://www.sholland.gov.uk/article/4232/Planning-application-search" },
  { id: "boston", name: "Boston Borough", region: "East Midlands", baseUrl: "https://www.boston.gov.uk/article/13196/Planning-application-search" },
  { id: "north-kesteven", name: "North Kesteven", region: "East Midlands", baseUrl: "https://planningonline.n-kesteven.gov.uk/online-applications" },
  { id: "rutland", name: "Rutland", region: "East Midlands", baseUrl: "https://publicaccess.rutland.gov.uk/online-applications" },
  { id: "harborough", name: "Harborough", region: "East Midlands", baseUrl: "https://pa2.harborough.gov.uk/online-applications" },
  { id: "blaby", name: "Blaby", region: "East Midlands", baseUrl: "https://pa2.blaby.gov.uk/online-applications" },
  // Yorkshire & Humber:
  { id: "harrogate", name: "Harrogate (now North Yorkshire)", region: "Yorkshire & Humber", baseUrl: "https://uniformonline.harrogate.gov.uk/online-applications" },
  { id: "leeds", name: "Leeds City", region: "Yorkshire & Humber", baseUrl: "https://publicaccess.leeds.gov.uk/online-applications" },
  { id: "bradford", name: "Bradford", region: "Yorkshire & Humber", baseUrl: "https://www.bradford.gov.uk/planning-and-building-control/search-planning-applications" },
  { id: "wakefield", name: "Wakefield", region: "Yorkshire & Humber", baseUrl: "https://planning.wakefield.gov.uk/online-applications" },
  // North West — Manchester, Liverpool BTR:
  { id: "liverpool", name: "Liverpool City", region: "North West", baseUrl: "https://lcc.publicaccess.liverpool.gov.uk/online-applications" },
  { id: "wirral", name: "Wirral", region: "North West", baseUrl: "https://planning.wirral.gov.uk/online-applications" },
  { id: "warrington", name: "Warrington", region: "North West", baseUrl: "https://publicaccess.warrington.gov.uk/online-applications" },
  { id: "stockport", name: "Stockport", region: "North West", baseUrl: "https://planning.stockport.gov.uk/PlanningData-live/applicationDetails.do" },
  { id: "trafford", name: "Trafford", region: "North West", baseUrl: "https://publicaccess.trafford.gov.uk/online-applications" },
  // South West (in case):
  { id: "bristol", name: "Bristol City", region: "South West", baseUrl: "https://pa.bristol.gov.uk/online-applications" },
  { id: "bath-ne-somerset", name: "Bath and NE Somerset", region: "South West", baseUrl: "https://www.bathnes.gov.uk/services/planning-and-building-control/find-planning-application" },
];

const UA =
  "FabrickPlanningExplorer/0.1 (+https://fabrick-sustainability-hub.vercel.app) " +
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface ProbeResult {
  candidate: Candidate;
  reachable: boolean;
  isIdoxClassic: boolean;
  baseUrlNormalised: string;
  detail: string;
}

async function probeOne(c: Candidate): Promise<ProbeResult> {
  // Normalise: strip trailing /online-applications if present, then add back.
  let base = c.baseUrl.replace(/\/$/, "");
  if (base.endsWith("/online-applications")) base = base.slice(0, -"/online-applications".length);
  const probeUrl = `${base}/online-applications/`;

  try {
    const res = await fetch(probeUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return {
        candidate: c,
        reachable: true,
        isIdoxClassic: false,
        baseUrlNormalised: base,
        detail: `HTTP ${res.status}`,
      };
    }
    const html = await res.text();
    // Markers of classic Idox PA Struts portal.
    const isIdox =
      /online-applications-skin/i.test(html) &&
      /searchType=Application/i.test(html) &&
      /simpleSearch|advancedSearch|weeklyList/i.test(html);
    return {
      candidate: c,
      reachable: true,
      isIdoxClassic: isIdox,
      baseUrlNormalised: base,
      detail: isIdox ? "idox-classic" : "200 but not idox-classic",
    };
  } catch (err) {
    return {
      candidate: c,
      reachable: false,
      isIdoxClassic: false,
      baseUrlNormalised: base,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  console.log(`Probing ${CANDIDATES.length} candidate LPAs...\n`);

  const CONCURRENCY = 8;
  const results: ProbeResult[] = [];
  for (let i = 0; i < CANDIDATES.length; i += CONCURRENCY) {
    const batch = CANDIDATES.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(probeOne));
    for (const r of batchResults) {
      const marker = r.isIdoxClassic ? "✓ idox" : r.reachable ? "·" : "✗";
      console.log(`  ${marker}  ${r.candidate.name.padEnd(40)} ${r.detail}`);
      results.push(r);
    }
  }

  const idoxClassic = results.filter((r) => r.isIdoxClassic);
  console.log(`\n--- Idox-classic matches: ${idoxClassic.length} ---\n`);
  console.log("Add these to LPAS in scripts/scrape-lpa.ts and LPA_BASE in scripts/fetch-docs.ts:\n");
  for (const r of idoxClassic) {
    console.log(`  ${r.candidate.id}: {`);
    console.log(`    id: "${r.candidate.id}",`);
    console.log(`    name: "${r.candidate.name}",`);
    console.log(`    baseUrl: "${r.baseUrlNormalised}",`);
    console.log(`    region: "${r.candidate.region}",`);
    console.log(`  },`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
