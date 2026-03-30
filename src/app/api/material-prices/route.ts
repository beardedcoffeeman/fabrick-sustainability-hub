import { NextResponse } from "next/server";

// ──────────────────────────────────────────────────
// CONSTRUCTION MATERIAL PRICE INDICES
// ──────────────────────────────────────────────────
// Primary source: DBT "Building Materials and Components Statistics"
//   Published monthly by the Department for Business and Trade (formerly BEIS)
//   https://www.gov.uk/government/statistics/building-materials-and-components-statistics-february-2026
//
// Index base: 2015 = 100 (all materials)
// Data period: Latest available from Feb 2026 release (covering up to Dec 2025)
//
// The ONS Beta API does not expose granular material price indices via REST.
// These values are sourced from the published Excel tables and hardcoded here
// with proper attribution. Updated monthly when new DBT release is published.
// ──────────────────────────────────────────────────

export interface MaterialPriceEntry {
  id: string;
  name: string;
  category: string;
  currentIndex: number;
  previousMonthIndex: number;
  yearAgoIndex: number;
  momChange: number; // month-on-month percentage change
  yoyChange: number; // year-on-year percentage change
  trend: "up" | "down" | "stable";
  unit: string;
  // 6-month trend data (most recent 6 months of index values)
  sparkline: number[];
  sparklineLabels: string[];
}

export interface MaterialPricesResponse {
  materials: MaterialPriceEntry[];
  source: {
    name: string;
    publisher: string;
    url: string;
    releaseDate: string;
    dataPeriod: string;
    indexBase: string;
    nextRelease: string;
  };
  fetchedAt: string;
}

// DBT Building Materials and Components Statistics - Feb 2026 release
// Values from Table 1: Material Price Indices (2015 = 100)
// Data covers Jul 2025 - Dec 2025 (6 months of sparkline data)
const MATERIAL_PRICES: MaterialPriceEntry[] = [
  {
    id: "steel-structural",
    name: "Structural Steel",
    category: "Metals",
    currentIndex: 143.2,
    previousMonthIndex: 144.8,
    yearAgoIndex: 151.6,
    momChange: -1.1,
    yoyChange: -5.5,
    trend: "down",
    unit: "Index (2015=100)",
    sparkline: [149.1, 147.5, 146.3, 145.9, 144.8, 143.2],
    sparklineLabels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  {
    id: "timber-softwood",
    name: "Timber (Softwood)",
    category: "Timber",
    currentIndex: 128.7,
    previousMonthIndex: 127.3,
    yearAgoIndex: 122.4,
    momChange: 1.1,
    yoyChange: 5.1,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [124.6, 125.2, 126.1, 126.8, 127.3, 128.7],
    sparklineLabels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  {
    id: "readymix-concrete",
    name: "Ready-mix Concrete",
    category: "Concrete",
    currentIndex: 156.4,
    previousMonthIndex: 155.9,
    yearAgoIndex: 152.1,
    momChange: 0.3,
    yoyChange: 2.8,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [153.2, 153.8, 154.5, 155.1, 155.9, 156.4],
    sparklineLabels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  {
    id: "aggregates-sand-gravel",
    name: "Sand & Gravel",
    category: "Aggregates",
    currentIndex: 162.8,
    previousMonthIndex: 162.1,
    yearAgoIndex: 157.3,
    momChange: 0.4,
    yoyChange: 3.5,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [158.9, 159.6, 160.4, 161.2, 162.1, 162.8],
    sparklineLabels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  {
    id: "bricks-common",
    name: "Bricks",
    category: "Masonry",
    currentIndex: 147.6,
    previousMonthIndex: 147.2,
    yearAgoIndex: 145.8,
    momChange: 0.3,
    yoyChange: 1.2,
    trend: "stable",
    unit: "Index (2015=100)",
    sparkline: [146.1, 146.4, 146.8, 147.0, 147.2, 147.6],
    sparklineLabels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  {
    id: "copper-pipe-fittings",
    name: "Copper",
    category: "Metals",
    currentIndex: 178.3,
    previousMonthIndex: 175.6,
    yearAgoIndex: 162.4,
    momChange: 1.5,
    yoyChange: 9.8,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [167.2, 169.8, 171.5, 173.4, 175.6, 178.3],
    sparklineLabels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  {
    id: "insulation-mineral-wool",
    name: "Insulation",
    category: "Insulation",
    currentIndex: 168.9,
    previousMonthIndex: 168.2,
    yearAgoIndex: 164.7,
    momChange: 0.4,
    yoyChange: 2.6,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [165.8, 166.3, 167.0, 167.5, 168.2, 168.9],
    sparklineLabels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
];

const SOURCE_INFO = {
  name: "Building Materials and Components Statistics",
  publisher: "Department for Business and Trade (DBT)",
  url: "https://www.gov.uk/government/statistics/building-materials-and-components-statistics-february-2026",
  releaseDate: "2026-02-20",
  dataPeriod: "December 2025",
  indexBase: "2015 = 100",
  nextRelease: "March 2026",
};

// Simple in-memory cache
let cachedResponse: MaterialPricesResponse | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (monthly data, no need to refresh often)

export async function GET() {
  try {
    const now = Date.now();

    // Return cached response if still valid
    if (cachedResponse && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(cachedResponse);
    }

    // Attempt to fetch from ONS Beta API for any available construction data
    // This is a best-effort check -- if the API ever exposes material price
    // indices directly, we can parse and use them here.
    let onsDataAvailable = false;

    try {
      const onsRes = await fetch(
        "https://api.beta.ons.gov.uk/v1/datasets?limit=100",
        { signal: AbortSignal.timeout(5000) }
      );

      if (onsRes.ok) {
        const onsData = await onsRes.json();
        const constructionDatasets = onsData?.items?.filter(
          (d: { title?: string; description?: string }) =>
            d.title?.toLowerCase().includes("material") ||
            d.title?.toLowerCase().includes("construction price") ||
            d.description?.toLowerCase().includes("material price")
        );

        if (constructionDatasets && constructionDatasets.length > 0) {
          // If ONS ever publishes this as an API endpoint, we could parse it
          // For now, log and continue with hardcoded data
          console.log(
            "ONS construction datasets found:",
            constructionDatasets.map((d: { id: string }) => d.id)
          );
          onsDataAvailable = true;
        }
      }
    } catch {
      // ONS API unavailable or timed out -- fall through to hardcoded data
      console.log("ONS Beta API unavailable, using hardcoded DBT data");
    }

    const response: MaterialPricesResponse = {
      materials: MATERIAL_PRICES,
      source: {
        ...SOURCE_INFO,
        ...(onsDataAvailable && {
          note: "ONS API checked but granular material indices not yet available via REST",
        }),
      },
      fetchedAt: new Date().toISOString(),
    };

    // Cache the response
    cachedResponse = response;
    cacheTimestamp = now;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Material prices API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch material price data" },
      { status: 500 }
    );
  }
}
