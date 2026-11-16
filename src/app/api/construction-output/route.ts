import { NextResponse } from "next/server";
import {
  buildConstructionOutput,
  loadConstructionOutputSnapshot,
} from "@/lib/construction-output";

// ──────────────────────────────────────────────────
// ONS CONSTRUCTION OUTPUT
// ──────────────────────────────────────────────────
// Served from src/data/construction-output-snapshot.json, which
// scripts/ingest-construction-output.ts rebuilds monthly from Table 2a of
// the ONS "Output in the construction industry" reference workbook
// (GitHub Action: refresh-construction-output.yml). The response builder
// lives in src/lib/construction-output.ts, shared with Ask Pulse.
//
// History: until October 2026 this route called the ONS beta (CMD) API live.
// That API stopped being updated for this dataset in May 2026 (latest
// version 54, data to March 2026), so the dashboard returned 502 from
// August 2026 until the snapshot approach replaced it.
//
// The response shape is unchanged so ConstructionOutputWidget and the
// My Pulse widget keep working. `history` is new: 36 months of every series
// for richer charts.
// ──────────────────────────────────────────────────

// Simple in-memory cache. The snapshot only changes on deploy, so this is
// really just saving the per-request rebuild.
let cached: ReturnType<typeof buildConstructionOutput> | null = null;

export async function GET() {
  try {
    if (!cached) cached = buildConstructionOutput(loadConstructionOutputSnapshot());
    return NextResponse.json({ ...cached, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Construction output API error:", error);
    return NextResponse.json(
      { error: "Failed to load construction output data" },
      { status: 500 }
    );
  }
}
