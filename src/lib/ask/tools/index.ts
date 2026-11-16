// Ask Pulse: the tool registry. Every tool is read-only, takes a closed and
// fully required input (checked again here before it runs), and returns its
// records with the source, data period, Pulse page and caveats.
import type Anthropic from "@anthropic-ai/sdk";
import { checkInput, toJsonSchema, type InputSpec } from "../schema";
import type { ToolOutcome, ToolPayload } from "../types";
import type { AskTool, ToolContext } from "./common";
import { getConstructionOutput } from "./construction-output";
import { getEmbodiedCarbon } from "./embodied-carbon";
import { getEpcCouncils, getEpcPostcode } from "./epc";
import { getGridCarbon } from "./grid-carbon";
import { getMaterialPrices } from "./material-prices";
import { getPlanningConditions, searchPlanningApplications } from "./planning";
import { getRegulations } from "./regulations";

export type { ToolContext } from "./common";

// Fixed order: tools render before the system prompt, so the list must be
// byte-identical on every request or the prompt cache misses.
export const ASK_TOOLS: AskTool<InputSpec>[] = [
  getMaterialPrices,
  getConstructionOutput,
  getEpcCouncils,
  getEpcPostcode,
  getGridCarbon,
  searchPlanningApplications,
  getPlanningConditions,
  getRegulations,
  getEmbodiedCarbon,
] as unknown as AskTool<InputSpec>[];

export const ASK_TOOL_NAMES = ASK_TOOLS.map((t) => t.name);

/** The tool definitions sent to the model: strict schemas, inputs streamed as written. */
export const ASK_TOOL_DEFS: Anthropic.Beta.Messages.BetaTool[] = ASK_TOOLS.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: toJsonSchema(t.spec),
  strict: true,
  eager_input_streaming: true,
}));

/** Largest tool result handed back to the model, in characters of JSON. */
export const MAX_RESULT_CHARS = 30_000;

/**
 * Serialises a payload for the model within MAX_RESULT_CHARS: when too long,
 * the longest array in it is halved (repeatedly) and a caveat says so.
 */
export function serialisePayload(payload: ToolPayload): string {
  let json = JSON.stringify(payload);
  if (json.length <= MAX_RESULT_CHARS) return json;
  const copy: ToolPayload = JSON.parse(json);
  let trimmed = false;
  for (let guard = 0; guard < 20 && json.length > MAX_RESULT_CHARS; guard++) {
    const arrays = Object.entries(copy).filter(([k, v]) => Array.isArray(v) && k !== "caveats" && (v as unknown[]).length > 1) as Array<[string, unknown[]]>;
    if (!arrays.length) break;
    const [key, arr] = arrays.sort((a, b) => JSON.stringify(b[1]).length - JSON.stringify(a[1]).length)[0];
    copy[key] = arr.slice(0, Math.ceil(arr.length / 2));
    trimmed = true;
    json = JSON.stringify(copy);
  }
  if (trimmed) {
    copy.caveats = [...copy.caveats, "This result was shortened to fit: fewer rows are listed than matched. The full list is in the data table under the answer."];
    json = JSON.stringify(copy);
  }
  return json.length <= MAX_RESULT_CHARS ? json : json.slice(0, MAX_RESULT_CHARS);
}

export interface ToolRun {
  /** Status line for the person, null when the input was rejected before running. */
  status: string | null;
  outcome: ToolOutcome;
}

export function findTool(name: string): AskTool<InputSpec> | undefined {
  return ASK_TOOLS.find((t) => t.name === name);
}

/** The status line for a call, or null for an unknown tool or bad input. */
export function statusFor(name: string, raw: unknown): string | null {
  const tool = findTool(name);
  if (!tool) return null;
  const checked = checkInput(tool.spec, raw);
  return checked.ok ? tool.status(checked.value) : null;
}

/** Validates and runs one tool call. Never throws: failures come back as error outcomes. */
export async function runAskTool(name: string, raw: unknown, ctx: ToolContext): Promise<ToolOutcome> {
  const tool = findTool(name);
  if (!tool) return { ok: false, error: `Unknown tool ${name}. Tools: ${ASK_TOOL_NAMES.join(", ")}.` };
  const checked = checkInput(tool.spec, raw);
  if (!checked.ok) {
    let received = "";
    try {
      received = JSON.stringify(raw).slice(0, 300);
    } catch {
      received = "(unreadable)";
    }
    return { ok: false, error: `INVALID_INPUT: ${checked.error} Received: ${received}` };
  }
  try {
    return await tool.run(checked.value, ctx);
  } catch (e) {
    console.error(`ask: tool ${name} failed`, e instanceof Error ? e.message : e);
    return { ok: false, error: "This data could not be read just now. Tell the person and suggest they try again or open the Pulse page for it." };
  }
}
