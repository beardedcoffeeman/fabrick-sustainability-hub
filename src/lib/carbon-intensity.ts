// ──────────────────────────────────────────────────
// National Grid ESO Carbon Intensity API: live snapshot (shared)
// ──────────────────────────────────────────────────
// The fetch behind GET /api/carbon-intensity, moved here unchanged so Ask
// Pulse's get_grid_carbon tool reads exactly what the dashboard shows.
// Docs: https://carbon-intensity.github.io/api-definitions/
// Throws when the national intensity or generation mix cannot be read; the
// regional and forecast parts are optional (null when unavailable).
// ──────────────────────────────────────────────────

export const CARBON_INTENSITY_API = "https://api.carbonintensity.org.uk";

export interface IntensityPeriod {
  from: string;
  to: string;
  intensity: { forecast: number | null; actual?: number | null; index: string };
}

export interface FuelShare {
  fuel: string;
  perc: number;
}

export interface RegionalEntry {
  regionid: number;
  dnoregion?: string;
  shortname: string;
  intensity: { forecast: number | null; index: string };
  generationmix?: FuelShare[];
}

export interface CarbonIntensityNow {
  current: IntensityPeriod | undefined;
  generation: { from: string; to: string; generationmix: FuelShare[] } | undefined;
  regional: { from: string; to: string; regions: RegionalEntry[] } | undefined;
  forecast: IntensityPeriod[] | undefined;
}

export async function fetchCarbonIntensityNow(): Promise<CarbonIntensityNow> {
  const [intensityRes, generationRes] = await Promise.all([
    fetch(`${CARBON_INTENSITY_API}/intensity`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    }),
    fetch(`${CARBON_INTENSITY_API}/generation`, {
      next: { revalidate: 300 },
    }),
  ]);

  if (!intensityRes.ok || !generationRes.ok) {
    throw new Error("Carbon Intensity API error");
  }

  const intensityData = await intensityRes.json();
  const generationData = await generationRes.json();

  // Also fetch regional data
  const regionalRes = await fetch(`${CARBON_INTENSITY_API}/regional`, {
    next: { revalidate: 300 },
  });
  const regionalData = regionalRes.ok ? await regionalRes.json() : null;

  // Fetch 24h forecast
  const forecastRes = await fetch(`${CARBON_INTENSITY_API}/intensity/date`, {
    next: { revalidate: 600 },
  });
  const forecastData = forecastRes.ok ? await forecastRes.json() : null;

  return {
    current: intensityData.data?.[0],
    generation: generationData.data,
    regional: regionalData?.data?.[0],
    forecast: forecastData?.data,
  };
}
