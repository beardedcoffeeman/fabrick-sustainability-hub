import {
  createHash,
  randomBytes,
  scrypt as scryptCb,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import {
  defaultWidgets,
  sanitiseWidgets,
  type WidgetInstance,
} from "@/lib/widgets";

function scrypt(
  password: string,
  salt: Buffer,
  keylen: number,
  opts: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, keylen, opts, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

// ---------------------------------------------------------------------------
// Pulse accounts - server-side auth core.
// ---------------------------------------------------------------------------
// Email + password with DB-backed sessions in an HTTP-only cookie. Deliberately
// self-contained (node:crypto scrypt, no auth framework): the Resend account
// can currently only deliver to tom@fabrick.agency, so magic links are not an
// option until fabrick.agency is verified as a sending domain - at which point
// a magic-link or Google provider can be added alongside without changing the
// session model.
//
// Named "account.ts" (and routes live under /api/account/*) to avoid colliding
// with the Director's Brief branch, which owns src/lib/auth.ts and
// /api/auth/[...nextauth].
// ---------------------------------------------------------------------------

export const SESSION_COOKIE = "pulse_session";
const SESSION_DAYS = 180;

// scrypt parameters (N, r, p) recorded in the hash string so they can be
// raised later without invalidating existing hashes.
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keep in sync with ROLES in src/components/home/RoleSelector.tsx. */
export const ROLE_IDS = [
  "all",
  "architect",
  "specifier",
  "site-manager",
  "contractor",
  "manufacturer",
  "sustainability-lead",
] as const;

export interface AccountUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
  widgets: WidgetInstance[];
  favourites: string[];
}

interface UserRow {
  id: number;
  email: string;
  name: string | null;
  role: string;
  password_hash: string;
  widgets: unknown;
  favourites: unknown;
}

function toAccountUser(row: UserRow): AccountUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: typeof row.role === "string" ? row.role : "all",
    widgets: sanitiseWidgets(row.widgets) ?? [],
    favourites: sanitiseFavourites(row.favourites) ?? [],
  };
}

export function sanitiseFavourites(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  return [
    ...new Set(
      raw.filter(
        (f): f is string => typeof f === "string" && f.length <= 64,
      ),
    ),
  ].slice(0, 20);
}

export function isValidRole(role: unknown): role is string {
  return (
    typeof role === "string" && (ROLE_IDS as readonly string[]).includes(role)
  );
}

// -- Schema ------------------------------------------------------------------
// The Neon integration's env vars are marked sensitive in Vercel, so the
// connection string cannot be pulled locally to run scripts/migrations/
// 004_pulse_accounts.sql by hand. Instead the schema self-applies on first
// use: everything is IF NOT EXISTS and runs once per server instance. Keep
// this in sync with the SQL file (which remains the documented source of
// truth).

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE EXTENSION IF NOT EXISTS citext`;
      await sql`
        CREATE TABLE IF NOT EXISTS pulse_users (
          id            BIGSERIAL PRIMARY KEY,
          email         CITEXT NOT NULL UNIQUE,
          name          TEXT,
          role          TEXT NOT NULL DEFAULT 'all',
          password_hash TEXT NOT NULL,
          widgets       JSONB NOT NULL DEFAULT '[]'::jsonb,
          favourites    JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_login_at TIMESTAMPTZ
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS pulse_sessions (
          token_hash TEXT PRIMARY KEY,
          user_id    BIGINT NOT NULL REFERENCES pulse_users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS pulse_sessions_user_idx ON pulse_sessions (user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS pulse_sessions_expires_idx ON pulse_sessions (expires_at)`;
    })().catch((err) => {
      // Allow a retry on the next request rather than caching the failure.
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

// -- Password hashing --------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join(":");
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nStr, rStr, pStr, saltB64, hashB64] = parts;
  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return false;
  }
  const salt = Buffer.from(saltB64, "base64url");
  const expected = Buffer.from(hashB64, "base64url");
  const actual = await scrypt(password, salt, expected.length, {
    N,
    r,
    p,
    maxmem: 64 * 1024 * 1024,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// -- Sessions ----------------------------------------------------------------

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface NewSession {
  token: string;
  expires: Date;
}

/** Create a DB session for a user and return the raw token for the cookie. */
export async function createSession(userId: number): Promise<NewSession> {
  await ensureSchema();
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO pulse_sessions (token_hash, user_id, expires_at)
    VALUES (${hashToken(token)}, ${userId}, ${expires.toISOString()})
  `;
  // Opportunistic cleanup so expired sessions don't accumulate forever.
  await sql`DELETE FROM pulse_sessions WHERE expires_at < NOW()`;
  return { token, expires };
}

export async function destroySession(token: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM pulse_sessions WHERE token_hash = ${hashToken(token)}`;
}

export function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}

/** Resolve the signed-in user from the request cookie, or null. */
export async function getSessionUser(): Promise<AccountUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  await ensureSchema();
  const rows = (await sql`
    SELECT u.id, u.email, u.name, u.role, u.password_hash, u.widgets, u.favourites
    FROM pulse_sessions s
    JOIN pulse_users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > NOW()
  `) as unknown as UserRow[];
  if (rows.length === 0) return null;
  return toAccountUser(rows[0]);
}

// -- User CRUD ---------------------------------------------------------------

export class EmailTakenError extends Error {}

export async function createUser(opts: {
  email: string;
  password: string;
  name: string | null;
  role: string;
  favourites: string[];
}): Promise<AccountUser> {
  const passwordHash = await hashPassword(opts.password);
  await ensureSchema();
  const widgets = defaultWidgets(opts.favourites, opts.role);
  const rows = (await sql`
    INSERT INTO pulse_users (email, name, role, password_hash, widgets, favourites, last_login_at)
    VALUES (
      ${opts.email},
      ${opts.name},
      ${opts.role},
      ${passwordHash},
      ${JSON.stringify(widgets)}::jsonb,
      ${JSON.stringify(opts.favourites)}::jsonb,
      NOW()
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, name, role, password_hash, widgets, favourites
  `) as unknown as UserRow[];
  if (rows.length === 0) throw new EmailTakenError();
  return toAccountUser(rows[0]);
}

export async function findUserByEmail(
  email: string,
): Promise<(AccountUser & { passwordHash: string }) | null> {
  await ensureSchema();
  const rows = (await sql`
    SELECT id, email, name, role, password_hash, widgets, favourites
    FROM pulse_users WHERE email = ${email}
  `) as unknown as UserRow[];
  if (rows.length === 0) return null;
  return { ...toAccountUser(rows[0]), passwordHash: rows[0].password_hash };
}

/**
 * Merge anonymous localStorage prefs into the account at sign-in:
 * favourites are unioned; a concrete local role beats a stored "all"; an empty
 * widget layout is seeded from the merged pins/role. Returns the fresh user.
 */
export async function mergeLocalPrefs(
  user: AccountUser,
  local: { role?: unknown; favourites?: unknown },
): Promise<AccountUser> {
  const localFavs = sanitiseFavourites(local.favourites) ?? [];
  const favourites = [...new Set([...user.favourites, ...localFavs])].slice(0, 20);
  const role =
    isValidRole(local.role) && local.role !== "all" ? local.role : user.role;
  const widgets =
    user.widgets.length > 0 ? user.widgets : defaultWidgets(favourites, role);
  const rows = (await sql`
    UPDATE pulse_users
    SET role = ${role},
        favourites = ${JSON.stringify(favourites)}::jsonb,
        widgets = ${JSON.stringify(widgets)}::jsonb,
        last_login_at = NOW()
    WHERE id = ${user.id}
    RETURNING id, email, name, role, password_hash, widgets, favourites
  `) as unknown as UserRow[];
  return toAccountUser(rows[0]);
}

// -- Best-effort login rate limiting ------------------------------------------
// In-memory, so per serverless instance only - a determined attacker can spread
// across instances, but this still blunts naive credential stuffing without
// adding infrastructure. Window: 10 failures per 10 minutes per IP.

const attempts = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 10;

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) return false;
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
  // Bound the map so it can't grow without limit on a long-lived instance.
  if (attempts.size > 10_000) attempts.clear();
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
