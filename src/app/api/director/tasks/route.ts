import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

type TaskRow = {
  id: number;
  ref: string | null;
  title: string;
  body: string | null;
  owner: string | null;
  client: string | null;
  deadline: string | null;
  est_minutes: number | null;
  status: string;
  source: string;
  source_url: string | null;
  created_at: string;
};

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const statusFilter = url.searchParams.get("status") ?? "open,in_progress,awaiting_review";
  const statuses = statusFilter.split(",").map((s) => s.trim()).filter(Boolean);

  try {
    const rows = (await sql`
      SELECT
        id, ref, title, body, owner, client, deadline::text AS deadline,
        est_minutes, status, source, source_url, created_at::text AS created_at
      FROM director_tasks
      WHERE status = ANY(${statuses}::text[])
      ORDER BY
        CASE WHEN deadline IS NULL THEN 1 ELSE 0 END,
        deadline ASC,
        created_at DESC
      LIMIT 500
    `) as TaskRow[];

    return NextResponse.json({ tasks: rows, generatedAt: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

type NewTask = {
  title: string;
  body?: string | null;
  owner?: string | null;
  client?: string | null;
  deadline?: string | null;
  est_minutes?: number | null;
  priority?: number | null;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = (await req.json()) as NewTask;
  if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }
  try {
    const rows = await sql`
      INSERT INTO director_tasks (
        title, body, owner, client, deadline, est_minutes, priority, status, source
      ) VALUES (
        ${body.title.trim()},
        ${body.body ?? null},
        ${body.owner ?? "Tom"},
        ${body.client ?? null},
        ${body.deadline ?? null}::date,
        ${body.est_minutes ?? null},
        ${body.priority ?? null},
        'open',
        'manual'
      )
      RETURNING id
    `;
    return NextResponse.json({ id: (rows[0] as { id: number }).id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
