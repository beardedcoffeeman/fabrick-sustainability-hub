// Ask Pulse: types shared by the route, the tools and the browser. No server
// or browser APIs here.

/** A data table used in an answer, shown under it with a CSV download. */
export interface AskTable {
  title: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
  /** One line naming the publisher, dataset and data period. */
  source: string;
  /** File name stem for the CSV, e.g. "pulse-material-prices" (the date is added on download). */
  fileStem: string;
  /** Where to see it on Pulse. */
  pulsePage: string;
}

/**
 * The answer streams as one JSON object per line:
 *  - text:   answer text as it is written
 *  - status: what is being looked up ("Checking material prices")
 *  - table:  a data table the answer used
 *  - error:  the answer could not be finished (shown as a short message)
 *  - done:   the end, with the questions left today when known
 */
export type AskEvent =
  | { type: "text"; text: string }
  | { type: "status"; text: string }
  | { type: "table"; table: AskTable }
  | { type: "error"; text: string }
  | { type: "done"; remaining: number | null };

export interface AskSource {
  publisher: string;
  dataset: string;
  url: string | null;
}

/** What a data tool hands back to the model (serialised as JSON). */
export interface ToolPayload {
  source: AskSource;
  /** The period the data covers, as the record states it. */
  dataPeriod: string;
  /** When the record was generated or fetched (ISO), null when the record does not say. */
  generatedAt: string | null;
  /** The Pulse page where the person can see this data. */
  pulsePage: string;
  caveats: string[];
  [key: string]: unknown;
}

export type ToolOutcome =
  | { ok: true; payload: ToolPayload; tables: AskTable[] }
  | { ok: false; error: string };
