import { NextResponse } from "next/server";

// ONS Beta API - Output in the Construction Industry dataset
// Free, no key required. Monthly data on UK construction sector activity.
// Docs: https://api.beta.ons.gov.uk/v1/datasets/output-in-the-construction-industry

const ONS_BASE =
  "https://api.beta.ons.gov.uk/v1/datasets/output-in-the-construction-industry/editions/time-series/versions/52/observations";

const GEOGRAPHY = "K03000001"; // Great Britain

// Work type codes from the ONS construction-classifications codelist
const WORK_TYPES = {
  allWork: "1",
  allNewWork: "1-2",
  allRepairMaintenance: "1-1",
  totalNewHousing: "1-2-1",
  publicNewHousing: "1-2-1-1",
  privateNewHousing: "1-2-1-2",
  infrastructureNewWork: "1-2-3",
  publicOtherNewWork: "1-2-2-1-1",
  privateIndustrialNewWork: "1-2-2-1-2-1",
  privateCommercialNewWork: "1-2-2-1-2-2",
  totalHousingRM: "1-1-1",
  nonHousingRM: "1-1-2",
} as const;

const MONTH_NAMES = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
];

function getOnsTimeKey(year: number, monthIndex: number): string {
  return `${year}-${MONTH_NAMES[monthIndex]}`;
}

function getMonthLabel(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/**
 * Fetches a single observation from the ONS API.
 * Returns the numeric value or null if unavailable.
 */
async function fetchObservation(
  time: string,
  typeofwork: string,
  seriestype = "pounds-million"
): Promise<number | null> {
  const params = new URLSearchParams({
    time,
    geography: GEOGRAPHY,
    seasonaladjustment: "seasonal-adjustment",
    seriestype,
    typeofwork,
  });

  try {
    const res = await fetch(`${ONS_BASE}?${params}`, {
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) return null;

    const json = await res.json();
    const obs = json.observations?.[0]?.observation;
    return obs != null ? parseFloat(obs) : null;
  } catch {
    return null;
  }
}

/**
 * Fetches all sector breakdown values for a given month.
 * Uses wildcard to get all work types in a single request.
 */
async function fetchAllWorkTypes(time: string): Promise<Record<string, number>> {
  const params = new URLSearchParams({
    time,
    geography: GEOGRAPHY,
    seasonaladjustment: "seasonal-adjustment",
    seriestype: "pounds-million",
    typeofwork: "*",
  });

  try {
    const res = await fetch(`${ONS_BASE}?${params}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return {};

    const json = await res.json();
    const result: Record<string, number> = {};

    for (const obs of json.observations || []) {
      // ONS API returns PascalCase dimension keys (TypeOfWork, not typeofwork)
      const dims = obs.dimensions || {};
      const typeCode = dims.TypeOfWork?.id || dims.typeofwork?.id;
      const value = parseFloat(obs.observation);
      if (typeCode && !isNaN(value)) {
        result[typeCode] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
}

/**
 * Determine the latest available month by working backwards.
 * ONS data typically lags by ~2 months.
 */
async function findLatestMonth(): Promise<{ year: number; monthIndex: number } | null> {
  const now = new Date();
  // Start checking from 1 month ago, go back up to 6 months
  for (let offset = 1; offset <= 6; offset++) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = d.getFullYear();
    const monthIndex = d.getMonth();
    const time = getOnsTimeKey(year, monthIndex);

    const val = await fetchObservation(time, WORK_TYPES.allWork);
    if (val !== null) {
      return { year, monthIndex };
    }
  }
  return null;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

export async function GET() {
  try {
    // Step 1: Find the latest month with data
    const latest = await findLatestMonth();

    if (!latest) {
      return NextResponse.json(
        { error: "No recent ONS construction data available" },
        { status: 502 }
      );
    }

    const { year: latestYear, monthIndex: latestMonth } = latest;
    const latestTime = getOnsTimeKey(latestYear, latestMonth);

    // Previous month
    const prevDate = new Date(latestYear, latestMonth - 1, 1);
    const prevTime = getOnsTimeKey(prevDate.getFullYear(), prevDate.getMonth());

    // Year-ago month
    const yoyDate = new Date(latestYear - 1, latestMonth, 1);
    const yoyTime = getOnsTimeKey(yoyDate.getFullYear(), yoyDate.getMonth());

    // Step 2: Fetch current month breakdown + previous + year-ago (parallel)
    const [currentData, prevData, yoyData] = await Promise.all([
      fetchAllWorkTypes(latestTime),
      fetchAllWorkTypes(prevTime),
      fetchAllWorkTypes(yoyTime),
    ]);

    // Also fetch a 12-month trend for the "All work" total
    const trendMonths: Array<{ year: number; monthIndex: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(latestYear, latestMonth - i, 1);
      trendMonths.push({ year: d.getFullYear(), monthIndex: d.getMonth() });
    }

    const trendPromises = trendMonths.map((m) =>
      fetchObservation(getOnsTimeKey(m.year, m.monthIndex), WORK_TYPES.allWork)
    );
    const trendValues = await Promise.all(trendPromises);

    const trend = trendMonths.map((m, i) => ({
      month: getMonthLabel(m.year, m.monthIndex),
      value: trendValues[i],
    }));

    // Step 3: Build response
    const allWork = currentData[WORK_TYPES.allWork] ?? null;
    const prevAllWork = prevData[WORK_TYPES.allWork] ?? null;
    const yoyAllWork = yoyData[WORK_TYPES.allWork] ?? null;

    const sectors = [
      {
        name: "Private Housing (New)",
        key: "privateNewHousing",
        value: currentData[WORK_TYPES.privateNewHousing] ?? null,
        prev: prevData[WORK_TYPES.privateNewHousing] ?? null,
        yoy: yoyData[WORK_TYPES.privateNewHousing] ?? null,
      },
      {
        name: "Public Housing (New)",
        key: "publicNewHousing",
        value: currentData[WORK_TYPES.publicNewHousing] ?? null,
        prev: prevData[WORK_TYPES.publicNewHousing] ?? null,
        yoy: yoyData[WORK_TYPES.publicNewHousing] ?? null,
      },
      {
        name: "Infrastructure",
        key: "infrastructure",
        value: currentData[WORK_TYPES.infrastructureNewWork] ?? null,
        prev: prevData[WORK_TYPES.infrastructureNewWork] ?? null,
        yoy: yoyData[WORK_TYPES.infrastructureNewWork] ?? null,
      },
      {
        name: "Commercial",
        key: "commercial",
        value: currentData[WORK_TYPES.privateCommercialNewWork] ?? null,
        prev: prevData[WORK_TYPES.privateCommercialNewWork] ?? null,
        yoy: yoyData[WORK_TYPES.privateCommercialNewWork] ?? null,
      },
      {
        name: "Industrial",
        key: "industrial",
        value: currentData[WORK_TYPES.privateIndustrialNewWork] ?? null,
        prev: prevData[WORK_TYPES.privateIndustrialNewWork] ?? null,
        yoy: yoyData[WORK_TYPES.privateIndustrialNewWork] ?? null,
      },
      {
        name: "Public Other",
        key: "publicOther",
        value: currentData[WORK_TYPES.publicOtherNewWork] ?? null,
        prev: prevData[WORK_TYPES.publicOtherNewWork] ?? null,
        yoy: yoyData[WORK_TYPES.publicOtherNewWork] ?? null,
      },
    ];

    const response = {
      period: getMonthLabel(latestYear, latestMonth),
      periodKey: latestTime,
      releaseDate: "2026-03-13",
      totalOutput: {
        value: allWork,
        unit: "GBP millions",
        momChange:
          allWork != null && prevAllWork != null
            ? pctChange(allWork, prevAllWork)
            : null,
        yoyChange:
          allWork != null && yoyAllWork != null
            ? pctChange(allWork, yoyAllWork)
            : null,
      },
      newWork: {
        value: currentData[WORK_TYPES.allNewWork] ?? null,
        unit: "GBP millions",
      },
      repairMaintenance: {
        value: currentData[WORK_TYPES.allRepairMaintenance] ?? null,
        unit: "GBP millions",
      },
      sectors: sectors.map((s) => ({
        ...s,
        momChange:
          s.value != null && s.prev != null ? pctChange(s.value, s.prev) : null,
        yoyChange:
          s.value != null && s.yoy != null ? pctChange(s.value, s.yoy) : null,
      })),
      trend,
      source: {
        name: "ONS - Output in the Construction Industry",
        url: "https://www.ons.gov.uk/businessindustryandtrade/constructionindustry/datasets/outputintheconstructionindustry",
        api: "https://api.beta.ons.gov.uk/v1/datasets/output-in-the-construction-industry",
        notes:
          "Seasonally adjusted, current prices (GBP millions). Covers Great Britain (England, Scotland, Wales). Data typically published ~2 months after the reference period.",
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Construction output API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch construction output data" },
      { status: 500 }
    );
  }
}
