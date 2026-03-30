import { NextResponse } from "next/server";

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
}

// In-memory cache
let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

function parsePoint(point: string | undefined): { lat: number; lng: number } | null {
  if (!point) return null;
  // Format: "POINT (lng lat)"
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

  // Fetch in parallel, batched to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const res = await fetch(`${PLANNING_API_BASE}/entity/${id}.json`, {
          next: { revalidate: 86400 }, // Cache org names for 24 hours
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

export async function GET() {
  try {
    // Return cached data if still fresh
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    // Fetch recent planning applications (latest entries, near end of dataset)
    // First get the total count, then fetch from near the end for the most recent
    const countRes = await fetch(
      `${PLANNING_API_BASE}/entity.json?dataset=planning-application&limit=1`,
      { next: { revalidate: 3600 } }
    );

    if (!countRes.ok) {
      throw new Error("Planning API error fetching count");
    }

    const countData = await countRes.json();
    const totalCount: number = countData.count || 0;

    // Fetch the last 40 entries (the most recently added)
    const fetchLimit = 40;
    const offset = Math.max(0, totalCount - fetchLimit);

    const res = await fetch(
      `${PLANNING_API_BASE}/entity.json?dataset=planning-application&limit=${fetchLimit}&offset=${offset}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      throw new Error("Planning API error fetching applications");
    }

    const data = await res.json();
    const entities: PlanningEntity[] = data.entities || [];

    // Fetch organisation names for all referenced authorities
    const orgIds = entities.map((e) => e["organisation-entity"]).filter(Boolean);
    const orgNames = await fetchOrganisationNames(orgIds);

    // Transform and sort by most recent first
    const applications: PlanningApplication[] = entities
      .map((entity) => ({
        id: entity.entity,
        reference: entity.reference,
        description: entity.description || "No description available",
        decision: normaliseDecision(entity["planning-decision"]),
        decisionType: entity["planning-decision-type"] || "",
        decisionDate: entity["decision-date"] || null,
        startDate: entity["start-date"] || null,
        entryDate: entity["entry-date"],
        localAuthority: orgNames[entity["organisation-entity"]] || `Authority ${entity["organisation-entity"]}`,
        address: entity["address-text"] || null,
        documentationUrl: entity["documentation-url"] || null,
        coordinates: parsePoint(entity.point),
      }))
      .sort((a, b) => {
        // Sort by decision date (most recent first), then by start date, then entry date
        const dateA = a.decisionDate || a.startDate || a.entryDate;
        const dateB = b.decisionDate || b.startDate || b.entryDate;
        return dateB.localeCompare(dateA);
      });

    // Compute summary stats
    const decided = applications.filter((a) => a.decision !== "Pending");
    const approved = applications.filter((a) => a.decision === "Approved");
    const refused = applications.filter((a) => a.decision === "Refused");

    const responseData = {
      applications,
      summary: {
        total: applications.length,
        decided: decided.length,
        approved: approved.length,
        refused: refused.length,
        pending: applications.length - decided.length,
        approvalRate: decided.length > 0
          ? Math.round((approved.length / decided.length) * 100)
          : 0,
        totalInDataset: totalCount,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Update cache
    cache = { data: responseData, timestamp: Date.now() };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Planning API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch planning application data" },
      { status: 500 }
    );
  }
}
