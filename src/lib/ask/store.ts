// Ask Pulse: the question log in Neon (pulse_ask_log). One row per question,
// written after the answer has gone: who asked (account id), when, the
// question, which tools ran, whether the answer said Pulse does not hold the
// data (or could not finish), the model and token counts. Never the answer.
// The daily limit counts today's rows for the account. Rows go with the
// account (ON DELETE CASCADE), so account deletion erases them too.
//
// Self-applying schema, same pattern as ensureSchema() in src/lib/account.ts;
// keep in sync with scripts/migrations/006_pulse_ask.sql.
import { sql } from "@/lib/db";
import { ensureSchema } from "@/lib/account";
import { ASK_DAILY_LIMIT } from "./pure";

let askSchemaReady: Promise<void> | null = null;

export function ensureAskSchema(): Promise<void> {
  if (!askSchemaReady) {
    askSchemaReady = (async () => {
      await ensureSchema(); // pulse_users must exist for the foreign key
      await sql`
        CREATE TABLE IF NOT EXISTS pulse_ask_log (
          id                 BIGSERIAL PRIMARY KEY,
          user_id            BIGINT NOT NULL REFERENCES pulse_users(id) ON DELETE CASCADE,
          asked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          question           TEXT NOT NULL,
          tools              TEXT[] NOT NULL DEFAULT '{}',
          could_not_answer   BOOLEAN NOT NULL DEFAULT FALSE,
          model              TEXT,
          input_tokens       INTEGER NOT NULL DEFAULT 0,
          output_tokens      INTEGER NOT NULL DEFAULT 0,
          cache_read_tokens  INTEGER NOT NULL DEFAULT 0,
          cache_write_tokens INTEGER NOT NULL DEFAULT 0
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS pulse_ask_log_user_asked_idx ON pulse_ask_log (user_id, asked_at)`;
      await sql`CREATE INDEX IF NOT EXISTS pulse_ask_log_asked_idx ON pulse_ask_log (asked_at)`;
    })().catch((err) => {
      askSchemaReady = null;
      throw err;
    });
  }
  return askSchemaReady;
}

/** Questions this account has asked since UK midnight today. */
export async function questionsAskedToday(userId: number): Promise<number> {
  await ensureAskSchema();
  const rows = (await sql`
    SELECT COUNT(*)::int AS n
    FROM pulse_ask_log
    WHERE user_id = ${userId}
      AND asked_at >= (date_trunc('day', NOW() AT TIME ZONE 'Europe/London') AT TIME ZONE 'Europe/London')
  `) as unknown as Array<{ n: number }>;
  return rows[0]?.n ?? 0;
}

export function remainingToday(asked: number): number {
  return Math.max(0, ASK_DAILY_LIMIT - asked);
}

export interface AskLogEntry {
  userId: number;
  askedAt: Date;
  question: string;
  tools: string[];
  couldNotAnswer: boolean;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export async function logAskQuestion(e: AskLogEntry): Promise<void> {
  await ensureAskSchema();
  await sql`
    INSERT INTO pulse_ask_log
      (user_id, asked_at, question, tools, could_not_answer, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens)
    VALUES (
      ${e.userId},
      ${e.askedAt.toISOString()},
      ${e.question.slice(0, 2000)},
      ${e.tools},
      ${e.couldNotAnswer},
      ${e.model},
      ${e.inputTokens},
      ${e.outputTokens},
      ${e.cacheReadTokens},
      ${e.cacheWriteTokens}
    )
  `;
}

export interface AskAdminStats {
  questions30d: number;
  askers30d: number;
  couldNotAnswer30d: number;
  recent: Array<{ asked_at: string; question: string; tools: string[]; could_not_answer: boolean }>;
}

/** The compact block for /api/admin/stats. No emails, no answers. */
export async function askAdminStats(): Promise<AskAdminStats> {
  await ensureAskSchema();
  const totals = (await sql`
    SELECT
      COUNT(*)::int AS questions,
      COUNT(DISTINCT user_id)::int AS askers,
      COUNT(*) FILTER (WHERE could_not_answer)::int AS not_answered
    FROM pulse_ask_log
    WHERE asked_at >= NOW() - INTERVAL '30 days'
  `) as unknown as Array<{ questions: number; askers: number; not_answered: number }>;
  const recent = (await sql`
    SELECT asked_at, question, tools, could_not_answer
    FROM pulse_ask_log
    ORDER BY asked_at DESC
    LIMIT 50
  `) as unknown as AskAdminStats["recent"];
  return {
    questions30d: totals[0]?.questions ?? 0,
    askers30d: totals[0]?.askers ?? 0,
    couldNotAnswer30d: totals[0]?.not_answered ?? 0,
    recent,
  };
}
