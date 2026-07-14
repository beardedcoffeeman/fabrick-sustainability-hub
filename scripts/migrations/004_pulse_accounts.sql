-- Pulse user accounts + personal dashboards.
-- Optional accounts on top of the free no-login experience: signing up lets a
-- visitor keep their role/pinned dashboards across devices and build a custom
-- "My Pulse" dashboard of live data widgets that is there on every login.
-- Run once against the Neon database backing this project (psql or Neon SQL editor).
-- Additive only - safe on the shared local/prod database.

CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS pulse_users (
  id            BIGSERIAL PRIMARY KEY,
  email         CITEXT NOT NULL UNIQUE,
  name          TEXT,
  -- RoleSelector role id ("all" = none chosen). Kept in sync with the
  -- localStorage prefs so the role survives across devices.
  role          TEXT NOT NULL DEFAULT 'all',
  -- scrypt hash, format: scrypt:N:r:p:<salt b64url>:<hash b64url>
  password_hash TEXT NOT NULL,
  -- My Pulse widget layout: ordered array of { "type": string, "config": {} }
  widgets       JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Pinned dashboard card ids (mirrors the localStorage favourites)
  favourites    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS pulse_sessions (
  -- sha256 hex of the random session token; the raw token only lives in the
  -- user's HTTP-only cookie.
  token_hash TEXT PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES pulse_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS pulse_sessions_user_idx
  ON pulse_sessions (user_id);
CREATE INDEX IF NOT EXISTS pulse_sessions_expires_idx
  ON pulse_sessions (expires_at);
