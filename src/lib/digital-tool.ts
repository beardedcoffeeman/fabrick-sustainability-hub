// Direct Postgres connection to the Internal Fabrick Digital Tool's Supabase DB.
// Used to query Georgia's logged activity live, instead of relying on the
// export-script + sync-folder pipeline.
//
// Requires env:
//   DIGITAL_TOOL_DATABASE_URL   (Supabase Postgres connection string)
//
// Note: Pulse's own DB lives at DATABASE_URL via @neondatabase/serverless.
// The Digital Tool is a separate Postgres — we connect to it independently.

import { neon } from "@neondatabase/serverless";

let cached: ReturnType<typeof neon> | null = null;

export function getDigitalToolDb() {
  if (cached) return cached;
  const url = process.env.DIGITAL_TOOL_DATABASE_URL;
  if (!url) {
    throw new Error(
      "DIGITAL_TOOL_DATABASE_URL not set. Copy from Internal Digital Tool .env.",
    );
  }
  cached = neon(url);
  return cached;
}

export type GeorgiaActivity = {
  date: string;
  client: string;
  service_line: string;
  duration_minutes: number;
  description: string | null;
};

export async function getGeorgiaActivity(
  sinceDate: string,
  untilDate: string,
): Promise<GeorgiaActivity[]> {
  const sql = getDigitalToolDb();
  // Tables are Prisma-defaulted PascalCase, so they need double-quoting in raw SQL.
  // Schema reference: /Users/tom/Code/Cursor-projects/Internal Fabrick Digital Tool/prisma/schema.prisma
  const rows = (await sql`
    SELECT
      to_char(a."date", 'YYYY-MM-DD') AS date,
      COALESCE(c."name", '(unassigned)') AS client,
      a."serviceLine" AS service_line,
      (a."hours" * 60 + a."minutes") AS duration_minutes,
      a."description" AS description
    FROM "Activity" a
    JOIN "User" u ON u."id" = a."userId"
    LEFT JOIN "Client" c ON c."id" = a."clientId"
    WHERE LOWER(u."name") LIKE '%georgia%'
      AND a."date" >= ${sinceDate}::timestamp
      AND a."date" <= ${untilDate}::timestamp
    ORDER BY a."date" DESC, c."name" ASC
  `) as GeorgiaActivity[];
  return rows;
}
