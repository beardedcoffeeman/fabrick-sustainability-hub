import { after, NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSessionUser, type AccountUser } from "@/lib/account";
import { askSystem } from "@/lib/ask/prompt";
import {
  ASK_DAILY_LIMIT,
  ASK_LIMIT_MESSAGE,
  ASK_MAX_CALLS,
  checkAskRequest,
  encodeEvent,
  saidNotHeld,
} from "@/lib/ask/pure";
import { logAskQuestion, questionsAskedToday, remainingToday } from "@/lib/ask/store";
import { ASK_TOOL_DEFS, runAskTool, serialisePayload, statusFor } from "@/lib/ask/tools";
import type { AskEvent } from "@/lib/ask/types";

type BetaEvent = Anthropic.Beta.Messages.BetaRawMessageStreamEvent;
type BetaMessageParam = Anthropic.Beta.Messages.BetaMessageParam;
type BetaToolUse = Anthropic.Beta.Messages.BetaToolUseBlock;
type BetaToolResult = Anthropic.Beta.Messages.BetaToolResultBlockParam;
// The beta stream params (the SDK's BetaMessageStreamParams is not re-exported on the namespace).
type BetaStreamParams = Anthropic.Beta.Messages.MessageCreateParamsNonStreaming;

// POST /api/ask: Ask Pulse. Body { messages: [{ role, content }] }.
// Answers questions about UK construction data from Pulse's own records,
// read through the data tools in src/lib/ask/tools (every figure comes from
// a tool result; see src/lib/ask/prompt.ts). Streams one JSON event per line
// (src/lib/ask/types.ts AskEvent): text as it is written, a status line while
// a tool runs, each data table used, and done with the questions left today.
// Signed-in accounts only; 30 questions per account per UK day, counted in
// pulse_ask_log, where each question is logged once the answer has gone
// (never the answer).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEFAULT_MODEL = "claude-opus-5-5";
const MAX_TABLES = 8;

// What the person sees when the answer cannot be given in full.
const REFUSED = "Sorry, I can't help with that one. Ask about the construction data Pulse holds, such as material prices, construction output, EPC ratings, planning applications, grid carbon, embodied carbon or regulations.";
const CUT_SHORT = "The answer ran out of room there. Ask about one part at a time and it will be shorter.";
const BROKE_OFF = "Sorry, the answer broke off. Ask again in a moment.";
const TOO_MANY = "That needed more lookups than one question allows. Try asking about one dataset or one place at a time.";

function fail(status: number, error: string) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

// A failure from the API as a short message for the person (the detail goes to the server log).
function apiFailure(e: unknown): { status: number; message: string } {
  if (e instanceof Anthropic.RateLimitError) return { status: 429, message: "Ask Pulse is busy right now. Wait a minute and try again." };
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
    return { status: 503, message: "Ask Pulse is not set up correctly at the moment. Please try again later." };
  }
  if (e instanceof Anthropic.BadRequestError) return { status: 502, message: "Ask Pulse could not answer that. Start a new question and try again." };
  if (e instanceof Anthropic.APIConnectionTimeoutError) return { status: 504, message: "Ask Pulse took too long to answer. Try again." };
  if (e instanceof Anthropic.APIConnectionError) return { status: 502, message: "Could not reach Ask Pulse's AI service. Try again in a moment." };
  if (e instanceof Anthropic.InternalServerError) return { status: 503, message: "Ask Pulse's AI service is busy. Try again in a moment." };
  if (e instanceof Anthropic.APIError) return { status: 502, message: "Ask Pulse could not answer just now. Try again." };
  return { status: 500, message: "Something went wrong. Try again." };
}

// Server-side refusal fallback ("default" routes by refusal category) and
// explicit preserved-thinking behaviour, for the model families that take
// them. Neither field is typed in @anthropic-ai/sdk 0.95.2, so they are added
// to the request body untyped (the SDK sends unknown body fields as given).
function modelExtras(model: string): { betas: string[]; extra: Record<string, unknown> } {
  const current = /^claude-(opus-5|sonnet-5-5|fable-5|mythos-5)/.test(model);
  if (!current) return { betas: [], extra: {} };
  return {
    betas: ["server-side-fallback-2026-07-01", "thinking-binding-controls-2026-08-01"],
    extra: {
      fallbacks: "default",
      // Each question's tool loop replays the assistant turn unchanged and
      // earlier turns carry no thinking blocks, so nothing should ever be
      // dropped; if it were, degrade rather than fail the answer.
      thinking: { type: "adaptive", block_binding: { prefix_mismatch_behavior: "drop_block" } },
    },
  };
}

export async function POST(req: NextRequest) {
  let user: AccountUser | null;
  try {
    user = await getSessionUser();
  } catch (e) {
    console.error("ask: session lookup failed", e instanceof Error ? e.message : e);
    return fail(503, "Ask Pulse is not available right now. Please try again later.");
  }
  if (!user) return fail(401, "Sign in to ask Pulse a question.");

  const checked = checkAskRequest(await req.json().catch(() => null));
  if (!checked.ok) return fail(checked.status, checked.error);
  const { messages } = checked;

  if (!process.env.ANTHROPIC_API_KEY) {
    return fail(503, "Ask Pulse is not switched on yet. Every Pulse dashboard is still open to you.");
  }

  // The limit fails open: a database hiccup must not stop someone getting an answer.
  const asked = await questionsAskedToday(user.id).catch((e) => {
    console.warn("ask: usage count failed", e instanceof Error ? e.message : e);
    return null;
  });
  if (asked !== null && asked >= ASK_DAILY_LIMIT) return fail(429, ASK_LIMIT_MESSAGE);
  const remaining = asked === null ? null : remainingToday(asked + 1);

  const now = new Date();
  const model = process.env.PULSE_ASK_MODEL || DEFAULT_MODEL;
  const { betas, extra } = modelExtras(model);
  const system = askSystem(now);
  const client = new Anthropic({ maxRetries: 2, timeout: 55_000 });
  // Everything before the messages (the tools, the system prompt's first
  // block) is the same on every call, so the cached prefix holds across
  // questions and across the calls inside one question.
  const open = (convo: BetaMessageParam[]) => {
    const params = {
      model,
      max_tokens: 8000,
      output_config: { effort: "low" },
      ...(betas.length ? { betas } : {}),
      tools: ASK_TOOL_DEFS,
      tool_choice: { type: "auto" },
      system,
      messages: convo,
      ...extra,
    } as BetaStreamParams;
    return client.beta.messages.stream(params, { signal: req.signal });
  };

  let convo: BetaMessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));
  let upstream = open(convo);
  // Wait for the stream to open before answering, so a refused key, a rate
  // limit or an outage comes back as a proper status and message rather than
  // a half-open stream.
  let events = upstream[Symbol.asyncIterator]();
  let first: IteratorResult<BetaEvent>;
  try {
    first = await events.next();
  } catch (e) {
    if (e instanceof Anthropic.APIUserAbortError || req.signal.aborted) return new Response(null, { status: 499 });
    const f = apiFailure(e);
    console.error("ask: request failed", e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
    return fail(f.status, f.message);
  }

  const userId = user.id;
  const question = messages[messages.length - 1].content;
  const encoder = new TextEncoder();
  const toolCtx = { now, epcToken: process.env.EPC_API_TOKEN || undefined };
  let answer = "";
  let trouble = false; // refused, cut short, broke off or too many lookups
  const toolsUsed: string[] = [];
  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  let servedBy = model;

  // The function must stay alive until the log is written, after the stream
  // has closed. Registered now, while the request is plainly in progress.
  let logDone: () => void = () => {};
  after(new Promise<void>((resolve) => (logDone = resolve)));

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let alive = true;
      const emit = (e: AskEvent) => {
        if (!alive) return;
        try {
          controller.enqueue(encoder.encode(encodeEvent(e)));
        } catch {
          alive = false; // the browser has gone
        }
      };
      let breakBefore = false;
      const say = (text: string) => {
        if (breakBefore && answer.trim() && !answer.endsWith("\n")) text = `\n\n${text}`;
        breakBefore = false;
        answer += text;
        emit({ type: "text", text });
      };
      const sentTables = new Set<string>();

      // One tool call: check the input, read the records, send any table to
      // the panel. Anything that goes wrong goes back to the model as an
      // error result, never as a thrown error.
      const runTool = async (use: BetaToolUse): Promise<BetaToolResult> => {
        const status = statusFor(use.name, use.input);
        if (status) emit({ type: "status", text: status });
        toolsUsed.push(use.name);
        const outcome = await runAskTool(use.name, use.input, toolCtx);
        if (!outcome.ok) {
          return { type: "tool_result", tool_use_id: use.id, content: JSON.stringify({ error: outcome.error }), is_error: true };
        }
        for (const table of outcome.tables) {
          const key = JSON.stringify(table);
          if (sentTables.has(key) || sentTables.size >= MAX_TABLES) continue;
          sentTables.add(key);
          emit({ type: "table", table });
        }
        return { type: "tool_result", tool_use_id: use.id, content: serialisePayload(outcome.payload) };
      };

      try {
        for (let call = 1; ; call++) {
          for (let r = first; !r.done; r = await events.next()) {
            const ev = r.value;
            if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") say(ev.delta.text);
          }
          const final = await upstream.finalMessage();
          const u = final.usage;
          usage.input += u.input_tokens ?? 0;
          usage.output += u.output_tokens ?? 0;
          usage.cacheRead += u.cache_read_input_tokens ?? 0;
          usage.cacheWrite += u.cache_creation_input_tokens ?? 0;
          if (final.model) servedBy = final.model;
          const uses = final.content.filter((b): b is BetaToolUse => b.type === "tool_use");
          console.info(
            `ask: call=${call} model=${final.model} stop=${final.stop_reason} tools=${uses.map((t) => t.name).join(",") || "none"} in=${u.input_tokens} cache_write=${u.cache_creation_input_tokens ?? 0} cache_read=${u.cache_read_input_tokens ?? 0} out=${u.output_tokens}`,
          );
          // A refusal or a cut-off can leave a tool call half written: never run that turn's tools.
          if (final.stop_reason === "refusal") {
            trouble = true;
            say(answer.trim() ? `\n\n${REFUSED}` : REFUSED);
            break;
          }
          if (final.stop_reason === "max_tokens") {
            trouble = true;
            say(`\n\n${CUT_SHORT}`);
            break;
          }
          if (final.stop_reason !== "tool_use" || !uses.length) {
            if (!answer.trim()) {
              trouble = true;
              emit({ type: "error", text: BROKE_OFF });
            }
            break;
          }
          if (call >= ASK_MAX_CALLS) {
            trouble = true;
            say(answer.trim() ? `\n\n${TOO_MANY}` : TOO_MANY);
            break;
          }
          // The assistant's turn goes back exactly as it came (thinking
          // blocks included), then one message holding every tool result.
          const results = await Promise.all(uses.map(runTool));
          convo = [
            ...convo,
            { role: "assistant", content: final.content as Anthropic.Beta.Messages.BetaContentBlockParam[] },
            { role: "user", content: results },
          ];
          breakBefore = true;
          upstream = open(convo);
          events = upstream[Symbol.asyncIterator]();
          first = await events.next();
        }
        emit({ type: "done", remaining });
      } catch (e) {
        if (!(e instanceof Anthropic.APIUserAbortError) && !req.signal.aborted) {
          trouble = true;
          console.error("ask: stream failed", e instanceof Anthropic.APIError ? `${e.status} ${e.message}` : e);
          emit({ type: "error", text: BROKE_OFF });
          emit({ type: "done", remaining });
        }
      } finally {
        if (alive) {
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
        // After the answer has gone, never in its way; a failed write is only a warning.
        await logAskQuestion({
          userId,
          askedAt: now,
          question,
          tools: toolsUsed,
          couldNotAnswer: trouble || !answer.trim() || saidNotHeld(answer),
          model: servedBy,
          inputTokens: usage.input,
          outputTokens: usage.output,
          cacheReadTokens: usage.cacheRead,
          cacheWriteTokens: usage.cacheWrite,
        })
          .catch((e) => console.warn("ask: question log failed", e instanceof Error ? e.message : e))
          .finally(logDone);
      }
    },
    cancel() {
      upstream.abort();
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
