import { sql } from "@/lib/db";

// The Neon integration's env vars can't be pulled locally (they arrive empty
// from `vercel env pull`), so scripts/migrations/005_pulse_poll.sql can't be
// run from this machine. Instead the poll routes self-provision: CREATE TABLE
// IF NOT EXISTS once per lambda instance, memoized so warm invocations skip
// the round-trip. Keep the DDL in sync with the migration file.
let ensured: Promise<void> | null = null;

export function ensurePollTable(): Promise<void> {
  if (!ensured) {
    ensured = sql`
      CREATE TABLE IF NOT EXISTS pulse_poll_responses (
        id         BIGSERIAL PRIMARY KEY,
        feature    TEXT,
        data_wish  TEXT,
        question   TEXT,
        user_agent TEXT,
        ip_hash    TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.then(() => undefined)
      .catch((err) => {
        // Allow the next request to retry rather than caching the failure.
        ensured = null;
        throw err;
      });
  }
  return ensured;
}
