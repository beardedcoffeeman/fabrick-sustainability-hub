import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { loadApplications, getDatasetCounts, type Application } from "@/lib/planning";

const PLANNING_API_BASE = "https://www.planning.data.gov.uk";

// ──────────────────────────────────────────────────
// Planning activity feed
// ──────────────────────────────────────────────────
// Primary: planning.data.gov.uk `planning-application` entities (live).
// Fallback: Pulse's own Planning Explorer dataset (bundled JSON, refreshed
//   monthly by refresh-planning-explorer.yml).
//
// The fallback exists because in 2025 MHCLG withdrew the upstream
// application dataset as "incomplete and not yet ready for use": the entity
// count dropped to 0 and the CSV returns 403. From then until October 2026
// this dashboard silently showed zero applications. If upstream comes back
// with a real pool it is used automatically again.
// ──────────────────────────────────────────────────

interface PlanningEntity {
  entity: number;
  reference: string;
  description: string;
  "entry-date": string;
  "start-date": string;
  "end-date": string;
  "decision-date": string;
  "planning-decision"?: string;
  "planning-decision-type"?: string;
  "address-text"?: string;
  "documentation-url"?: string;
  "organisation-entity": string;
  "development-classification"?: string;
  point?: string;
}

interface OrganisationEntity {
  entity: number;
  name: string;
}

type Category = "commercial" | "residential" | "mixed" | "all";
type AppCategory = "commercial" | "residential" | "mixed" | "other" | "unclassified";

interface PlanningApplication {
  id: number;
  reference: string;
  description: string;
  decision: string;
  decisionType: string;
  decisionDate: string | null;
  startDate: string | null;
  entryDate: string;
  localAuthority: string;
  address: string | null;
  documentationUrl: string | null;
  coordinates: { lat: number; lng: number } | null;
  category: AppCategory;
  /** Present on fallback rows only: the Pulse sector label. */
  sector?: string;
  applicant?: string;
}

interface DataSource {
  mode: "upstream" | "pulse-dataset";
  name: string;
  url: string;
  note: string;
  lastRefreshed: string;
}

// Per-category in-memory cache
const cache = new Map<Category, { data: unknown; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour
const POOL_SIZE = 500; // raw rows pulled from upstream
const RESULT_LIMIT = 40; // apps returned per category
// Below this many upstream rows we treat the feed as withdrawn/empty.
const MIN_UPSTREAM_POOL = 50;

// Mapping of MHCLG planning development classification codes (from the
// PS1/PS2 returns) to broad categories. The development-classification field
// returns a URI such as
// http://opendatacommunities.org/def/concept/planning/application/6000/6014.
const CODE_MAP: Record<string, "commercial" | "residential" | "mixed" | "other"> = {
  "6001": "residential",
  "6002": "residential",
  "6007": "residential",
  "6014": "residential",
  "6031": "residential",
  "6003": "commercial",
  "6004": "commercial",
  "6008": "commercial",
  "6009": "commercial",
  "6012": "commercial",
  "6013": "commercial",
  "6015": "commercial",
  "6005": "mixed",
  "6006": "mixed",
  "6010": "mixed",
  "6016": "other",
  "6017": "other",
};

function classify(uri: string | undefined): AppCategory {
  if (!uri) return "unclassified";
  if (uri.includes("esd.org.uk")) return "other";
  const code = uri.split("/").pop() ?? "";
  return CODE_MAP[code] ?? "other";
}

function parsePoint(point: string | undefined): { lat: number; lng: number } | null {
  if (!point) return null;
  const match = point.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/);
  if (!match) return null;
  return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
}

function normaliseDecision(raw: string | undefined): string {
  if (!raw || raw === "") return "Pending";
  const lower = raw.toLowerCase();
  if (lower.includes("approve") || lower.includes("granted") || lower.includes("not required")) {
    return "Approved";
  }
  if (lower.includes("refuse") || lower.includes("rejected") || lower.includes("denied")) {
    return "Refused";
  }
  if (lower.includes("withdrawn")) return "Withdrawn";
  return "Pending";
}

async function fetchOrganisationNames(orgIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = [...new Set(orgIds)];
  const names: Record<string, string> = {};
  const batchSize = 10;
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const res = await fetch(`${PLANNING_API_BASE}/entity/${id}.json`, {
          next: { revalidate: 86400 },
        });
        if (!res.ok) return { id, name: `Authority ${id}` };
        const data: OrganisationEntity = await res.json();
        return { id, name: data.name || `Authority ${id}` };
      })
    );
    for (const result of results) {
      if (result.status === "fulfilled") names[result.value.id] = result.value.name;
    }
  }
  return names;
}

function parseCategory(raw: string | null): Category {
  if (raw === "residential" || raw === "mixed" || raw === "all") return raw;
  return "commercial";
}

function summarise(
  applications: PlanningApplication[],
  annotatedCategories: AppCategory[],
  category: Category,
  totalInDataset: number
) {
  const decided = applications.filter((a) => a.decision !== "Pending");
  const approved = applications.filter((a) => a.decision === "Approved");
  const refused = applications.filter((a) => a.decision === "Refused");
  const breakdown = { commercial: 0, residential: 0, mixed: 0, other: 0, unclassified: 0 };
  for (const cat of annotatedCategories) breakdown[cat] += 1;
  const matched = annotatedCategories.filter((cat) =>
    category === "all" ? cat !== "unclassified" : cat === category
  ).length;
  return {
    total: applications.length,
    decided: decided.length,
    approved: approved.length,
    refused: refused.length,
    pending: applications.length - decided.length,
    approvalRate: decided.length > 0 ? Math.round((approved.length / decided.length) * 100) : 0,
    totalInDataset,
    poolSize: annotatedCategories.length,
    matchedInPool: matched,
    breakdown,
    category,
  };
}

// ── Upstream (planning.data.gov.uk) ───────────────────────────────────────

async function fetchUpstream(category: Category) {
  const countRes = await fetch(
    `${PLANNING_API_BASE}/entity.json?dataset=planning-application&limit=1`,
    { next: { revalidate: 3600 } }
  );
  if (!countRes.ok) throw new Error("Planning API error fetching count");
  const countData = await countRes.json();
  const totalCount: number = countData.count || 0;
  if (totalCount < MIN_UPSTREAM_POOL) return null;

  const offset = Math.max(0, totalCount - POOL_SIZE);
  const res = await fetch(
    `${PLANNING_API_BASE}/entity.json?dataset=planning-application&limit=${POOL_SIZE}&offset=${offset}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("Planning API error fetching applications");
  const data = await res.json();
  const entities: PlanningEntity[] = data.entities || [];
  if (entities.length < MIN_UPSTREAM_POOL) return null;

  const annotated = entities.map((entity) => ({
    entity,
    category: classify(entity["development-classification"]),
  }));
  const filtered = annotated.filter(({ category: cat }) =>
    category === "all" ? cat !== "unclassified" : cat === category
  );
  const sorted = filtered.sort((a, b) => {
    const dateA = a.entity["decision-date"] || a.entity["start-date"] || a.entity["entry-date"];
    const dateB = b.entity["decision-date"] || b.entity["start-date"] || b.entity["entry-date"];
    return dateB.localeCompare(dateA);
  });
  const trimmed = sorted.slice(0, RESULT_LIMIT);
  const orgNames = await fetchOrganisationNames(
    trimmed.map(({ entity }) => entity["organisation-entity"]).filter(Boolean)
  );

  const applications: PlanningApplication[] = trimmed.map(({ entity, category: cat }) => ({
    id: entity.entity,
    reference: entity.reference,
    description: entity.description || "No description available",
    decision: normaliseDecision(entity["planning-decision"]),
    decisionType: entity["planning-decision-type"] || "",
    decisionDate: entity["decision-date"] || null,
    startDate: entity["start-date"] || null,
    entryDate: entity["entry-date"],
    localAuthority:
      orgNames[entity["organisation-entity"]] || `Authority ${entity["organisation-entity"]}`,
    address: entity["address-text"] || null,
    documentationUrl: entity["documentation-url"] || null,
    coordinates: parsePoint(entity.point),
    category: cat,
  }));

  const dataSource: DataSource = {
    mode: "upstream",
    name: "Planning Data England",
    url: "https://www.planning.data.gov.uk",
    note: "Live feed of planning applications published by English local planning authorities via planning.data.gov.uk (MHCLG). Categorised using the MHCLG development classification codes.",
    lastRefreshed: new Date().toISOString(),
  };

  return {
    applications,
    summary: summarise(applications, annotated.map((a) => a.category), category, totalCount),
    dataSource,
    lastUpdated: new Date().toISOString(),
  };
}

// ── Fallback (Pulse Planning Explorer dataset) ────────────────────────────

const SECTOR_TO_CATEGORY: Record<Application["sector"], AppCategory> = {
  "btr-pbsa": "residential",
  "mixed-use": "mixed",
  "data-centre": "commercial",
  logistics: "commercial",
  healthcare: "commercial",
  education: "commercial",
  "renewable-energy": "commercial",
  hotels: "commercial",
};

const SECTOR_LABEL: Record<Application["sector"], string> = {
  "data-centre": "Data centres",
  logistics: "Logistics & warehousing",
  "btr-pbsa": "BTR / PBSA",
  healthcare: "Healthcare",
  education: "Education",
  "renewable-energy": "Renewable energy & BESS",
  hotels: "Hotels & hospitality",
  "mixed-use": "Mixed-use major regen",
};

function numericId(id: string): number {
  // Widget keys rows by a numeric id; derive a stable one from the string id.
  return parseInt(createHash("sha1").update(id).digest("hex").slice(0, 12), 16);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let fallbackApps: Application[] | null = null;

function buildFallback(category: Category) {
  if (!fallbackApps) fallbackApps = loadApplications();
  const counts = getDatasetCounts();
  const annotated = fallbackApps.map((a) => ({ app: a, category: SECTOR_TO_CATEGORY[a.sector] }));
  const filtered = annotated.filter(({ category: cat }) =>
    category === "all" ? true : cat === category
  );
  const sorted = filtered.sort((x, y) =>
    (y.app.decisionDate || "").localeCompare(x.app.decisionDate || "")
  );
  const trimmed = sorted.slice(0, RESULT_LIMIT);

  const applications: PlanningApplication[] = trimmed.map(({ app, category: cat }) => ({
    id: numericId(app.id),
    reference: app.reference,
    description: app.description || "No description available",
    decision: capitalise(app.decision),
    decisionType: "",
    decisionDate: app.decisionDate || null,
    startDate: null,
    entryDate: app.decisionDate || "",
    localAuthority: app.lpa,
    address: app.address || null,
    documentationUrl: app.sourceUrl ?? null,
    coordinates: null,
    category: cat,
    sector: SECTOR_LABEL[app.sector],
    applicant: app.applicant || undefined,
  }));

  const dataSource: DataSource = {
    mode: "pulse-dataset",
    name: "Pulse Planning Explorer dataset",
    url: "/research/planning-explorer",
    note: `Planning Data England's application feed is currently empty (MHCLG withdrew it as incomplete), so this view is served from Pulse's own dataset: ${counts.total.toLocaleString()} applications across ${counts.lpas.length} local planning authorities, built from planning.data.gov.uk archives and direct LPA-portal feeds, refreshed monthly.`,
    lastRefreshed: counts.lastRefreshed,
  };

  return {
    applications,
    summary: summarise(applications, annotated.map((a) => a.category), category, fallbackApps.length),
    dataSource,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const category = parseCategory(request.nextUrl.searchParams.get("category"));

  const cached = cache.get(category);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  let responseData: unknown = null;
  try {
    responseData = await fetchUpstream(category);
  } catch (error) {
    console.warn("Planning upstream failed, using Pulse dataset:", error);
  }
  if (!responseData) {
    try {
      responseData = buildFallback(category);
    } catch (error) {
      console.error("Planning fallback failed:", error);
      return NextResponse.json(
        { error: "Failed to fetch planning application data" },
        { status: 500 }
      );
    }
  }

  cache.set(category, { data: responseData, timestamp: Date.now() });
  return NextResponse.json(responseData);
}
