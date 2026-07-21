/**
 * Claude-powered extractor for UK planning decision-notice conditions.
 *
 * Used by the Planning Explorer pipeline. Given a chunk of decision-notice
 * text (typically extracted from a PDF), returns a structured list of
 * conditions tagged by type.
 *
 * Cost control:
 *   - Local SHA-256 cache at .cache/extractions/<hash>.json. Re-running over
 *     the same text never re-bills.
 *   - Prompt caching on the system prompt + tool definition (identical across
 *     all calls) — saves the bulk of input tokens.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const CACHE_DIR = join(PROJECT_ROOT, ".cache", "extractions");

// Keep in sync with src/lib/planning.ts ConditionType.
const CONDITION_TYPES = [
  "noise",
  "ecology",
  "bng",
  "transport",
  "lighting",
  "hours",
  "drainage",
  "materials",
  "s106",
  "heritage",
  "air-quality",
  "daylight",
  "fire",
  "other",
] as const;
export type ExtractedConditionType = (typeof CONDITION_TYPES)[number];

export interface ExtractedCondition {
  number: string;
  type: ExtractedConditionType;
  summary: string;
  text: string;
}

export interface Extraction {
  decision: "approved" | "refused" | "withdrawn" | "unknown";
  decisionDate: string;
  applicantSummary: string;
  conditions: ExtractedCondition[];
  // Provenance
  model: string;
  inputHash: string;
  extractedAt: string;
}

const SYSTEM_PROMPT = `You are an expert at reading UK Local Planning Authority decision notices and extracting their planning conditions.

For each decision notice you receive you must:

1. Identify whether the application was APPROVED, REFUSED, or WITHDRAWN. Use "unknown" only if it is genuinely unclear.
2. If a decision date is visible in the format DD MMMM YYYY (or similar), normalise it to YYYY-MM-DD.
3. Identify the applicant name as written.
4. Extract every numbered condition attached to the decision (look for "Conditions", "Schedule of Conditions", "Reasons for granting permission subject to the following conditions", etc.).

For each condition produce:

- "number": the condition's reference (e.g. "C7", "Condition 5", "7"). Use what the notice uses.
- "type": classify into ONE of these tags, using the closest match:
    noise        – plant noise limits, BS4142 surveys, acoustic enclosures, generator testing limits
    ecology      – protected species, habitats, ecological surveys/mitigation (excluding BNG)
    bng          – Biodiversity Net Gain conditions specifically (post-Feb 2024 ≥10% mandatory)
    transport    – HGV routing, travel plans, parking provision, cycle parking, deliveries, servicing
    lighting     – external lighting strategies, dark-skies compliance, curfews on luminance
    hours        – operational hours, construction hours, generator testing hours
    drainage     – surface water, SuDS, foul drainage, flood risk
    materials    – external materials sample approval, cladding, finishes
    s106         – Section 106 obligations, affordable housing, financial contributions
    heritage     – listed buildings, conservation areas, archaeology, setting of heritage assets
    air-quality  – CHP / kitchen extract / dust mitigation / Air Quality Neutral / construction dust
    daylight     – daylight/sunlight to neighbours, BRE Guide, overshadowing
    fire         – external wall fire performance, fire safety strategy, helipad fire (post-Grenfell)
    other        – anything that does not fit one of the above

- "summary": one short title for the condition (max ~80 chars). E.g. "Operational plant noise limit (BS4142)".
- "text": the condition's actual wording, copied as written. If it is very long, trim to ~600 characters preserving the operative part. Never paraphrase.

If the document does not appear to be a decision notice at all (e.g. it is a delegated officer's report, a committee agenda, or an application form), return an empty conditions array and decision="unknown".

You MUST call the record_conditions tool exactly once. Do not return prose.`;

const RECORD_CONDITIONS_TOOL = {
  name: "record_conditions",
  description:
    "Record the structured conditions extracted from a UK planning decision notice.",
  input_schema: {
    type: "object" as const,
    properties: {
      decision: {
        type: "string",
        enum: ["approved", "refused", "withdrawn", "unknown"],
      },
      decisionDate: {
        type: "string",
        description: "YYYY-MM-DD if visible in the notice; empty string if not.",
      },
      applicantSummary: {
        type: "string",
        description: "Applicant name as written on the notice. Empty if not visible.",
      },
      conditions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            number: { type: "string" },
            type: { type: "string", enum: [...CONDITION_TYPES] },
            summary: { type: "string" },
            text: { type: "string" },
          },
          required: ["number", "type", "summary", "text"],
        },
      },
    },
    required: ["decision", "decisionDate", "applicantSummary", "conditions"],
  },
};

const MODEL = "claude-haiku-4-5";

function hashInput(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

async function readCache(hash: string): Promise<Extraction | null> {
  const path = join(CACHE_DIR, `${hash}.json`);
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, "utf-8");
    return JSON.parse(raw) as Extraction;
  } catch {
    return null;
  }
}

async function writeCache(hash: string, data: Extraction): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(join(CACHE_DIR, `${hash}.json`), JSON.stringify(data, null, 2));
}

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (_client) return _client;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local before running the extractor."
    );
  }
  _client = new Anthropic({ apiKey: key });
  return _client;
}

interface ExtractOpts {
  /** Bypass the cache and force a fresh extraction. */
  force?: boolean;
  /** Hint identifier (e.g. application reference) used only for logging. */
  label?: string;
}

export async function extractConditionsFromText(
  text: string,
  opts: ExtractOpts = {}
): Promise<Extraction> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("extractConditionsFromText: empty input");
  }
  const hash = hashInput(trimmed);

  if (!opts.force) {
    const cached = await readCache(hash);
    if (cached) return cached;
  }

  // Truncate very long notices to keep token usage bounded. 60k chars is
  // approximately 15k tokens which covers all but the longest committee
  // decisions. The operative conditions section is usually near the top so
  // truncating from the tail is acceptable.
  const MAX_CHARS = 60_000;
  const body = trimmed.length > MAX_CHARS ? trimmed.slice(0, MAX_CHARS) : trimmed;

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        ...RECORD_CONDITIONS_TOOL,
        cache_control: { type: "ephemeral" },
      },
    ],
    tool_choice: { type: "tool", name: "record_conditions" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Decision notice text follows between <<<>>> markers. Extract the conditions.\n\n<<<\n${body}\n>>>`,
          },
        ],
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error(
      `Model did not return a tool_use block (${opts.label ?? hash.slice(0, 8)})`
    );
  }
  const input = toolUse.input as {
    decision: Extraction["decision"];
    decisionDate: string;
    applicantSummary: string;
    conditions: ExtractedCondition[];
  };

  const extraction: Extraction = {
    decision: input.decision,
    decisionDate: input.decisionDate,
    applicantSummary: input.applicantSummary,
    conditions: input.conditions,
    model: MODEL,
    inputHash: hash,
    extractedAt: new Date().toISOString(),
  };

  await writeCache(hash, extraction);
  return extraction;
}

export async function extractConditionsFromPdf(
  pdfPath: string,
  opts: ExtractOpts = {}
): Promise<Extraction> {
  const buf = await readFile(pdfPath);
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buf) });
  const result = await parser.getText();
  await parser.destroy();
  const text = result.text ?? "";
  if (text.trim().length < 50) {
    throw new Error(
      `PDF ${pdfPath} contained no extractable text (it may be a scanned image).`
    );
  }
  return extractConditionsFromText(text, {
    ...opts,
    label: opts.label ?? pdfPath,
  });
}

// CLI: `tsx scripts/lib/extract-conditions.ts path/to/notice.pdf`
//   or  `tsx scripts/lib/extract-conditions.ts -` (reads stdin)
async function cli() {
  const arg = process.argv[2];
  if (!arg) {
    console.error("Usage: tsx scripts/lib/extract-conditions.ts <pdf-path | ->");
    process.exit(1);
  }
  try {
    let result: Extraction;
    if (arg === "-") {
      const chunks: Buffer[] = [];
      for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
      result = await extractConditionsFromText(
        Buffer.concat(chunks).toString("utf-8")
      );
    } else {
      result = arg.toLowerCase().endsWith(".pdf")
        ? await extractConditionsFromPdf(arg)
        : await extractConditionsFromText(await readFile(arg, "utf-8"));
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  import("dotenv").then((m) => {
    m.config({ path: ".env.local" });
    cli();
  });
}
