/**
 * Idox Public Access adapter.
 *
 * Given a base URL for a UK LPA running Idox Public Access (the dominant
 * portal software, ~250 councils), this adapter can:
 *
 *   - Search applications by description text + decision date range
 *   - Paginate through results
 *   - Visit each application's summary page to extract structured metadata
 *
 * What it does NOT do (yet):
 *
 *   - Download decision-notice PDFs. Most modern Idox installs serve the
 *     document list via AJAX from an external document store. Reverse-
 *     engineering each council's doc endpoint, or using Playwright to render
 *     the page, is a per-portal job that lives in a follow-up. The Claude
 *     extractor pipeline (scripts/extract-pdfs.ts) accepts dropped PDFs
 *     today and is unblocked the moment we wire a doc fetcher in.
 *
 *   - Extract applicants from the "Contacts" tab. Many LPAs redact this for
 *     data-protection reasons. Applicant names are best pulled from the
 *     decision-notice PDF header, which is what the Claude extractor
 *     already does.
 *
 * Politeness:
 *
 *   - 2-5 second jittered delay between requests
 *   - Identifies itself in the User-Agent string
 *   - In-memory + on-disk cache so re-runs don't re-hit the council's server
 *
 * Implements: classic Idox Struts-based Public Access (the most common
 * variant). Heavier JS-rendered Idox variants need a separate adapter.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const CACHE_DIR = join(PROJECT_ROOT, ".cache", "idox");

const UA =
  "FabrickPlanningExplorer/0.1 (+https://fabrick-sustainability-hub.vercel.app) " +
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface IdoxLpa {
  /** Short id used in cache paths and JSON output. */
  id: string;
  /** Human-readable LPA name. */
  name: string;
  /** Base origin including https://. No trailing slash. */
  baseUrl: string;
  /** Region for use in our application records. */
  region: string;
}

export interface IdoxSearchOpts {
  description: string;
  /** Inclusive date range. ISO YYYY-MM-DD. */
  decisionFrom: string;
  decisionTo: string;
}

export interface IdoxApplicationMetadata {
  keyVal: string;
  reference: string;
  applicationReceived: string;
  applicationValidated: string;
  address: string;
  proposal: string;
  status: string;
  decisionIssuedDate: string;
  decision: string;
  appealStatus: string;
  appealDecision: string;
  applicationType: string;
  applicantName: string;
  agentName: string;
  caseOfficer: string;
  ward: string;
  sourceUrl: string;
}

// ──────────────────────────────────────────────────────────────
// Networking with cache + politeness
// ──────────────────────────────────────────────────────────────

const cookieJar: Map<string, string> = new Map();

function cookieHeaderForOrigin(origin: string): string {
  const entries: string[] = [];
  for (const [k, v] of cookieJar.entries()) {
    if (k.startsWith(origin + "|")) entries.push(v);
  }
  return entries.join("; ");
}

function storeCookiesForOrigin(origin: string, setCookie: string[] | null) {
  if (!setCookie) return;
  for (const line of setCookie) {
    const [pair] = line.split(";", 1);
    if (!pair || !pair.includes("=")) continue;
    const [name] = pair.split("=", 1);
    cookieJar.set(`${origin}|${name}`, pair.trim());
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function politeFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const origin = new URL(url).origin;
  const headers = new Headers(init.headers);
  headers.set("User-Agent", UA);
  headers.set("Accept", "text/html,application/xhtml+xml");
  headers.set("Accept-Language", "en-GB,en;q=0.9");
  const cookies = cookieHeaderForOrigin(origin);
  if (cookies) headers.set("Cookie", cookies);

  // Retry on 429 with exponential backoff. Some LPAs (notably Greater
  // Cambridge) rate-limit aggressively; pausing 15s/30s/60s before giving up
  // recovers most of the hits we'd otherwise lose.
  let attempt = 0;
  const baseJitter = 2000 + Math.floor(Math.random() * 3000);
  await sleep(baseJitter);
  while (true) {
    const res = await fetch(url, {
      ...init,
      headers,
      redirect: "follow",
    });
    const setCookies = (
      res.headers as Headers & { getSetCookie?: () => string[] }
    ).getSetCookie?.();
    storeCookiesForOrigin(origin, setCookies ?? null);

    if (res.status !== 429 || attempt >= 3) return res;
    attempt++;
    // Drain the body so the connection can be released.
    await res.text().catch(() => "");
    const wait = 15_000 * attempt;
    console.warn(`    rate-limited (429), waiting ${wait / 1000}s before retry...`);
    await sleep(wait);
  }
}

function cacheKey(url: string, body?: string): string {
  const h = createHash("sha256");
  h.update(url);
  if (body) h.update("\0" + body);
  return h.digest("hex").slice(0, 32);
}

async function cachedGet(url: string): Promise<string> {
  await mkdir(CACHE_DIR, { recursive: true });
  const path = join(CACHE_DIR, cacheKey(url) + ".html");
  if (existsSync(path)) {
    return readFile(path, "utf-8");
  }
  const res = await politeFetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} → ${res.status}`);
  }
  const text = await res.text();
  await writeFile(path, text);
  return text;
}

async function cachedPost(url: string, body: URLSearchParams): Promise<string> {
  await mkdir(CACHE_DIR, { recursive: true });
  const path = join(CACHE_DIR, cacheKey(url, body.toString()) + ".html");
  if (existsSync(path)) {
    return readFile(path, "utf-8");
  }
  const res = await politeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(`POST ${url} → ${res.status}`);
  }
  const text = await res.text();
  await writeFile(path, text);
  return text;
}

// ──────────────────────────────────────────────────────────────
// Session + CSRF bootstrapping
// ──────────────────────────────────────────────────────────────

async function getCsrf(lpa: IdoxLpa): Promise<string> {
  const url = `${lpa.baseUrl}/online-applications/search.do?action=advanced&searchType=Application`;
  const html = await politeFetchHtml(url);
  const $ = cheerio.load(html);
  const csrf = $('input[name="_csrf"]').attr("value") ?? "";
  if (!csrf) throw new Error(`No CSRF token from ${url}`);
  return csrf;
}

async function politeFetchHtml(url: string): Promise<string> {
  const res = await politeFetch(url);
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

// ──────────────────────────────────────────────────────────────
// Search
// ──────────────────────────────────────────────────────────────

/** Convert YYYY-MM-DD to DD/MM/YYYY (the format Idox forms expect). */
function ddmmyyyy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export async function searchApplications(
  lpa: IdoxLpa,
  opts: IdoxSearchOpts
): Promise<string[]> {
  const csrf = await getCsrf(lpa);
  const body = new URLSearchParams({
    _csrf: csrf,
    "searchCriteria.description": opts.description,
    "date(applicationDecisionStart)": ddmmyyyy(opts.decisionFrom),
    "date(applicationDecisionEnd)": ddmmyyyy(opts.decisionTo),
    searchType: "Application",
    action: "search",
  });
  const firstPageUrl = `${lpa.baseUrl}/online-applications/advancedSearchResults.do?action=firstPage`;
  const html = await cachedPost(firstPageUrl, body);

  const keyVals = new Set<string>();
  collectKeyVals(html, keyVals);

  // Follow pagination — links like "Next" / page numbers.
  let nextUrl = findNextPageUrl(html, lpa);
  let safety = 0;
  while (nextUrl && safety < 25) {
    const next = await cachedGet(nextUrl);
    collectKeyVals(next, keyVals);
    nextUrl = findNextPageUrl(next, lpa);
    safety++;
  }
  return Array.from(keyVals);
}

function collectKeyVals(html: string, out: Set<string>): void {
  // Match keyVal=ABC123 in detail links.
  for (const m of html.matchAll(
    /applicationDetails\.do\?[^"']*keyVal=([A-Z0-9]+)/g
  )) {
    out.add(m[1]);
  }
}

function findNextPageUrl(html: string, lpa: IdoxLpa): string | null {
  const $ = cheerio.load(html);
  // Idox pagination uses rel="next" sometimes, otherwise a link labelled "Next"
  const rel = $('a[rel="next"]').attr("href");
  if (rel) return new URL(rel, lpa.baseUrl).toString();
  const next = $("a.next, a.page-results.next").attr("href");
  if (next) return new URL(next, lpa.baseUrl).toString();
  // Fallback: scan anchors for "Next" text
  let found: string | null = null;
  $("a").each((_, el) => {
    if (found) return;
    const t = $(el).text().trim().toLowerCase();
    if (t === "next" || t === "next »" || t === ">") {
      const h = $(el).attr("href");
      if (h && /advancedSearchResults\.do/.test(h)) {
        found = new URL(h, lpa.baseUrl).toString();
      }
    }
  });
  return found;
}

// ──────────────────────────────────────────────────────────────
// Detail page parsing
// ──────────────────────────────────────────────────────────────


function parseFieldsTable(html: string): Map<string, string> {
  const $ = cheerio.load(html);
  const fields = new Map<string, string>();
  // Summary tab uses #simpleDetailsTable; Details tab uses #applicationDetails.
  // Both share the same <th>field</th><td>value</td> row shape.
  $("#simpleDetailsTable tr, #applicationDetails tr").each((_, row) => {
    const th = $(row).find("th").text().trim().replace(/\s+/g, " ");
    const td = $(row).find("td").text().trim().replace(/\s+/g, " ");
    if (th) fields.set(th, td);
  });
  return fields;
}

export async function fetchApplicationMetadata(
  lpa: IdoxLpa,
  keyVal: string
): Promise<IdoxApplicationMetadata> {
  const summaryUrl = `${lpa.baseUrl}/online-applications/applicationDetails.do?keyVal=${keyVal}&activeTab=summary`;
  const detailsUrl = `${lpa.baseUrl}/online-applications/applicationDetails.do?keyVal=${keyVal}&activeTab=details`;

  const summaryHtml = await cachedGet(summaryUrl);
  const summary = parseFieldsTable(summaryHtml);

  // The "details" tab is where Idox stores Decision, Applicant Name, Application
  // Type, Case Officer and Ward. Worth a second HTTP roundtrip per app.
  let details = new Map<string, string>();
  try {
    const detailsHtml = await cachedGet(detailsUrl);
    details = parseFieldsTable(detailsHtml);
  } catch (err) {
    console.warn(
      `      ! details tab fetch failed for ${keyVal}: ${
        err instanceof Error ? err.message : err
      }`
    );
  }

  const cleanNA = (v: string) =>
    v.toLowerCase() === "not available" ? "" : v;

  return {
    keyVal,
    reference: summary.get("Reference") ?? "",
    applicationReceived: summary.get("Application Received") ?? "",
    applicationValidated: summary.get("Application Validated") ?? "",
    address: summary.get("Address") ?? "",
    proposal: summary.get("Proposal") ?? "",
    status: summary.get("Status") ?? "",
    decisionIssuedDate: summary.get("Decision Issued Date") ?? "",
    decision: details.get("Decision") ?? summary.get("Decision") ?? "",
    appealStatus: summary.get("Appeal Status") ?? "",
    appealDecision: summary.get("Appeal Decision") ?? "",
    applicationType: details.get("Application Type") ?? "",
    applicantName: cleanNA(details.get("Applicant Name") ?? ""),
    agentName: cleanNA(details.get("Agent Name") ?? ""),
    caseOfficer: details.get("Case Officer") ?? "",
    ward: details.get("Ward") ?? "",
    sourceUrl: summaryUrl,
  };
}

// Convenience: search + hydrate metadata for every hit, sequentially with the
// polite delay baked into the network layer.
export async function searchAndHydrate(
  lpa: IdoxLpa,
  opts: IdoxSearchOpts
): Promise<IdoxApplicationMetadata[]> {
  const keyVals = await searchApplications(lpa, opts);
  console.log(`  ${lpa.name}: ${keyVals.length} matches for "${opts.description}"`);
  const out: IdoxApplicationMetadata[] = [];
  for (const k of keyVals) {
    try {
      out.push(await fetchApplicationMetadata(lpa, k));
    } catch (err) {
      console.warn(
        `    ! ${k}: ${err instanceof Error ? err.message : err}`
      );
    }
  }
  return out;
}
