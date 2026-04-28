import { NextResponse } from "next/server";

// ──────────────────────────────────────────────────
// CONSTRUCTION MATERIAL PRICE INDICES
// ──────────────────────────────────────────────────
// Primary source: DBT "Building Materials and Components Statistics"
//   Published monthly by the Department for Business and Trade (formerly BEIS)
//   https://www.gov.uk/government/statistics/building-materials-and-components-statistics-february-2026
//
// Index base: 2015 = 100 (all materials)
// Reference month: January 2026 (provisional) - matches the publication's
//   "12 months to January 2026" headline period.
// Year-ago: January 2025. Previous-month: December 2025.
// Sparkline: 6 monthly values, August 2025 → January 2026.
//
// All values transcribed directly from Table 2 (Monthly producer price
// indices, PPI, of construction materials) of the published Excel attachment:
//   construction_building_materials_-_tables_february_2026.xlsx
//
// Top-mover percentages match the publication commentary exactly (Electric
// water heaters +6.9%, Imported sawn/planed wood +6.5%, Sand & gravel incl
// levy +6.6%, Bituminous mixtures -1.6%, Imported plywood -6.4%, Reinforcing
// bar -6.6%).
//
// MANUAL SNAPSHOT - refresh from new release each month. The DBT publication
// schedule lists the next bulletin as 1 April 2026.
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
    note?: string;
  };
  fetchedAt: string;
}

// DBT Building Materials and Components Statistics - Feb 2026 release
// Values from Table 2: Monthly PPI of construction materials (2015 = 100)
// Sparkline covers Aug 2025 → Jan 2026.
const MATERIAL_PRICES: MaterialPriceEntry[] = [
  // ── Metals ────────────────────────────────────────
  {
    id: "structural-steel",
    name: "Fabricated structural steel",
    category: "Metals",
    currentIndex: 148.2,
    previousMonthIndex: 144.6,
    yearAgoIndex: 144.6,
    momChange: 2.5,
    yoyChange: 2.5,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [141.8, 140.9, 141.0, 144.7, 144.6, 148.2],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "metal-doors-windows",
    name: "Metal doors & windows",
    category: "Metals",
    currentIndex: 183.0,
    previousMonthIndex: 182.6,
    yearAgoIndex: 179.2,
    momChange: 0.2,
    yoyChange: 2.1,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [181.1, 181.0, 182.5, 182.6, 182.6, 183.0],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "taps-valves",
    name: "Taps & valves (sanitaryware)",
    category: "Metals",
    currentIndex: 164.2,
    previousMonthIndex: 158.6,
    yearAgoIndex: 158.5,
    momChange: 3.5,
    yoyChange: 3.6,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [158.6, 158.6, 158.6, 158.6, 158.6, 164.2],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "screws-fixings",
    name: "Screws & fixings",
    category: "Metals",
    currentIndex: 141.3,
    previousMonthIndex: 140.8,
    yearAgoIndex: 138.9,
    momChange: 0.4,
    yoyChange: 1.7,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [140.3, 140.4, 140.7, 140.7, 140.8, 141.3],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "central-heating-boilers",
    name: "Central heating boilers",
    category: "Metals",
    currentIndex: 148.2,
    previousMonthIndex: 148.2,
    yearAgoIndex: 147.0,
    momChange: 0.0,
    yoyChange: 0.8,
    trend: "stable",
    unit: "Index (2015=100)",
    sparkline: [148.2, 148.2, 148.2, 148.2, 148.2, 148.2],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "metal-sanitaryware",
    name: "Metal sanitaryware",
    category: "Metals",
    currentIndex: 128.1,
    previousMonthIndex: 128.1,
    yearAgoIndex: 127.5,
    momChange: 0.0,
    yoyChange: 0.5,
    trend: "stable",
    unit: "Index (2015=100)",
    sparkline: [127.5, 127.5, 127.5, 127.5, 128.1, 128.1],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "builders-ironmongery",
    name: "Builders' ironmongery",
    category: "Metals",
    currentIndex: 140.6,
    previousMonthIndex: 140.6,
    yearAgoIndex: 140.3,
    momChange: 0.0,
    yoyChange: 0.2,
    trend: "stable",
    unit: "Index (2015=100)",
    sparkline: [140.5, 140.5, 140.5, 140.6, 140.6, 140.6],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },

  // ── Cement & Concrete ─────────────────────────────
  {
    id: "precast-concrete",
    name: "Pre-cast concrete products",
    category: "Cement & Concrete",
    currentIndex: 190.6,
    previousMonthIndex: 190.3,
    yearAgoIndex: 186.2,
    momChange: 0.2,
    yoyChange: 2.4,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [193.2, 191.2, 191.3, 190.6, 190.3, 190.6],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "concrete-blocks-bricks",
    name: "Concrete blocks, bricks & flagstones",
    category: "Cement & Concrete",
    currentIndex: 175.4,
    previousMonthIndex: 175.0,
    yearAgoIndex: 171.5,
    momChange: 0.2,
    yoyChange: 2.3,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [179.5, 176.2, 176.7, 175.4, 175.0, 175.4],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "readymix-concrete",
    name: "Ready-mixed concrete",
    category: "Cement & Concrete",
    currentIndex: 156.3,
    previousMonthIndex: 156.3,
    yearAgoIndex: 153.5,
    momChange: 0.0,
    yoyChange: 1.8,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [157.5, 157.2, 156.9, 156.3, 156.3, 156.3],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "cement",
    name: "Cement",
    category: "Cement & Concrete",
    currentIndex: 142.0,
    previousMonthIndex: 140.7,
    yearAgoIndex: 142.1,
    momChange: 0.9,
    yoyChange: -0.1,
    trend: "stable",
    unit: "Index (2015=100)",
    sparkline: [141.9, 140.5, 142.4, 140.7, 140.7, 142.0],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "rebar-steel",
    name: "Reinforcing bar (rebar steel)",
    category: "Cement & Concrete",
    currentIndex: 134.7,
    previousMonthIndex: 133.3,
    yearAgoIndex: 144.2,
    momChange: 1.1,
    yoyChange: -6.6,
    trend: "down",
    unit: "Index (2015=100)",
    sparkline: [138.7, 136.7, 134.3, 135.1, 133.3, 134.7],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },

  // ── Aggregates ────────────────────────────────────
  {
    id: "sand-gravel-incl-levy",
    name: "Sand & gravel (incl. aggregate levy)",
    category: "Aggregates",
    currentIndex: 154.4,
    previousMonthIndex: 152.8,
    yearAgoIndex: 144.9,
    momChange: 1.0,
    yoyChange: 6.6,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [149.0, 150.9, 150.3, 146.9, 152.8, 154.4],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "sand-gravel-excl-levy",
    name: "Sand & gravel (excl. aggregate levy)",
    category: "Aggregates",
    currentIndex: 151.8,
    previousMonthIndex: 150.0,
    yearAgoIndex: 150.9,
    momChange: 1.2,
    yoyChange: 0.6,
    trend: "stable",
    unit: "Index (2015=100)",
    sparkline: [147.3, 148.7, 148.5, 147.2, 150.0, 151.8],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "asphalt-bituminous",
    name: "Bituminous mixtures (asphalt)",
    category: "Aggregates",
    currentIndex: 142.8,
    previousMonthIndex: 142.8,
    yearAgoIndex: 145.1,
    momChange: 0.0,
    yoyChange: -1.6,
    trend: "down",
    unit: "Index (2015=100)",
    sparkline: [145.1, 144.1, 142.8, 142.8, 142.8, 142.8],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },

  // ── Timber ────────────────────────────────────────
  {
    id: "softwood-imported",
    name: "Imported sawn/planed timber",
    category: "Timber",
    currentIndex: 167.9,
    previousMonthIndex: 170.4,
    yearAgoIndex: 157.7,
    momChange: -1.5,
    yoyChange: 6.5,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [176.7, 176.4, 172.4, 171.8, 170.4, 167.9],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "timber-doors-windows",
    name: "Timber doors & windows",
    category: "Timber",
    currentIndex: 139.7,
    previousMonthIndex: 139.1,
    yearAgoIndex: 134.2,
    momChange: 0.4,
    yoyChange: 4.1,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [135.7, 137.3, 137.7, 138.3, 139.1, 139.7],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "builders-woodwork",
    name: "Builders' woodwork",
    category: "Timber",
    currentIndex: 165.0,
    previousMonthIndex: 164.3,
    yearAgoIndex: 159.3,
    momChange: 0.4,
    yoyChange: 3.6,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [162.3, 163.4, 163.9, 163.8, 164.3, 165.0],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "plywood-imported",
    name: "Imported plywood",
    category: "Timber",
    currentIndex: 130.9,
    previousMonthIndex: 129.9,
    yearAgoIndex: 139.8,
    momChange: 0.8,
    yoyChange: -6.4,
    trend: "down",
    unit: "Index (2015=100)",
    sparkline: [130.9, 128.9, 130.2, 130.9, 129.9, 130.9],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },

  // ── Plastics ──────────────────────────────────────
  {
    id: "plastic-doors-windows",
    name: "Plastic doors & windows",
    category: "Plastics",
    currentIndex: 171.5,
    previousMonthIndex: 171.1,
    yearAgoIndex: 163.7,
    momChange: 0.2,
    yoyChange: 4.8,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [170.0, 170.0, 171.0, 171.1, 171.1, 171.5],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "plastic-sanitaryware",
    name: "Plastic sanitaryware",
    category: "Plastics",
    currentIndex: 149.9,
    previousMonthIndex: 146.4,
    yearAgoIndex: 144.8,
    momChange: 2.4,
    yoyChange: 3.5,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [146.5, 147.0, 146.4, 147.0, 146.4, 149.9],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "plastic-pipes-flexible",
    name: "Plastic pipes (flexible)",
    category: "Plastics",
    currentIndex: 176.2,
    previousMonthIndex: 174.2,
    yearAgoIndex: 173.4,
    momChange: 1.1,
    yoyChange: 1.6,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [174.1, 174.2, 174.2, 174.6, 174.2, 176.2],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "plastic-pipes-rigid",
    name: "Plastic pipes (rigid)",
    category: "Plastics",
    currentIndex: 132.9,
    previousMonthIndex: 132.4,
    yearAgoIndex: 130.8,
    momChange: 0.4,
    yoyChange: 1.6,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [132.4, 132.4, 132.4, 132.4, 132.4, 132.9],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },

  // ── Other building materials ──────────────────────
  {
    id: "electric-water-heaters",
    name: "Electric water heaters",
    category: "Other",
    currentIndex: 126.3,
    previousMonthIndex: 126.3,
    yearAgoIndex: 118.2,
    momChange: 0.0,
    yoyChange: 6.9,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [127.2, 127.1, 127.2, 126.3, 126.3, 126.3],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "paint-solvent",
    name: "Paint (solvent-based)",
    category: "Other",
    currentIndex: 144.1,
    previousMonthIndex: 144.1,
    yearAgoIndex: 136.9,
    momChange: 0.0,
    yoyChange: 5.3,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [143.6, 143.9, 144.0, 144.2, 144.1, 144.1],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "paint-water",
    name: "Paint (water-based)",
    category: "Other",
    currentIndex: 147.8,
    previousMonthIndex: 147.8,
    yearAgoIndex: 141.8,
    momChange: 0.0,
    yoyChange: 4.2,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [147.7, 147.6, 147.7, 147.8, 147.8, 147.8],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "insulation",
    name: "Insulation (thermal & acoustic)",
    category: "Other",
    currentIndex: 197.5,
    previousMonthIndex: 198.6,
    yearAgoIndex: 193.5,
    momChange: -0.6,
    yoyChange: 2.1,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [198.2, 198.1, 199.5, 198.7, 198.6, 197.5],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
  {
    id: "kitchen-furniture",
    name: "Kitchen furniture",
    category: "Other",
    currentIndex: 165.8,
    previousMonthIndex: 165.5,
    yearAgoIndex: 163.2,
    momChange: 0.2,
    yoyChange: 1.6,
    trend: "up",
    unit: "Index (2015=100)",
    sparkline: [165.6, 165.6, 165.6, 165.6, 165.5, 165.8],
    sparklineLabels: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
  },
];

const SOURCE_INFO = {
  name: "Building Materials and Components Statistics",
  publisher: "Department for Business and Trade (DBT)",
  url: "https://www.gov.uk/government/statistics/building-materials-and-components-statistics-february-2026",
  releaseDate: "2026-03-04",
  dataPeriod: "January 2026",
  indexBase: "2015 = 100",
  nextRelease: "1 April 2026",
  note: "Manual snapshot from Table 2 of the published Excel attachment. Confidential indices ([c] in source: fibre cement, particle board) excluded.",
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
