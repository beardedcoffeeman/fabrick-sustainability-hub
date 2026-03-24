import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [intensityRes, generationRes] = await Promise.all([
      fetch("https://api.carbonintensity.org.uk/intensity", {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }),
      fetch("https://api.carbonintensity.org.uk/generation", {
        next: { revalidate: 300 },
      }),
    ]);

    if (!intensityRes.ok || !generationRes.ok) {
      throw new Error("Carbon Intensity API error");
    }

    const intensityData = await intensityRes.json();
    const generationData = await generationRes.json();

    // Also fetch regional data
    const regionalRes = await fetch(
      "https://api.carbonintensity.org.uk/regional",
      { next: { revalidate: 300 } }
    );
    const regionalData = regionalRes.ok ? await regionalRes.json() : null;

    // Fetch 24h forecast
    const forecastRes = await fetch(
      "https://api.carbonintensity.org.uk/intensity/date",
      { next: { revalidate: 600 } }
    );
    const forecastData = forecastRes.ok ? await forecastRes.json() : null;

    return NextResponse.json({
      current: intensityData.data?.[0],
      generation: generationData.data,
      regional: regionalData?.data?.[0],
      forecast: forecastData?.data,
    });
  } catch (error) {
    console.error("Carbon intensity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch carbon intensity data" },
      { status: 500 }
    );
  }
}
