import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon serverless client. DATABASE_URL is provisioned via the Vercel + Neon
// integration; pull it locally with `vercel env pull .env.local`.
//
// We lazy-init the client so missing DATABASE_URL doesn't blow up at build
// time on routes that import this file but never invoke the DB (Next 16
// collects page data even for API routes, which fails if neon() throws on
// module load).
//
// Usage:
//   import { sql } from "@/lib/db";
//   const rows = await sql`SELECT 1`;

let cached: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Provision the Neon integration on Vercel and run `vercel env pull .env.local` locally."
    );
  }
  cached = neon(url);
  return cached;
}

// Proxy-style export so `sql\`...\`` calls resolve the client lazily.
export const sql: NeonQueryFunction<false, false> = ((
  ...args: Parameters<NeonQueryFunction<false, false>>
) => getClient()(...args)) as NeonQueryFunction<false, false>;
