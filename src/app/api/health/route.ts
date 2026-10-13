import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import materialPrices from "@/data/material-prices-snapshot.json";
import epc from "@/data/epc-snapshot.json";
import constructionOutput from "@/data/construction-output-snapshot.json";
import insights from "@/data/insights-snapshot.json";
import planningReal from "@/data/applications-real.json";
import planningScraped from "@/data/applications-scraped.json";
import planningExtracted from "@/data/extracted-real.json";

// ──────────────────────────────────────────────────
// Pulse data-platform health
// ──────────────────────────────────────────────────
// GET /api/health
//
// One place that answers "is every Pulse feed actually working?". Checks:
//   - bundled snapshots are not older than their refresh cadence allows
//   - live upstream APIs (carbon intensity, EPC register) answer
//   - the Neon database answers
//   - planning.data.gov.uk still has an application feed (degraded, not
//     down, because /api/planning falls back to our own dataset)
//
// Returns 200 when status is "ok" or "degraded", 503 when "down". The
// health-check GitHub Action curls this daily and fails (which emails the
// repo owner) on 503. Built after the construction output feed sat broken
// for two months with nobody told (Aug-Oct 2026).
// ──────────────────────────────────────────────────

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Level = "ok" | "degraded" | "down";

interface Check {
  name: string;
  level: Level;
  detail: string;
  ageDays?: number;
  ms?: number;
}

const DAY = 24 * 60 * 60 * 1000;

function ageDays(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.round(((Date.now() - t) / DAY) * 10) / 10;
}

function snapshotCheck(
  name: string,
  generatedAt: string | undefined,
  maxDays: number,
  extra = ""
): Check {
  const age = ageDays(generatedAt);
  if (age === null) {
    return { name, level: "down", detail: "snapshot has no generatedAt" };
  }
  const level: Level = age > maxDays * 1.5 ? "down" : age > maxDays ? "degraded" : "ok";
  return {
    name,
    level,
    ageDays: age,
    detail: `${age} days old (limit ${maxDays})${extra ? `; ${extra}` : ""}`,
  };
}

async function timed<T>(fn: () => Promise<T>, timeoutMs = 8000): Promise<{ result: T | null; ms: number; error?: string }> {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const result = await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        ctrl.signal.addEventListener("abort", () => reject(new Error("timeout")))
      ),
    ]);
    return { result, ms: Date.now() - started };
  } catch (err) {
    return {
      result: null,
      ms: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

async function carbonCheck(): Promise<Check> {
  const r = await timed(async () => {
    const res = await fetch("https://api.carbonintensity.org.uk/intensity", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    const v = j?.data?.[0]?.intensity?.forecast;
    if (typeof v !== "number") throw new Error("no intensity value in payload");
    return v;
  });
  return r.error
    ? { name: "carbon-intensity-api", level: "down", detail: r.error, ms: r.ms }
    : { name: "carbon-intensity-api", level: "ok", detail: `${r.result} gCO2/kWh now`, ms: r.ms };
}

async function epcCheck(): Promise<Check> {
  const token = process.env.EPC_API_TOKEN;
  if (!token) {
    return { name: "epc-register-api", level: "down", detail: "EPC_API_TOKEN not set" };
  }
  const r = await timed(async () => {
    const res = await fetch(
      "https://api.get-energy-performance-data.communities.gov.uk/api/domestic/search?postcode=E1%206AN&page_size=5",
      { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (res.status === 401 || res.status === 403) throw new Error(`auth failed HTTP ${res.status}`);
    if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
    const j = res.status === 404 ? { data: [] } : await res.json();
    return Array.isArray(j.data) ? j.data.length : 0;
  });
  return r.error
    ? { name: "epc-register-api", level: "down", detail: r.error, ms: r.ms }
    : { name: "epc-register-api", level: "ok", detail: `${r.result} certificates for test postcode`, ms: r.ms };
}

async function planningUpstreamCheck(): Promise<Check> {
  const r = await timed(async () => {
    const res = await fetch(
      "https://www.planning.data.gov.uk/entity.json?dataset=planning-application&limit=1",
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();
    return typeof j.count === "number" ? j.count : 0;
  });
  if (r.error) {
    return { name: "planning-data-gov-uk", level: "degraded", detail: `${r.error}; /api/planning serving Pulse dataset`, ms: r.ms };
  }
  if ((r.result ?? 0) < 50) {
    return {
      name: "planning-data-gov-uk",
      level: "degraded",
      detail: `upstream has ${r.result} applications (dataset withdrawn); /api/planning serving Pulse dataset`,
      ms: r.ms,
    };
  }
  return { name: "planning-data-gov-uk", level: "ok", detail: `${r.result} applications upstream`, ms: r.ms };
}

async function dbCheck(): Promise<Check> {
  const r = await timed(async () => {
    const rows = (await sql`SELECT COUNT(*)::int AS n FROM pulse_users`) as unknown as Array<{ n: number }>;
    return rows[0]?.n ?? 0;
  });
  return r.error
    ? { name: "neon-database", level: "down", detail: r.error, ms: r.ms }
    : { name: "neon-database", level: "ok", detail: `${r.result} accounts`, ms: r.ms };
}

export async function GET() {
  const planningLatest = [
    (planningReal as { generatedAt?: string }).generatedAt,
    (planningScraped as { generatedAt?: string }).generatedAt,
    (planningExtracted as { generatedAt?: string }).generatedAt,
  ]
    .filter(Boolean)
    .sort()
    .reverse()[0];

  const snapshots: Check[] = [
    snapshotCheck("snapshot:material-prices", (materialPrices as { generatedAt?: string }).generatedAt, 45,
      `data period ${(materialPrices as { source?: { dataPeriod?: string } }).source?.dataPeriod ?? "?"}`),
    snapshotCheck("snapshot:epc-retrofit", (epc as { generatedAt?: string }).generatedAt, 14),
    snapshotCheck("snapshot:construction-output", (constructionOutput as { generatedAt?: string }).generatedAt, 60,
      `data period ${(constructionOutput as { source?: { dataPeriod?: string } }).source?.dataPeriod ?? "?"}`),
    snapshotCheck("snapshot:homepage-insights", (insights as { generatedAt?: string }).generatedAt, 45),
    snapshotCheck("snapshot:planning-explorer", planningLatest, 45,
      `${(planningReal as { applications: unknown[] }).applications.length + (planningScraped as { applications: unknown[] }).applications.length} source rows`),
  ];

  const live = await Promise.all([carbonCheck(), epcCheck(), planningUpstreamCheck(), dbCheck()]);
  const checks = [...snapshots, ...live];

  const status: Level = checks.some((c) => c.level === "down")
    ? "down"
    : checks.some((c) => c.level === "degraded")
    ? "degraded"
    : "ok";

  return NextResponse.json(
    {
      status,
      generatedAt: new Date().toISOString(),
      checks,
      summary: {
        ok: checks.filter((c) => c.level === "ok").length,
        degraded: checks.filter((c) => c.level === "degraded").length,
        down: checks.filter((c) => c.level === "down").length,
      },
    },
    { status: status === "down" ? 503 : 200, headers: { "Cache-Control": "no-store" } }
  );
}
