import { NextResponse } from "next/server";
import {
  loadMaterialPrices,
  type MaterialPricesResponse,
} from "@/lib/material-prices";

// ──────────────────────────────────────────────────
// CONSTRUCTION MATERIAL PRICE INDICES
// ──────────────────────────────────────────────────
// Primary source: DBT "Building Materials and Components Statistics"
//   Published monthly by the Department for Business and Trade.
//
// Index base: 2015 = 100 (all materials).
//
// Data flow:
//   1. scripts/ingest-material-prices.ts pulls the latest DBT release each
//      month, parses Table 2 (Monthly producer price indices of construction
//      materials) from the published Excel attachment, and writes the
//      snapshot to src/data/material-prices-snapshot.json.
//   2. This route imports that JSON and serves it (with a 24h in-memory
//      cache).
//   3. If the JSON is missing or fails type-checks, the hardcoded
//      MATERIAL_PRICES_FALLBACK array is served instead so the dashboard
//      never breaks.
//
// The snapshot loader and the fallback live in src/lib/material-prices.ts,
// shared with Ask Pulse (src/lib/ask).
// ──────────────────────────────────────────────────

export type {
  MaterialPriceEntry,
  MaterialPricesResponse,
} from "@/lib/material-prices";

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

    const { materials, source } = loadMaterialPrices();

    const response: MaterialPricesResponse = {
      materials,
      source,
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
