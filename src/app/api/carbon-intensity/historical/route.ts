import { NextRequest, NextResponse } from "next/server";

// National Grid ESO Carbon Intensity API
// Docs: https://carbon-intensity.github.io/api-definitions/
// /intensity/{from}/{to} returns half-hourly intensity between two dates,
// max 14 days per request.
const API_BASE = "https://api.carbonintensity.org.uk";

// Region IDs from the Carbon Intensity API regional endpoints.
// 1–14 = English/Scottish/Welsh GB regions; 15–17 = country aggregates.
export const REGIONS: Record<string, { id: number; name: string }> = {
  "north-scotland": { id: 1, name: "North Scotland" },
  "south-scotland": { id: 2, name: "South Scotland" },
  "north-west-england": { id: 3, name: "North West England" },
  "north-east-england": { id: 4, name: "North East England" },
  "yorkshire": { id: 5, name: "Yorkshire" },
  "north-wales-merseyside": { id: 6, name: "North Wales & Merseyside" },
  "south-wales": { id: 7, name: "South Wales" },
  "west-midlands": { id: 8, name: "West Midlands" },
  "east-midlands": { id: 9, name: "East Midlands" },
  "east-england": { id: 10, name: "East England" },
  "south-west-england": { id: 11, name: "South West England" },
  "south-england": { id: 12, name: "South England" },
  "london": { id: 13, name: "London" },
  "south-east-england": { id: 14, name: "South East England" },
};

interface IntensityReading {
  from: string;
  to: string;
  intensity: { forecast: number; actual: number | null; index: string };
}

interface ApiBatchResponse {
  data: IntensityReading[];
}

interface CellAggregate {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday (matches Date.getDay)
  hourOfDay: number; // 0–23
  avg: number; // mean gCO2/kWh
  count: number; // number of half-hour samples
  min: number;
  max: number;
}

interface BestWindow {
  // A "window" here = a single half-hour slot averaged across the lookback.
  // A practical low-carbon scheduling window for the user.
  dayOfWeek: number;
  hourOfDay: number;
  avg: number;
  vsOverallPct: number; // % below the overall mean
}

interface HistoricalResponse {
  lookbackDays: number;
  fetchedAt: string;
  samples: number;
  overallAvg: number;
  cells: CellAggregate[];
  bestCells: BestWindow[];
  worstCells: BestWindow[];
  source: {
    name: string;
    url: string;
    note: string;
  };
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toIsoZ(date: Date): string {
  // API expects ISO without ms.
  return date.toISOString().split(".")[0] + "Z";
}

function startOfDayUTC(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function fetchBatch(from: Date, to: Date): Promise<IntensityReading[]> {
  const url = `${API_BASE}/intensity/${toIsoZ(from)}/${toIsoZ(to)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    console.error(`Carbon intensity historical fetch ${res.status} for ${url}`);
    return [];
  }
  const json = (await res.json()) as ApiBatchResponse;
  return json.data ?? [];
}

interface RegionalIntensityReading {
  from: string;
  to: string;
  intensity: { forecast: number; index: string };
}

async function fetchRegionalBatch(
  regionId: number,
  from: Date,
  to: Date
): Promise<IntensityReading[]> {
  const url = `${API_BASE}/regional/intensity/${toIsoZ(from)}/${toIsoZ(to)}/regionid/${regionId}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    console.error(`Carbon intensity regional fetch ${res.status} for ${url}`);
    return [];
  }
  const json = await res.json();
  // The /regionid/ endpoint nests readings inside data.data; readings have
  // intensity.forecast directly (no `regions` array).
  const inner: RegionalIntensityReading[] = json.data?.data ?? [];
  return inner.map((r) => ({
    from: r.from,
    to: r.to,
    intensity: {
      forecast: r.intensity?.forecast ?? 0,
      actual: null, // regional API only publishes forecast values
      index: r.intensity?.index ?? "",
    },
  }));
}

// Cache key includes region so regions don't collide
const cache: Map<string, { data: HistoricalResponse; expires: number }> =
  new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedDays = Math.min(
    Math.max(parseInt(searchParams.get("days") || "90", 10), 7),
    365
  );
  const regionSlug = searchParams.get("region");
  const region = regionSlug ? REGIONS[regionSlug] : null;

  const cacheKey = `${region?.id ?? "gb"}-${requestedDays}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json(hit.data);
  }

  const end = startOfDayUTC(new Date());
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - requestedDays);

  // Walk in 14-day chunks (API limit). Use regional fetcher if a region is set.
  const CHUNK_DAYS = 14;
  const readings: IntensityReading[] = [];
  let cursor = new Date(start);
  while (cursor < end) {
    const chunkEnd = new Date(cursor);
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() + CHUNK_DAYS);
    if (chunkEnd > end) chunkEnd.setTime(end.getTime());
    const batch = region
      ? await fetchRegionalBatch(region.id, cursor, chunkEnd)
      : await fetchBatch(cursor, chunkEnd);
    readings.push(...batch);
    cursor = chunkEnd;
  }

  if (readings.length === 0) {
    return NextResponse.json(
      { error: "No carbon intensity data available" },
      { status: 502 }
    );
  }

  // Aggregate by (dayOfWeek, hourOfDay).
  // Use the actual reading where available; fall back to forecast.
  const buckets: Map<string, { sum: number; count: number; min: number; max: number }> =
    new Map();

  let overallSum = 0;
  let overallCount = 0;

  for (const r of readings) {
    const value = r.intensity.actual ?? r.intensity.forecast;
    if (value == null || isNaN(value)) continue;
    const ts = new Date(r.from);
    const dow = ts.getUTCDay();
    const hod = ts.getUTCHours();
    const key = `${dow}-${hod}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.sum += value;
      existing.count += 1;
      existing.min = Math.min(existing.min, value);
      existing.max = Math.max(existing.max, value);
    } else {
      buckets.set(key, { sum: value, count: 1, min: value, max: value });
    }
    overallSum += value;
    overallCount += 1;
  }

  const overallAvg = overallCount > 0 ? overallSum / overallCount : 0;

  const cells: CellAggregate[] = [];
  for (let dow = 0; dow < 7; dow++) {
    for (let hod = 0; hod < 24; hod++) {
      const b = buckets.get(`${dow}-${hod}`);
      if (b) {
        cells.push({
          dayOfWeek: dow,
          hourOfDay: hod,
          avg: b.sum / b.count,
          count: b.count,
          min: b.min,
          max: b.max,
        });
      } else {
        cells.push({
          dayOfWeek: dow,
          hourOfDay: hod,
          avg: 0,
          count: 0,
          min: 0,
          max: 0,
        });
      }
    }
  }

  const populatedCells = cells.filter((c) => c.count > 0);
  const sorted = [...populatedCells].sort((a, b) => a.avg - b.avg);

  const bestCells: BestWindow[] = sorted.slice(0, 10).map((c) => ({
    dayOfWeek: c.dayOfWeek,
    hourOfDay: c.hourOfDay,
    avg: c.avg,
    vsOverallPct: ((c.avg - overallAvg) / overallAvg) * 100,
  }));

  const worstCells: BestWindow[] = sorted
    .slice(-10)
    .reverse()
    .map((c) => ({
      dayOfWeek: c.dayOfWeek,
      hourOfDay: c.hourOfDay,
      avg: c.avg,
      vsOverallPct: ((c.avg - overallAvg) / overallAvg) * 100,
    }));

  const scopeLabel = region ? region.name : "UK grid";
  const response: HistoricalResponse = {
    lookbackDays: requestedDays,
    fetchedAt: new Date().toISOString(),
    samples: overallCount,
    overallAvg,
    cells,
    bestCells,
    worstCells,
    source: {
      name: "National Grid ESO - Carbon Intensity API",
      url: "https://carbonintensity.org.uk",
      note: `${requestedDays}-day rolling average of ${scopeLabel} carbon intensity, aggregated by hour-of-day and day-of-week. Half-hour resolution, ${overallCount.toLocaleString()} samples.`,
    },
  };

  cache.set(cacheKey, {
    data: response,
    expires: Date.now() + 24 * 60 * 60 * 1000,
  });

  return NextResponse.json(response);
}

// Helper exported so the heatmap component can label rows consistently
export { DAY_NAMES };
