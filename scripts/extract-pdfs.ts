/**
 * Batch-run the Claude condition extractor across every PDF in
 * _pipeline/decision-notices/. Results are aggregated into
 * src/data/extracted-real.json, which the API route surfaces in the
 * Planning Explorer Conditions tab.
 *
 * Usage:
 *   tsx scripts/extract-pdfs.ts
 *
 * Each PDF should be accompanied by a sidecar `<name>.meta.json` file with
 * basic metadata for the application (LPA, reference, applicant, sector,
 * etc.). The extractor only knows about the conditions inside the PDF; the
 * sidecar tells us what application those conditions belong to.
 *
 * Sidecar shape:
 *   {
 *     "id": "real-001",
 *     "reference": "P/04321/006",
 *     "lpa": "Slough Borough Council",
 *     "region": "South East",
 *     "address": "Bath Road, Slough",
 *     "postcode": "SL1 6AA",
 *     "useClass": "Sui Generis",
 *     "sector": "data-centre",
 *     "description": "Hyperscale data centre comprising...",
 *     "applicant": "Beacon Hyperscale Ltd",
 *     "agent": "Quod Planning",
 *     "decisionDate": "2025-11-14",  // optional; extractor may also detect
 *     "grossFloorAreaSqm": 142000,    // optional
 *     "sourceUrl": "https://..."     // optional, where you downloaded it from
 *   }
 */
import "dotenv/config";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractConditionsFromPdf,
  extractConditionsFromText,
} from "./lib/extract-conditions";
import type {
  Application,
  Sector,
  Region,
  Decision,
} from "../src/lib/planning";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const PIPELINE_DIR = join(PROJECT_ROOT, "_pipeline", "decision-notices");
const OUTPUT = join(PROJECT_ROOT, "src", "data", "extracted-real.json");

interface Sidecar {
  id: string;
  reference: string;
  lpa: string;
  region: Region;
  address: string;
  postcode?: string;
  useClass: string;
  sector: Sector;
  description: string;
  applicant: string;
  agent?: string;
  decisionDate?: string;
  grossFloorAreaSqm?: number;
  sourceUrl?: string;
}

async function loadSidecar(noticePath: string): Promise<Sidecar | null> {
  const sidecarPath = noticePath.replace(/\.(pdf|txt)$/i, ".meta.json");
  if (!existsSync(sidecarPath)) {
    console.warn(`  no sidecar for ${basename(noticePath)} — skipping`);
    return null;
  }
  const raw = await readFile(sidecarPath, "utf-8");
  return JSON.parse(raw) as Sidecar;
}

async function loadDotenv() {
  const dotenv = await import("dotenv");
  dotenv.config({ path: join(PROJECT_ROOT, ".env.local") });
}

async function main() {
  await loadDotenv();
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set in .env.local");
    process.exit(1);
  }

  if (!existsSync(PIPELINE_DIR)) {
    await mkdir(PIPELINE_DIR, { recursive: true });
    console.log(
      `Created ${PIPELINE_DIR}\nDrop decision-notice PDFs (with .meta.json sidecars) in here and re-run.`
    );
    return;
  }

  const entries = await readdir(PIPELINE_DIR);
  const noticePaths = entries
    .filter((f) => /\.(pdf|txt)$/i.test(f))
    .map((f) => resolve(PIPELINE_DIR, f));

  if (noticePaths.length === 0) {
    console.log(`No decision-notice files found in ${PIPELINE_DIR}.`);
    console.log(
      "Drop one or more .pdf or .txt decision notices (with sidecar .meta.json files) and re-run."
    );
    return;
  }

  console.log(
    `Extracting conditions from ${noticePaths.length} decision notice(s)...`
  );

  const applications: Application[] = [];
  for (const noticePath of noticePaths) {
    const name = basename(noticePath);
    console.log(`\n[ ${name} ]`);
    const meta = await loadSidecar(noticePath);
    if (!meta) continue;

    try {
      const isPdf = noticePath.toLowerCase().endsWith(".pdf");
      const extraction = isPdf
        ? await extractConditionsFromPdf(noticePath, { label: meta.id })
        : await extractConditionsFromText(
            await readFile(noticePath, "utf-8"),
            { label: meta.id }
          );
      const decision: Decision =
        extraction.decision === "approved" ||
        extraction.decision === "refused" ||
        extraction.decision === "withdrawn"
          ? extraction.decision
          : "approved";

      const application: Application = {
        id: meta.id,
        reference: meta.reference,
        lpa: meta.lpa,
        region: meta.region,
        address: meta.address,
        postcode: meta.postcode ?? "",
        useClass: meta.useClass,
        sector: meta.sector,
        description: meta.description,
        applicant: meta.applicant,
        agent: meta.agent ?? "",
        decision,
        decisionDate:
          meta.decisionDate ?? extraction.decisionDate ?? "",
        grossFloorAreaSqm: meta.grossFloorAreaSqm,
        conditions: (extraction.conditions ?? []).map((c) => ({
          number: c.number,
          type: c.type,
          summary: c.summary,
          text: c.text,
        })),
        source: "claude-extraction",
        sourceUrl: meta.sourceUrl,
      };
      applications.push(application);
      console.log(
        `  ✓ ${extraction.conditions.length} condition${
          extraction.conditions.length === 1 ? "" : "s"
        } extracted, decision=${extraction.decision}`
      );
    } catch (err) {
      console.error(
        `  ✗ failed: ${err instanceof Error ? err.message : err}`
      );
    }
  }

  await writeFile(
    OUTPUT,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "claude-extraction",
        note: "Real planning conditions extracted from decision-notice PDFs by Claude Sonnet 4.6.",
        applications,
      },
      null,
      2
    )
  );
  console.log(`\nWrote ${applications.length} applications to ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
