import { NextRequest, NextResponse } from "next/server";
import { searchEpcByPostcode, type MHCLGRow } from "@/lib/epc-live";

// In-memory cache: postcode -> { data, timestamp }
const cache = new Map<string, { data: EPCResult; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// The MHCLG fetch itself lives in src/lib/epc-live.ts (shared with Ask Pulse,
// which never uses the sample fallback below).

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

  const found = await searchEpcByPostcode(postcode, token);

  // The MHCLG API returns 404 "No certificates could be found for that query"
  // for valid-but-empty postcodes. That is a real "no results" signal, not
  // an error - render an empty result.
  if (found.kind === "none") {
    const empty: EPCResult = {
      certificates: [],
      postcode: normalised,
      totalResults: 0,
      isSampleData: false,
    };
    cache.set(normalised, { data: empty, timestamp: Date.now() });
    return NextResponse.json(empty);
  }

  if (found.kind === "http-error") {
    console.error(`EPC API error ${found.status} ${found.statusText}`);
    return NextResponse.json(
      { error: "EPC service unavailable", status: found.status },
      { status: 502 }
    );
  }

  if (found.kind === "fetch-error") {
    console.error("EPC API fetch error:", found.error);
    return NextResponse.json(
      { error: "EPC service unavailable" },
      { status: 502 }
    );
  }

  const result: EPCResult = {
    certificates: mapAPIResponse(found.rows),
    postcode: normalised,
    totalResults: found.totalResults,
    isSampleData: false,
  };

  cache.set(normalised, { data: result, timestamp: Date.now() });
  return NextResponse.json(result);
}
