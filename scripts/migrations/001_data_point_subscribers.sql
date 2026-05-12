-- The Data Point newsletter subscribers.
-- Run once against the Neon database backing this project (psql or Neon SQL editor).

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS data_point_subscribers (
  id              BIGSERIAL PRIMARY KEY,
  email           CITEXT NOT NULL UNIQUE,
  source          TEXT NOT NULL DEFAULT 'home_hero',
  user_agent      TEXT,
  ip_hash         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS data_point_subscribers_created_at_idx
  ON data_point_subscribers (created_at DESC);
