// Ask Pulse: the pure parts shared by the route, the panel and the tests:
// request checking, the daily limit's day, the "not held" marker, the event
// stream format and the CSV export. No server or browser APIs here.
import type { AskEvent, AskTable } from "./types";

export const ASK_MAX_MESSAGES = 20;
export const ASK_MAX_CHARS = 2000;
export const ASK_DAILY_LIMIT = 30;
/** Most model calls one question may make (the first plus up to five after tool results). */
export const ASK_MAX_CALLS = 6;
/** Show "N questions left today" only at or below this. */
export const ASK_REMAINING_WARN = 5;

/**
 * The answer opens with exactly this when Pulse does not hold what was asked
 * (src/lib/ask/prompt.ts tells the model to), so the log can flag the gaps.
 */
export const ASK_NOT_HELD = "Pulse does not hold";

export type AskRole = "user" | "assistant";
export type AskMessage = { role: AskRole; content: string };
export type AskCheck = { ok: true; messages: AskMessage[] } | { ok: false; status: 400; error: string };

/**
 * Checks the conversation sent by the panel. Keeps the last 20 messages,
 * starting on a question; drops empty answers (a stopped stream); questions
 * must be 1 to 2,000 characters, and the last message must be a question.
 * Earlier answers are cut to 2,000 characters rather than refused, so a long
 * answer never blocks a follow-up.
 */
export function checkAskRequest(body: unknown): AskCheck {
  const bad = (error: string): AskCheck => ({ ok: false, status: 400, error });
  if (!body || typeof body !== "object") return bad("Send a question.");
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) return bad("Send a question.");
  if (raw.length > 200) return bad("That conversation is too long. Start a new question.");

  const messages: AskMessage[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return bad("That conversation could not be read. Start a new question.");
    const role = (m as { role?: unknown }).role;
    const content = (m as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") {
      return bad("That conversation could not be read. Start a new question.");
    }
    const text = content.trim();
    if (role === "assistant") {
      if (text) messages.push({ role, content: text.slice(0, ASK_MAX_CHARS) });
      continue;
    }
    if (!text) return bad("Type a question first.");
    if (text.length > ASK_MAX_CHARS) return bad(`Keep each question under ${ASK_MAX_CHARS.toLocaleString("en-GB")} characters.`);
    messages.push({ role, content: text });
  }

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") return bad("The last message must be your question.");

  let kept = messages.slice(-ASK_MAX_MESSAGES);
  while (kept.length && kept[0].role !== "user") kept = kept.slice(1);
  // Two questions in a row (an answer that never arrived): keep only the later one.
  const merged: AskMessage[] = [];
  for (const m of kept) {
    if (merged.length && merged[merged.length - 1].role === m.role) merged[merged.length - 1] = m;
    else merged.push(m);
  }
  return { ok: true, messages: merged };
}

/** The calendar day in the UK as YYYY-MM-DD: the daily limit resets at UK midnight. */
export function ukDay(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Today in words for the prompt, e.g. "Monday 16 November 2026". */
export function ukDateWords(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
}

/** Did the answer open with the "not held" marker? Tolerates leading space and curly quotes. */
export function saidNotHeld(answer: string): boolean {
  return answer.replace(/[‘’]/g, "'").trim().toLowerCase().startsWith(ASK_NOT_HELD.toLowerCase());
}

export const ASK_LIMIT_MESSAGE = `You have asked ${ASK_DAILY_LIMIT} questions today, which is the daily limit. It resets at midnight UK time. Every Pulse dashboard is still open to you in the meantime.`;

// ----- The event stream --------------------------------------------------------------------------

export function encodeEvent(e: AskEvent): string {
  return JSON.stringify(e) + "\n";
}

function isTable(t: unknown): t is AskTable {
  if (!t || typeof t !== "object") return false;
  const x = t as Record<string, unknown>;
  return (
    typeof x.title === "string" &&
    Array.isArray(x.columns) &&
    x.columns.every((c) => typeof c === "string") &&
    Array.isArray(x.rows) &&
    x.rows.every((r) => Array.isArray(r) && r.every((v) => v === null || typeof v === "string" || typeof v === "number")) &&
    typeof x.source === "string" &&
    typeof x.fileStem === "string" &&
    typeof x.pulsePage === "string"
  );
}

export function parseEventLine(line: string): AskEvent[] {
  if (!line.trim()) return [];
  try {
    const e = JSON.parse(line) as Record<string, unknown>;
    if ((e.type === "text" || e.type === "status" || e.type === "error") && typeof e.text === "string") {
      return [{ type: e.type, text: e.text }];
    }
    if (e.type === "table" && isTable(e.table)) return [{ type: "table", table: e.table }];
    if (e.type === "done") return [{ type: "done", remaining: typeof e.remaining === "number" ? e.remaining : null }];
  } catch {
    /* not an event: ignored */
  }
  return [];
}

/** Splits a stream of chunks into whole events; a line cut between chunks waits for the rest. */
export class EventLineReader {
  private buffer = "";
  push(chunk: string): AskEvent[] {
    this.buffer += chunk;
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() ?? "";
    return lines.flatMap(parseEventLine);
  }
  flush(): AskEvent[] {
    const rest = this.buffer;
    this.buffer = "";
    return parseEventLine(rest);
  }
}

// ----- CSV ---------------------------------------------------------------------------------------

function csvCell(v: string | number | null): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  // A text cell starting with = + - @ could run as a formula in a spreadsheet.
  let s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  if (/[",\r\n]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** The table as CSV: header row, data rows, then a blank line and the source. */
export function tableToCsv(table: AskTable): string {
  const lines = [table.columns, ...table.rows].map((row) => row.map(csvCell).join(","));
  lines.push("", csvCell(`Source: ${table.source}`), csvCell(`See it on Pulse: https://pulse.fabrick.agency${table.pulsePage}`));
  return lines.join("\r\n") + "\r\n";
}

/** File name with the date at the end: pulse-material-prices-2026-11-16.csv. */
export function csvFileName(stem: string, date: Date = new Date()): string {
  const safe = stem.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "pulse-data";
  return `${safe}-${ukDay(date)}.csv`;
}

// ----- What the panel offers ---------------------------------------------------------------------

export const ASK_SUGGESTIONS = [
  "Which councils in the North West have the most homes below EPC band C?",
  "How has structural steel moved over the last year?",
  "What was infrastructure output in the last 6 months?",
  "What noise conditions have been put on logistics schemes?",
  "What is the embodied carbon of glulam compared with steel sections?",
];
