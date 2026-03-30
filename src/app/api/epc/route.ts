import { NextRequest, NextResponse } from "next/server";

// In-memory cache: postcode -> { data, timestamp }
const cache = new Map<string, { data: EPCResult; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

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
}

interface EPCResult {
  certificates: EPCCertificate[];
  postcode: string;
  totalResults: number;
  isSampleData: boolean;
}

function generateSampleData(postcode: string): EPCResult {
  const ratings = ["B", "C", "C", "D", "D", "D", "E", "E", "C", "D", "F", "B", "C", "D", "E"];
  const propertyTypes = [
    "Detached house",
    "Semi-detached house",
    "Terraced house",
    "Flat",
    "Maisonette",
    "Bungalow",
    "End-terrace house",
  ];
  const heatingTypes = [
    "Mains gas - combi boiler",
    "Mains gas - regular boiler",
    "Electric storage heaters",
    "Air source heat pump",
    "Oil - regular boiler",
    "LPG - combi boiler",
  ];
  const wallTypes = [
    "Cavity wall, filled insulation",
    "Cavity wall, no insulation",
    "Solid brick, no insulation",
    "Solid brick, internal insulation",
    "Timber frame, insulated",
    "System built, partial insulation",
  ];
  const streets = [
    "High Street",
    "Church Lane",
    "Station Road",
    "Park Avenue",
    "Mill Lane",
    "The Crescent",
    "Elm Grove",
    "Oakfield Road",
  ];

  const sapScoreMap: Record<string, [number, number]> = {
    A: [92, 100],
    B: [81, 91],
    C: [69, 80],
    D: [55, 68],
    E: [39, 54],
    F: [21, 38],
    G: [1, 20],
  };

  const potentialBetter: Record<string, string[]> = {
    A: ["A"],
    B: ["A", "B"],
    C: ["A", "B", "C"],
    D: ["B", "C", "D"],
    E: ["C", "D"],
    F: ["C", "D", "E"],
    G: ["D", "E", "F"],
  };

  const certificates: EPCCertificate[] = ratings.map((rating, i) => {
    const [minSap, maxSap] = sapScoreMap[rating];
    const sapScore = Math.floor(Math.random() * (maxSap - minSap + 1)) + minSap;

    const potential =
      potentialBetter[rating][
        Math.floor(Math.random() * potentialBetter[rating].length)
      ];
    const [minPot, maxPot] = sapScoreMap[potential];
    const potentialEfficiency =
      Math.floor(Math.random() * (maxPot - minPot + 1)) + minPot;

    const year = 2018 + Math.floor(Math.random() * 7);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");

    return {
      address: `${i + 1} ${streets[i % streets.length]}, ${postcode.toUpperCase()}`,
      currentRating: rating,
      potentialRating: potential,
      sapScore,
      propertyType: propertyTypes[i % propertyTypes.length],
      floorArea: Math.floor(Math.random() * 120) + 40,
      heatingType: heatingTypes[i % heatingTypes.length],
      wallConstruction: wallTypes[i % wallTypes.length],
      certificateDate: `${year}-${month}-${day}`,
      currentEnergyEfficiency: sapScore,
      potentialEnergyEfficiency: potentialEfficiency,
    };
  });

  return {
    certificates,
    postcode: postcode.toUpperCase(),
    totalResults: certificates.length,
    isSampleData: true,
  };
}

function mapAPIResponse(rows: Record<string, string>[]): EPCCertificate[] {
  return rows.map((row) => ({
    address: row["address"] || row["address1"] || "Unknown address",
    currentRating: row["current-energy-rating"] || "Unknown",
    potentialRating: row["potential-energy-rating"] || "Unknown",
    sapScore: parseInt(row["current-energy-efficiency"] || "0", 10),
    propertyType: row["property-type"] || "Unknown",
    floorArea: parseFloat(row["total-floor-area"] || "0"),
    heatingType:
      row["mainheat-description"] || row["main-heating-controls"] || "Unknown",
    wallConstruction: row["walls-description"] || "Unknown",
    certificateDate: row["lodgement-date"] || row["inspection-date"] || "Unknown",
    currentEnergyEfficiency: parseInt(
      row["current-energy-efficiency"] || "0",
      10
    ),
    potentialEnergyEfficiency: parseInt(
      row["potential-energy-efficiency"] || "0",
      10
    ),
  }));
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

  // Check cache
  const cached = cache.get(normalised);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const apiKey = process.env.EPC_API_KEY;

  if (!apiKey) {
    // No API key -- return sample data with a flag
    const sampleData = generateSampleData(normalised);
    cache.set(normalised, { data: sampleData, timestamp: Date.now() });
    return NextResponse.json(sampleData);
  }

  try {
    const encodedPostcode = encodeURIComponent(postcode.trim());
    const res = await fetch(
      `https://epc.opendatacommunities.org/api/v1/domestic/search?postcode=${encodedPostcode}&size=50`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.error(`EPC API error: ${res.status} ${res.statusText}`);
      // Fall back to sample data on API error
      const sampleData = generateSampleData(normalised);
      sampleData.isSampleData = true;
      cache.set(normalised, { data: sampleData, timestamp: Date.now() });
      return NextResponse.json(sampleData);
    }

    const json = await res.json();
    const rows = json.rows || [];

    const result: EPCResult = {
      certificates: mapAPIResponse(rows),
      postcode: normalised,
      totalResults: rows.length,
      isSampleData: false,
    };

    cache.set(normalised, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (error) {
    console.error("EPC API fetch error:", error);
    // Fall back to sample data on any error
    const sampleData = generateSampleData(normalised);
    cache.set(normalised, { data: sampleData, timestamp: Date.now() });
    return NextResponse.json(sampleData);
  }
}
