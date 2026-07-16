-- Pulse launch poll responses.
-- Anonymous three-question feedback form at /poll (rebuilt from the Lovable
-- prototype at pulsefabrick.lovable.app): favourite feature, data wishlist,
-- and questions people want Pulse to answer.
-- NOTE: the /api/poll routes also self-provision this table (CREATE TABLE IF
-- NOT EXISTS via src/lib/poll-table.ts) because the Neon env vars can't be
-- pulled locally. This file is the reference DDL - keep the two in sync.
-- Additive only - safe on the shared local/prod database.

CREATE TABLE IF NOT EXISTS pulse_poll_responses (
  id         BIGSERIAL PRIMARY KEY,
  -- Q1 radio choice; NULL when the visitor skipped it.
  feature    TEXT,
  -- Q2 free text: what data do you wish was easier to access?
  data_wish  TEXT,
  -- Q3 free text: a question you'd like Pulse to answer.
  question   TEXT,
  user_agent TEXT,
  ip_hash    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
