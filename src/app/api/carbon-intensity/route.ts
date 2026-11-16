import { NextResponse } from "next/server";
import { fetchCarbonIntensityNow } from "@/lib/carbon-intensity";

// The fetch lives in src/lib/carbon-intensity.ts, shared with Ask Pulse.
export async function GET() {
  try {
    return NextResponse.json(await fetchCarbonIntensityNow());
  } catch (error) {
    console.error("Carbon intensity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch carbon intensity data" },
      { status: 500 }
    );
  }
}
