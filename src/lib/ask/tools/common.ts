// Ask Pulse tools: the shape every data tool shares.
import type { ToolOutcome } from "../types";
import type { InputSpec, InputValue } from "../schema";
import type { EpcSearchResult } from "@/lib/epc-live";
import type { CarbonIntensityNow } from "@/lib/carbon-intensity";

/** What a tool may need from outside its own records. Tests pass stand-ins. */
export interface ToolContext {
  now: Date;
  /** MHCLG token; without it the live postcode lookup is unavailable (never sample data). */
  epcToken?: string;
  searchEpc?: (postcode: string, token: string) => Promise<EpcSearchResult>;
  fetchGrid?: () => Promise<CarbonIntensityNow>;
}

export interface AskTool<S extends InputSpec = InputSpec> {
  name: string;
  description: string;
  spec: S;
  /** The status line shown while the tool runs, e.g. "Checking material prices". */
  status: (input: InputValue<S>) => string;
  run: (input: InputValue<S>, ctx: ToolContext) => Promise<ToolOutcome> | ToolOutcome;
}

/** Declare a tool with its input type inferred from its spec. */
export function defineTool<S extends InputSpec>(tool: AskTool<S>): AskTool<S> {
  return tool;
}

export const fail = (error: string): ToolOutcome => ({ ok: false, error });
