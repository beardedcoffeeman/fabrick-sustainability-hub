/**
 * Monthly AI research pass over the regulations timeline.
 *
 * Phase 1: Claude (Opus 4.8) with web search researches what has changed in
 * UK construction sustainability regulation since the timeline was last
 * edited - new announcements, moved dates, consultations closing, rules
 * going live.
 *
 * Phase 2: a second, tool-free call converts those findings into a strict
 * JSON changeset (validated against the RegulationEvent shape), which is
 * applied to src/lib/regulations-data.json.
 *
 * The workflow (.github/workflows/refresh-regulations.yml) turns any
 * resulting diff into a pull request for human review - this script never
 * pushes to main itself. A summary for the PR body is written to
 * .cache/regulations-research-summary.md.
 *
 * Run locally: ANTHROPIC_API_KEY=... npx tsx scripts/research-regulations.ts
 */
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "src", "lib", "regulations-data.json");
const SUMMARY_PATH = join(__dirname, "..", ".cache", "regulations-research-summary.md");

const STATUSES = ["active", "upcoming", "consultation", "future"] as const;
const CATEGORIES = ["carbon", "energy", "reporting", "trade"] as const;
const ROLES = ["developer", "architect", "manufacturer", "contractor"] as const;

interface RegulationEvent {
  id: string;
  title: string;
  date: string;
  status: (typeof STATUSES)[number];
  category: (typeof CATEGORIES)[number];
  description: string;
  impact: string;
  affectedRoles: string[];
}

interface Update {
  id: string;
  date: string | null;
  status: string | null;
  description: string | null;
  impact: string | null;
  reason: string;
  sources: string[];
}

interface Addition extends RegulationEvent {
  reason: string;
  sources: string[];
}

interface Changeset {
  no_changes: boolean;
  summary: string;
  updates: Update[];
  additions: Addition[];
}

const nullableString = { type: ["string", "null"] };
const CHANGESET_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["no_changes", "summary", "updates", "additions"],
  properties: {
    no_changes: { type: "boolean" },
    summary: { type: "string" },
    updates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "date", "status", "description", "impact", "reason", "sources"],
        properties: {
          id: { type: "string" },
          date: nullableString,
          status: { anyOf: [{ type: "string", enum: [...STATUSES] }, { type: "null" }] },
          description: nullableString,
          impact: nullableString,
          reason: { type: "string" },
          sources: { type: "array", items: { type: "string" } },
        },
      },
    },
    additions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id", "title", "date", "status", "category",
          "description", "impact", "affectedRoles", "reason", "sources",
        ],
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          date: { type: "string" },
          status: { type: "string", enum: [...STATUSES] },
          category: { type: "string", enum: [...CATEGORIES] },
          description: { type: "string" },
          impact: { type: "string" },
          affectedRoles: { type: "array", items: { type: "string", enum: [...ROLES] } },
          reason: { type: "string" },
          sources: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function main() {
  const client = new Anthropic();
  const regulations: RegulationEvent[] = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const today = new Date().toISOString().slice(0, 10);

  // ---- Phase 1: research with web search -------------------------------
  const researchPrompt = `Today is ${today}. You maintain the UK construction regulations timeline on Pulse by Fabrick (pulse.fabrick.agency/regulations), aimed at UK developers, architects, manufacturers and contractors tracking sustainability compliance.

Here is the current timeline data:

${JSON.stringify(regulations, null, 2)}

Research what has changed since this data was written. Specifically:

1. For each existing entry: has its date moved, has its status changed (e.g. consultation closed, regulation now in force), or has its substance materially changed? Check official sources (gov.uk, legislation.gov.uk, HSE, FCA) rather than commentary where possible.
2. Are there NEW UK regulations, standards, or formal consultations relevant to construction sustainability that are missing from the timeline and significant enough to include? Think: Future Homes/Buildings Standard, Part Z / embodied carbon, UK CBAM, MEES / EPC minimums, Building Safety Act milestones, UK SRS / FCA sustainability reporting, EPR for packaging, biodiversity net gain, heat network zoning, and anything comparable that has been announced.

Only propose changes you can support with a specific source. If a date or status is unchanged, leave it alone. Prefer under-reporting to speculation: this feeds a client-facing compliance page. At the end, write a clear findings list: each proposed update or addition with its effective date, status, and source URLs. If nothing has changed, say so plainly.`;

  console.log("Phase 1: researching (this can take a few minutes)...");
  let messages: Anthropic.MessageParam[] = [{ role: "user", content: researchPrompt }];
  let research: Anthropic.Message;
  for (let i = 0; ; i++) {
    const stream = client.messages.stream({
      model: "claude-opus-4-8",
      max_tokens: 64000,
      thinking: { type: "adaptive" },
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 20 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 15 },
      ],
      messages,
    });
    research = await stream.finalMessage();
    if (research.stop_reason !== "pause_turn") break;
    if (i >= 5) throw new Error("research did not complete within 5 continuations");
    messages = [...messages, { role: "assistant", content: research.content }];
  }

  const findings = research.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  console.log(`Phase 1 complete (${findings.length} chars of findings).`);

  // ---- Phase 2: structure the findings ---------------------------------
  console.log("Phase 2: structuring changeset...");
  const structured = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    output_config: { format: { type: "json_schema", schema: CHANGESET_SCHEMA } },
    messages: [
      {
        role: "user",
        content: `Convert these research findings into a changeset for the regulations timeline below. Rules:
- "updates" only for entries whose id exists in the current data; set unchanged fields to null.
- "additions" only for genuinely new, well-sourced regulations; id must be a new kebab-case slug; description <= 60 words; impact = one sentence on what affected companies should do; date = the effective/deadline date (YYYY-MM-DD, use the 1st when only a month is known).
- If the findings report no changes, set no_changes to true and leave both arrays empty.
- "summary" = 2-4 sentences a reviewer can read to understand the changeset.

Current data:
${JSON.stringify(regulations, null, 2)}

Research findings:
${findings}`,
      },
    ],
  });

  const jsonText = structured.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const changeset: Changeset = JSON.parse(jsonText);

  // ---- Validate + apply -------------------------------------------------
  if (changeset.no_changes || (changeset.updates.length === 0 && changeset.additions.length === 0)) {
    console.log("No regulation changes found this month.");
    return;
  }

  const byId = new Map(regulations.map((r) => [r.id, r]));
  const applied: string[] = [];

  for (const u of changeset.updates) {
    const reg = byId.get(u.id);
    if (!reg) {
      console.warn(`skipping update for unknown id ${u.id}`);
      continue;
    }
    if (u.date !== null && !DATE_RE.test(u.date)) {
      console.warn(`skipping update for ${u.id}: bad date ${u.date}`);
      continue;
    }
    if (u.date !== null) reg.date = u.date;
    if (u.status !== null) reg.status = u.status as RegulationEvent["status"];
    if (u.description !== null) reg.description = u.description;
    if (u.impact !== null) reg.impact = u.impact;
    applied.push(`- **Update** \`${u.id}\`: ${u.reason}\n  Sources: ${u.sources.join(", ")}`);
  }

  for (const a of changeset.additions) {
    if (byId.has(a.id)) {
      console.warn(`skipping addition with duplicate id ${a.id}`);
      continue;
    }
    if (!DATE_RE.test(a.date)) {
      console.warn(`skipping addition ${a.id}: bad date ${a.date}`);
      continue;
    }
    const { reason, sources, ...event } = a;
    regulations.push(event);
    byId.set(a.id, event);
    applied.push(`- **New** \`${a.id}\` (${event.title}, ${event.date}): ${reason}\n  Sources: ${sources.join(", ")}`);
  }

  if (applied.length === 0) {
    console.log("Changeset produced no valid changes after validation.");
    return;
  }

  regulations.sort((x, y) => x.date.localeCompare(y.date));
  writeFileSync(DATA_PATH, JSON.stringify(regulations, null, 2) + "\n");

  mkdirSync(dirname(SUMMARY_PATH), { recursive: true });
  writeFileSync(
    SUMMARY_PATH,
    `${changeset.summary}\n\n## Changes\n\n${applied.join("\n")}\n\n` +
      `Researched ${today} by the monthly regulations refresh (Claude Opus 4.8 with web search). ` +
      `Review dates and sources before merging - merging deploys straight to the live timeline.\n`,
  );
  console.log(`Applied ${applied.length} change(s) to regulations-data.json.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
