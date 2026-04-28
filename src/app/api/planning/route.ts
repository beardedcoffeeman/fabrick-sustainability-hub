import { NextRequest, NextResponse } from "next/server";

const PLANNING_API_BASE = "https://www.planning.data.gov.uk";

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
  category: "commercial" | "residential" | "mixed" | "other" | "unclassified";
}

// Per-category in-memory cache
const cache = new Map<Category, { data: unknown; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour
const POOL_SIZE = 500; // raw rows pulled from upstream
const RESULT_LIMIT = 40; // apps returned per category

// Mapping of MHCLG planning development classification codes (from the
// PS1/PS2 returns) to broad categories. The development-classification field
// returns a URI such as
// http://opendatacommunities.org/def/concept/planning/application/6000/6014.
// Most entities are unclassified upstream - we treat those as "other".
// ESD service codes (id.esd.org.uk/service/...) are tree work / non-material
// amendments and are also bucketed as "other".
const CODE_MAP: Record<string, "commercial" | "residential" | "mixed" | "other"> = {
  // Major / minor residential
  "6001": "residential",
  "6002": "residential",
  "6007": "residential",
  "6014": "residential",
  "6031": "residential",
  // Major / minor commercial, industrial, retail, advertisement consent
  "6003": "commercial",
  "6004": "commercial",
  "6008": "commercial",
  "6009": "commercial",
  "6012": "commercial",
  "6013": "commercial",
  "6015": "commercial",
  // Mixed-use major / minor
  "6005": "mixed",
  "6006": "mixed",
  "6010": "mixed",
  // Listed Building Consent / heritage / lawful dev cert misc
  "6016": "other",
  "6017": "other",
};

function classify(uri: string | undefined): PlanningApplication["category"] {
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

async function fetchOrganisationNames(
  orgIds: string[]
): Promise<Record<string, string>> {
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
      if (result.status === "fulfilled") {
        names[result.value.id] = result.value.name;
      }
    }
  }

  return names;
}

function parseCategory(raw: string | null): Category {
  if (raw === "residential" || raw === "mixed" || raw === "all") return raw;
  return "commercial";
}

export async function GET(request: NextRequest) {
  try {
    const category = parseCategory(request.nextUrl.searchParams.get("category"));

    const cached = cache.get(category);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Fetch the latest entries from the dataset. The upstream API does not
    // support server-side filtering by development-classification, so we pull
    // a larger pool and filter locally.
    const countRes = await fetch(
      `${PLANNING_API_BASE}/entity.json?dataset=planning-application&limit=1`,
      { next: { revalidate: 3600 } }
    );

    if (!countRes.ok) {
      throw new Error("Planning API error fetching count");
    }

    const countData = await countRes.json();
    const totalCount: number = countData.count || 0;

    const offset = Math.max(0, totalCount - POOL_SIZE);

    const res = await fetch(
      `${PLANNING_API_BASE}/entity.json?dataset=planning-application&limit=${POOL_SIZE}&offset=${offset}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error("Planning API error fetching applications");
    }

    const data = await res.json();
    const entities: PlanningEntity[] = data.entities || [];

    // Annotate with category, then filter to the requested view
    const annotated = entities.map((entity) => ({
      entity,
      category: classify(entity["development-classification"]),
    }));

    const filtered = annotated.filter(({ category: cat }) => {
      if (category === "all") return cat !== "unclassified";
      return cat === category;
    });

    // Sort newest first, then trim
    const sorted = filtered.sort((a, b) => {
      const dateA =
        a.entity["decision-date"] || a.entity["start-date"] || a.entity["entry-date"];
      const dateB =
        b.entity["decision-date"] || b.entity["start-date"] || b.entity["entry-date"];
      return dateB.localeCompare(dateA);
    });

    const trimmed = sorted.slice(0, RESULT_LIMIT);

    const orgIds = trimmed
      .map(({ entity }) => entity["organisation-entity"])
      .filter(Boolean);
    const orgNames = await fetchOrganisationNames(orgIds);

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
        orgNames[entity["organisation-entity"]] ||
        `Authority ${entity["organisation-entity"]}`,
      address: entity["address-text"] || null,
      documentationUrl: entity["documentation-url"] || null,
      coordinates: parsePoint(entity.point),
      category: cat,
    }));

    // Summary stats are derived from the filtered set so the dashboard
    // matches the active tab.
    const decided = applications.filter((a) => a.decision !== "Pending");
    const approved = applications.filter((a) => a.decision === "Approved");
    const refused = applications.filter((a) => a.decision === "Refused");

    // Pool-level breakdown lets the UI quote how prevalent each category is
    // in the latest batch from upstream.
    const breakdown = {
      commercial: 0,
      residential: 0,
      mixed: 0,
      other: 0,
      unclassified: 0,
    };
    for (const { category: cat } of annotated) {
      breakdown[cat] += 1;
    }

    const responseData = {
      applications,
      summary: {
        total: applications.length,
        decided: decided.length,
        approved: approved.length,
        refused: refused.length,
        pending: applications.length - decided.length,
        approvalRate:
          decided.length > 0
            ? Math.round((approved.length / decided.length) * 100)
            : 0,
        totalInDataset: totalCount,
        poolSize: entities.length,
        matchedInPool: filtered.length,
        breakdown,
        category,
      },
      lastUpdated: new Date().toISOString(),
    };

    cache.set(category, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Planning API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch planning application data" },
      { status: 500 }
    );
  }
}
