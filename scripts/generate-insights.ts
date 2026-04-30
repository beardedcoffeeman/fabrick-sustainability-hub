/**
 * Regenerates the three "Latest insights" cards shown on the homepage.
 *
 * Run with:    npx tsx scripts/generate-insights.ts
 * Output:      src/data/insights-snapshot.json
 *
 * Sources:
 *   - Carbon insight: derived from /api/carbon-intensity/historical (90-day
 *     heatmap, returns bestCells). Hits the deployed Vercel site.
 *   - Material insight: read straight from
 *     src/data/material-prices-snapshot.json if present, else fetched from
 *     the deployed /api/material-prices endpoint.
 *   - Embodied carbon insight: computed from src/lib/carbon-data.ts ICE
 *     database alternatives map.
 *
 * The script is idempotent: same inputs in, same JSON out.
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { iceDatabase } from "../src/lib/carbon-data";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUTPUT = join(ROOT, "src/data/insights-snapshot.json");
const PRICES_SNAPSHOT = join(ROOT, "src/data/material-prices-snapshot.json");

const SITE =
  process.env.INSIGHTS_SITE_URL ?? "https://fabrick-sustainability-hub.vercel.app";

interface Insight {
  eyebrow: string;
  headline: string;
  detail: string;
  href: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`fetch ${url} -> ${res.status}`);
  }
  return (await res.json()) as T;
}

async function buildCarbonInsight(): Promise<Insight> {
  interface BestCell {
    dayOfWeek: number;
    hourOfDay: number;
    avg: number;
    vsOverallPct: number;
  }
  interface HistoricalResponse {
    bestCells: BestCell[];
    overallAvg: number;
  }

  const data = await fetchJSON<HistoricalResponse>(
    `${SITE}/api/carbon-intensity/historical?days=90`
  );
  const best = data.bestCells?.[0];
  if (!best) throw new Error("No bestCells from carbon historical API");

  const day = DAY_NAMES[best.dayOfWeek];
  const hour = formatHour(best.hourOfDay);
  const pct = Math.abs(best.vsOverallPct).toFixed(0);

  return {
    eyebrow: "UK Grid Carbon",
    headline: `${day} ${hour} is the cleanest hour of the UK week, ${pct}% below average.`,
    detail:
      "Schedule grid-powered plant operations into the lowest-carbon windows.",
    href: "/dashboard/carbon-intensity",
  };
}

async function buildMaterialInsight(): Promise<Insight> {
  interface MaterialEntry {
    name: string;
    yoyChange: number;
  }
  interface MaterialPayload {
    materials: MaterialEntry[];
  }

  let data: MaterialPayload;
  if (existsSync(PRICES_SNAPSHOT)) {
    data = JSON.parse(readFileSync(PRICES_SNAPSHOT, "utf8")) as MaterialPayload;
  } else {
    data = await fetchJSON<MaterialPayload>(`${SITE}/api/material-prices`);
  }

  const sorted = [...data.materials].sort(
    (a, b) => Math.abs(b.yoyChange) - Math.abs(a.yoyChange)
  );
  const biggest = sorted[0];
  if (!biggest) throw new Error("No material movers");

  const direction = biggest.yoyChange >= 0 ? "up" : "down";
  const sign = biggest.yoyChange >= 0 ? "+" : "";
  const second = sorted[1];
  const detail = second
    ? `${second.name} is the next biggest mover at ${
        second.yoyChange >= 0 ? "+" : ""
      }${second.yoyChange.toFixed(1)}% YoY.`
    : "Time orders against the trend or evidence price changes in tenders.";

  return {
    eyebrow: "Material Prices",
    headline: `${biggest.name} ${direction} ${sign}${biggest.yoyChange.toFixed(
      1
    )}% YoY, the biggest mover in the UK construction basket.`,
    detail,
    href: "/dashboard/material-prices",
  };
}

function buildEmbodiedInsight(): Insight {
  // Bias toward structural and envelope materials. Floor finishes, paints,
  // sanitaryware can have huge swap percentages but they are not what
  // moves the project carbon needle on most builds.
  const HIGH_IMPACT_CATEGORIES = new Set([
    "Concrete & Cement",
    "Steel & Metals",
    "Insulation",
    "Timber & Wood",
    "Bricks & Blocks",
    "Glass",
    "Cladding",
  ]);

  let best: {
    material: (typeof iceDatabase)[number];
    alt: (typeof iceDatabase)[number];
    savingPct: number;
  } | null = null;

  for (const m of iceDatabase) {
    if (!m.alternatives?.length) continue;
    if (!HIGH_IMPACT_CATEGORIES.has(m.category)) continue;
    for (const altId of m.alternatives) {
      const alt = iceDatabase.find((a) => a.id === altId);
      if (!alt || alt.embodiedCarbon >= m.embodiedCarbon) continue;
      const savingPct =
        ((m.embodiedCarbon - alt.embodiedCarbon) / m.embodiedCarbon) * 100;
      if (!best || savingPct > best.savingPct) {
        best = { material: m, alt, savingPct };
      }
    }
  }
  if (!best) throw new Error("No high-impact alternative pair found");

  return {
    eyebrow: "Embodied Carbon",
    headline: `Switching ${best.material.name} to ${
      best.alt.name
    } cuts ~${best.savingPct.toFixed(0)}% kgCO₂e/kg.`,
    detail:
      "Use the calculator to model the swap against your spec and benchmark it against LETI and RIBA 2030 targets.",
    href: "/materials",
  };
}

async function main() {
  const insights: Insight[] = [];
  const errors: string[] = [];

  for (const [label, fn] of [
    ["carbon", buildCarbonInsight],
    ["material", buildMaterialInsight],
    ["embodied", () => Promise.resolve(buildEmbodiedInsight())],
  ] as const) {
    try {
      insights.push(await fn());
      console.log(`[insights] ${label}: ok`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[insights] ${label} failed:`, msg);
      errors.push(`${label}: ${msg}`);
    }
  }

  if (insights.length < 3) {
    console.error(
      `[insights] Only ${insights.length}/3 insights built. Refusing to write a partial snapshot.`
    );
    console.error("[insights] errors:", errors);
    process.exit(1);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    insights,
  };

  writeFileSync(OUTPUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`[insights] wrote ${OUTPUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
