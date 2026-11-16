"use client";

// ---------------------------------------------------------------------------
// Ask Pulse: a question box at the top of the signed-in My Pulse page. The
// person asks for the data they need; POST /api/ask answers from Pulse's own
// records and streams one JSON event per line (src/lib/ask/types.ts): text
// as it is written, a status line while data is looked up, and each data
// table used, shown under the answer with a CSV download. Answers are drawn
// from a safe markdown subset (src/lib/ask/markdown.ts) as React elements,
// never as HTML. The thread lives in component state only.
// ---------------------------------------------------------------------------

import Link from "next/link";
import {
  Fragment,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowUp, Download, Loader2, RotateCcw, Square } from "lucide-react";
import { track } from "@/lib/analytics";
import { parseAnswerMarkdown, type MdBlock, type MdInline } from "@/lib/ask/markdown";
import {
  ASK_MAX_CHARS,
  ASK_REMAINING_WARN,
  ASK_SUGGESTIONS,
  EventLineReader,
  csvFileName,
  tableToCsv,
} from "@/lib/ask/pure";
import type { AskEvent, AskTable } from "@/lib/ask/types";

interface Exchange {
  id: string;
  question: string;
  answer: string;
  tables: AskTable[];
  status: string | null;
  error: string | null;
  /** The error may clear on a second try (not a bad question or the daily limit). */
  retry: boolean;
  stopped: boolean;
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

let seq = 0;
const newId = () => `${Date.now().toString(36)}-${(seq++).toString(36)}`;

function errorFor(status: number, serverMessage: string | undefined): { text: string; retry: boolean } {
  if (status === 401) return { text: "Your session has ended. Sign in again to keep asking.", retry: false };
  if (status === 400) return { text: serverMessage ?? "That question could not be read. Try asking it another way.", retry: false };
  if (status === 429) {
    const text = serverMessage ?? "Ask Pulse is busy right now. Wait a minute and try again.";
    return { text, retry: !/daily limit/i.test(text) };
  }
  return { text: serverMessage ?? "Ask Pulse could not answer just now. Try again in a moment.", retry: true };
}

export function AskPulse() {
  const [thread, setThread] = useState<Exchange[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const update = useCallback((id: string, fn: (e: Exchange) => Exchange) => {
    setThread((cur) => cur.map((e) => (e.id === id ? fn(e) : e)));
  }, []);

  const run = useCallback(
    async (history: Exchange[], question: string, via: "typed" | "suggestion" | "retry") => {
      const controller = new AbortController();
      abortRef.current = controller;
      const id = newId();
      const fresh: Exchange = { id, question, answer: "", tables: [], status: null, error: null, retry: false, stopped: false };
      setThread([...history, fresh]);
      setStreaming(true);
      track("ask_pulse_asked", { followUp: history.length > 0, via });

      const messages = history.flatMap((e) =>
        e.answer.trim()
          ? [
              { role: "user" as const, content: e.question },
              { role: "assistant" as const, content: e.answer },
            ]
          : [],
      );
      messages.push({ role: "user", content: question });

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const j = (await res.json().catch(() => ({}))) as { error?: string };
          const err = errorFor(res.status, j.error);
          update(id, (e) => ({ ...e, error: err.text, retry: err.retry }));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const lines = new EventLineReader();
        const apply = (events: AskEvent[]) => {
          for (const ev of events) {
            if (ev.type === "text") update(id, (e) => ({ ...e, status: null, answer: e.answer + ev.text }));
            else if (ev.type === "status") update(id, (e) => ({ ...e, status: ev.text }));
            else if (ev.type === "table") update(id, (e) => ({ ...e, tables: [...e.tables, ev.table] }));
            else if (ev.type === "error") update(id, (e) => ({ ...e, status: null, error: ev.text, retry: true }));
            else if (ev.type === "done") setRemaining(ev.remaining);
          }
        };
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          apply(lines.push(decoder.decode(value, { stream: true })));
        }
        apply(lines.push(decoder.decode()));
        apply(lines.flush());
      } catch (err) {
        if (controller.signal.aborted) {
          update(id, (e) => ({ ...e, stopped: true }));
        } else {
          update(id, (e) => ({
            ...e,
            error:
              err instanceof TypeError
                ? "Could not reach Pulse. Check your connection and try again."
                : "The answer broke off. Try again.",
            retry: true,
          }));
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        update(id, (e) => ({ ...e, status: null }));
        setStreaming(false);
      }
    },
    [update],
  );

  const ask = (text: string, via: "typed" | "suggestion") => {
    const q = text.trim();
    if (!q || streaming || q.length > ASK_MAX_CHARS) return;
    setInput("");
    void run(thread, q, via);
  };

  const retryLast = () => {
    const last = thread[thread.length - 1];
    if (!last || streaming) return;
    void run(thread.slice(0, -1), last.question, "retry");
  };

  const stop = () => {
    abortRef.current?.abort();
    inputRef.current?.focus();
  };

  const clear = () => {
    abortRef.current?.abort();
    setThread([]);
    setInput("");
    inputRef.current?.focus();
  };

  const onKey = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      ask(input, "typed");
    }
  };

  const tooLong = input.length > ASK_MAX_CHARS;
  const hasThread = thread.length > 0;

  return (
    <section
      aria-labelledby="ask-pulse-title"
      className="mb-10 rounded-2xl bg-white border border-charcoal/[0.06] p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="ask-pulse-title"
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-navy"
          >
            Ask Pulse
          </h2>
          <p className="mt-1 text-sm text-navy/80">
            Ask for the data you need and it is pulled from Pulse&apos;s own records.
          </p>
        </div>
        {hasThread && (
          <button
            type="button"
            onClick={clear}
            className={`inline-flex items-center gap-1.5 rounded-full border border-charcoal/[0.12] px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy ${focusRing}`}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            New question
          </button>
        )}
      </div>

      {/* The thread */}
      <div aria-live="polite" aria-busy={streaming} className={hasThread ? "mt-6 space-y-8" : ""}>
        {thread.map((ex, i) => (
          <ExchangeView
            key={ex.id}
            ex={ex}
            live={streaming && i === thread.length - 1}
            onRetry={i === thread.length - 1 && ex.retry && !streaming ? retryLast : undefined}
          />
        ))}
      </div>

      {/* The question box */}
      <form
        className={hasThread ? "mt-8 border-t border-charcoal/[0.08] pt-6" : "mt-5"}
        onSubmit={(e) => {
          e.preventDefault();
          ask(input, "typed");
        }}
      >
        <label htmlFor="ask-pulse-input" className="sr-only">
          {hasThread ? "Ask a follow-up question" : "Your question"}
        </label>
        <div className="flex items-end gap-2 rounded-2xl border border-charcoal/[0.14] bg-cream/40 p-2 focus-within:border-navy">
          <textarea
            id="ask-pulse-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={2}
            placeholder={
              hasThread
                ? "Ask a follow-up"
                : "e.g. How has structural steel moved over the last year?"
            }
            aria-describedby="ask-pulse-note ask-pulse-keys"
            className="min-h-[3rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-navy outline-none placeholder:text-navy/70"
          />
          {streaming ? (
            <button
              type="button"
              onClick={stop}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-navy px-4 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-white ${focusRing}`}
            >
              <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() || tooLong}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-charcoal disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
            >
              Ask
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
        <p id="ask-pulse-keys" className="sr-only">
          Enter sends the question. Shift and Enter starts a new line.
        </p>
        {input.length > ASK_MAX_CHARS - 200 && (
          <p className={`mt-1.5 text-xs ${tooLong ? "font-semibold text-navy" : "text-navy/75"}`}>
            {tooLong ? "Too long: " : ""}
            {input.length.toLocaleString("en-GB")} of {ASK_MAX_CHARS.toLocaleString("en-GB")} characters
          </p>
        )}
        <p id="ask-pulse-note" className="mt-2 text-xs text-navy/75">
          Answers come from Pulse&apos;s data. Check the source before relying on a figure.
          {remaining !== null && remaining <= ASK_REMAINING_WARN && (
            <>
              {" "}
              {remaining === 0
                ? "You have used today's questions; they reset at midnight."
                : `${remaining} ${remaining === 1 ? "question" : "questions"} left today.`}
            </>
          )}
        </p>
      </form>

      {!hasThread && (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy/75">Try asking</p>
          <ul className="mt-2 flex flex-wrap gap-2" aria-label="Suggested questions">
            {ASK_SUGGESTIONS.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => ask(s, "suggestion")}
                  disabled={streaming}
                  className={`rounded-full border border-charcoal/[0.12] bg-white px-3 py-1.5 text-left text-sm text-navy transition-colors hover:border-navy disabled:opacity-50 ${focusRing}`}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ----- One question and its answer ---------------------------------------------------------------

function ExchangeView({ ex, live, onRetry }: { ex: Exchange; live: boolean; onRetry?: () => void }) {
  const waiting = live && !ex.answer && !ex.error;
  return (
    <article>
      <h3 className="text-base font-semibold text-navy">
        <span className="sr-only">You asked: </span>
        {ex.question}
      </h3>
      <div className="mt-3 text-[15px] leading-relaxed text-navy">
        <span className="sr-only">Pulse answered: </span>
        {ex.answer && <Answer text={ex.answer} />}
        {ex.status ? (
          <p className={`flex items-center gap-2 text-sm text-navy/75 ${ex.answer ? "mt-3" : ""}`}>
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            {ex.status}
          </p>
        ) : (
          waiting && (
            <p className="flex items-center gap-2 text-sm text-navy/75">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
              Reading the question
            </p>
          )
        )}
        {ex.stopped && <p className="mt-2 text-sm text-navy/75">Stopped.</p>}
        {ex.error && (
          <p role="alert" className="mt-2 border-l-2 border-pink pl-3 text-sm text-navy">
            {ex.error}{" "}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`font-semibold underline underline-offset-2 hover:no-underline ${focusRing}`}
              >
                Try again
              </button>
            )}
          </p>
        )}
      </div>
      {ex.tables.length > 0 && <DataUsed tables={ex.tables} />}
    </article>
  );
}

function DataUsed({ tables }: { tables: AskTable[] }) {
  return (
    <details className="group mt-4 rounded-xl border border-charcoal/[0.08] bg-cream/30">
      <summary
        className={`cursor-pointer select-none list-none rounded-xl px-4 py-3 text-sm font-semibold text-navy ${focusRing}`}
      >
        <span className="mr-1.5 inline-block transition-transform group-open:rotate-90" aria-hidden>
          ›
        </span>
        Data used ({tables.length} {tables.length === 1 ? "table" : "tables"})
      </summary>
      <div className="space-y-6 px-4 pb-4">
        {tables.map((t, i) => (
          <DataTable key={`${t.fileStem}-${i}`} table={t} />
        ))}
      </div>
    </details>
  );
}

function DataTable({ table }: { table: AskTable }) {
  const download = () => {
    const blob = new Blob(["﻿", tableToCsv(table)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFileName(table.fileStem);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("ask_pulse_csv_downloaded", { table: table.fileStem.replace(/-[a-z0-9]*\d[a-z0-9]*$/, ""), rows: table.rows.length });
  };
  return (
    <div>
      <h4 className="text-sm font-semibold text-navy">{table.title}</h4>
      <div className="mt-2 max-h-80 overflow-auto rounded-lg border border-charcoal/[0.08] bg-white">
        <table className="w-full border-collapse text-left text-xs text-navy">
          <thead className="sticky top-0 bg-white">
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col" className="border-b border-charcoal/[0.1] px-3 py-2 font-semibold whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => (
              <tr key={i} className="odd:bg-cream/30">
                {r.map((v, j) => (
                  <td key={j} className="border-b border-charcoal/[0.05] px-3 py-1.5 align-top">
                    <Cell value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-navy/75">
          {table.source}{" "}
          <Link href={table.pulsePage} className={`font-semibold text-navy underline underline-offset-2 hover:no-underline ${focusRing}`}>
            See it on Pulse
          </Link>
        </p>
        <button
          type="button"
          onClick={download}
          className={`inline-flex items-center gap-1.5 rounded-full border border-charcoal/[0.14] bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-navy ${focusRing}`}
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          Download CSV
        </button>
      </div>
    </div>
  );
}

function Cell({ value }: { value: string | number | null }) {
  if (value === null || value === "") return <span className="text-navy/60">-</span>;
  if (typeof value === "number") return <span className="tabular-nums">{value.toLocaleString("en-GB")}</span>;
  if (/^https:\/\/[^\s]+$/.test(value)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className={`font-semibold underline underline-offset-2 hover:no-underline ${focusRing}`}>
        Open
        <span className="sr-only"> the council record (opens in a new tab)</span>
      </a>
    );
  }
  return <span className={value.length > 60 ? "block min-w-[16rem]" : "whitespace-nowrap"}>{value}</span>;
}

// ----- The answer, as React elements -------------------------------------------------------------

function Answer({ text }: { text: string }) {
  const blocks = parseAnswerMarkdown(text);
  return <div className="space-y-3 break-words">{blocks.map((b, i) => block(b, i))}</div>;
}

function block(b: MdBlock, i: number): ReactNode {
  switch (b.type) {
    case "p":
      return <p key={i}>{inlines(b.children)}</p>;
    case "ol":
      return (
        <ol key={i} start={b.start} className="list-decimal space-y-1 pl-5">
          {b.items.map((item, j) => (
            <li key={j}>{inlines(item)}</li>
          ))}
        </ol>
      );
    case "ul":
      return (
        <ul key={i} className="list-disc space-y-1 pl-5">
          {b.items.map((item, j) => (
            <li key={j}>{inlines(item)}</li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div key={i} className="overflow-x-auto">
          <table className="border-collapse text-left text-sm">
            <thead>
              <tr>
                {b.header.map((h, j) => (
                  <th key={j} scope="col" className="border-b border-charcoal/[0.15] py-1.5 pr-4 font-semibold">
                    {inlines(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, j) => (
                <tr key={j}>
                  {r.map((c, k) => (
                    <td key={k} className="border-b border-charcoal/[0.06] py-1.5 pr-4 align-top">
                      {inlines(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

const linkClass = `font-semibold text-navy underline decoration-teal decoration-2 underline-offset-2 hover:decoration-navy ${focusRing}`;

function inlines(nodes: MdInline[]): ReactNode {
  return nodes.map((n, i) => {
    switch (n.type) {
      case "text":
        return <Fragment key={i}>{n.text}</Fragment>;
      case "br":
        return <br key={i} />;
      case "strong":
        return (
          <strong key={i} className="font-semibold">
            {inlines(n.children)}
          </strong>
        );
      case "em":
        return <em key={i}>{inlines(n.children)}</em>;
      case "code":
        return (
          <code key={i} className="rounded bg-cream px-1 py-0.5 text-[0.9em]">
            {n.text}
          </code>
        );
      case "link":
        return n.external ? (
          <a key={i} href={n.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {inlines(n.children)}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <Link key={i} href={n.href} className={linkClass}>
            {inlines(n.children)}
          </Link>
        );
    }
  });
}
