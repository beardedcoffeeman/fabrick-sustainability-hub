import { NextRequest, NextResponse } from "next/server";

// In-memory cache: postcode -> { data, timestamp }
const cache = new Map<string, { data: EPCResult; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// MHCLG "Get Energy Performance of Buildings Data" API
// Docs: https://get-energy-performance-data.communities.gov.uk/api-technical-documentation
const EPC_API_BASE =
  "https://api.get-energy-performance-data.communities.gov.uk";

interface EPCCertificate {
  address: string;
  currentRating: string;
  potentialRating: string;
  sapScore: number;
  propertyType: string;
  floorArea: number;
  heatingType: string;
  wallConstruction: string;
  certificateDate: string;
  currentEnergyEfficiency: number;
  potentialEnergyEfficiency: number;
  // UPRN lets the client dedupe re-registrations of the same property
  // (one UPRN can have several certificates over time - we want the latest).
  uprn: number | null;
}

interface EPCResult {
  certificates: EPCCertificate[];
  postcode: string;
  totalResults: number;
  isSampleData: boolean;
}

// New API response shape (lean - search endpoint)
interface MHCLGRow {
  certificateNumber: string;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  addressLine4: string | null;
  postcode: string;
  postTown: string | null;
  council: string | null;
  constituency: string | null;
  currentEnergyEfficiencyBand: string;
  registrationDate: string;
  uprn: number | null;
}

function buildAddress(row: MHCLGRow): string {
  const parts = [
    row.addressLine1,
    row.addressLine2,
    row.addressLine3,
    row.addressLine4,
    row.postTown,
    row.postcode,
  ]
    .filter(Boolean)
    .map((s) => s?.trim());
  return parts.join(", ") || "Address unavailable";
}

/**
 * The new MHCLG search endpoint returns only the band letter + address +
 * registration date. SAP score, potential rating, property type, floor area,
 * heating and wall construction are not included. We populate the legacy
 * widget shape with the data we do have, and zero/empty for the rest. The
 * widget hides fields with empty/zero values.
 */
function mapAPIResponse(rows: MHCLGRow[]): EPCCertificate[] {
  return rows.map((row) => ({
    address: buildAddress(row),
    currentRating: row.currentEnergyEfficiencyBand || "Unknown",
    potentialRating: "",
    sapScore: 0,
    propertyType: "",
    floorArea: 0,
    heatingType: "",
    wallConstruction: "",
    certificateDate: row.registrationDate || "",
    currentEnergyEfficiency: 0,
    potentialEnergyEfficiency: 0,
    uprn: row.uprn,
  }));
}

function generateSampleData(postcode: string): EPCResult {
  // Used only when EPC_API_TOKEN is missing (local dev without env file).
  // Real production calls should never reach this path.
  const ratings = ["B", "C", "C", "D", "D", "D", "E"];
  const certificates: EPCCertificate[] = ratings.map((rating, i) => ({
    address: `${i + 1} Sample Street, ${postcode.toUpperCase()}`,
    currentRating: rating,
    potentialRating: "",
    sapScore: 0,
    propertyType: "",
    floorArea: 0,
    heatingType: "",
    wallConstruction: "",
    certificateDate: "2024-01-01",
    currentEnergyEfficiency: 0,
    potentialEnergyEfficiency: 0,
    uprn: null,
  }));
  return {
    certificates,
    postcode: postcode.toUpperCase(),
    totalResults: certificates.length,
    isSampleData: true,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");

  if (!postcode) {
    return NextResponse.json(
      { error: "Postcode query parameter is required" },
      { status: 400 }
    );
  }

  const normalised = postcode.replace(/\s+/g, "").toUpperCase();

  const cached = cache.get(normalised);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const token = process.env.EPC_API_TOKEN;

  if (!token) {
    const sample = generateSampleData(normalised);
    cache.set(normalised, { data: sample, timestamp: Date.now() });
    return NextResponse.json(sample);
  }

  try {
    // Page size 500 covers virtually any UK postcode (avg ~15 properties).
    // Larger sample = better band-distribution stats for the retrofit-market
    // headline metric (% below band C).
    const url = `${EPC_API_BASE}/api/domestic/search?postcode=${encodeURIComponent(
      postcode.trim()
    )}&page_size=500`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 3600 },
    });

    // The MHCLG API returns 404 "No certificates could be found for that query"
    // for valid-but-empty postcodes. That is a real "no results" signal, not
    // an error - render an empty result.
    if (res.status === 404) {
      const empty: EPCResult = {
        certificates: [],
        postcode: normalised,
        totalResults: 0,
        isSampleData: false,
      };
      cache.set(normalised, { data: empty, timestamp: Date.now() });
      return NextResponse.json(empty);
    }

    if (!res.ok) {
      console.error(`EPC API error ${res.status} ${res.statusText}`);
      return NextResponse.json(
        { error: "EPC service unavailable", status: res.status },
        { status: 502 }
      );
    }

    const json = await res.json();
    const rows: MHCLGRow[] = Array.isArray(json.data) ? json.data : [];
    const totalResults: number = json.pagination?.totalRecords ?? rows.length;

    const result: EPCResult = {
      certificates: mapAPIResponse(rows),
      postcode: normalised,
      totalResults,
      isSampleData: false,
    };

    cache.set(normalised, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (error) {
    console.error("EPC API fetch error:", error);
    return NextResponse.json(
      { error: "EPC service unavailable" },
      { status: 502 }
    );
  }
}
