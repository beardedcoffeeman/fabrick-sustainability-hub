-- Ask Pulse question log.
-- One row per question asked in the Ask Pulse panel on /my-pulse (signed-in
-- accounts only): when, the question, which data tools ran, whether the
-- answer said Pulse does not hold the data (or could not finish), the model
-- and token counts. The answer itself is never stored.
-- The daily limit (30 questions per account per UK day) counts these rows.
-- Rows are erased with the account (ON DELETE CASCADE from pulse_users).
-- NOTE: src/lib/ask/store.ts self-provisions this table (CREATE TABLE IF NOT
-- EXISTS) because the Neon env vars can't be pulled locally. This file is the
-- reference DDL - keep the two in sync.
-- Additive only - safe on the shared local/prod database.

CREATE TABLE IF NOT EXISTS pulse_ask_log (
  id                 BIGSERIAL PRIMARY KEY,
  user_id            BIGINT NOT NULL REFERENCES pulse_users(id) ON DELETE CASCADE,
  asked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  question           TEXT NOT NULL,
  -- Names of the data tools that ran for this question, in order.
  tools              TEXT[] NOT NULL DEFAULT '{}',
  -- TRUE when the answer opened "Pulse does not hold", was declined, or could not finish.
  could_not_answer   BOOLEAN NOT NULL DEFAULT FALSE,
  model              TEXT,
  input_tokens       INTEGER NOT NULL DEFAULT 0,
  output_tokens      INTEGER NOT NULL DEFAULT 0,
  cache_read_tokens  INTEGER NOT NULL DEFAULT 0,
  cache_write_tokens INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS pulse_ask_log_user_asked_idx ON pulse_ask_log (user_id, asked_at);
CREATE INDEX IF NOT EXISTS pulse_ask_log_asked_idx ON pulse_ask_log (asked_at);
