import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

const ALLOWED_STATUSES = [
  "open",
  "in_progress",
  "awaiting_review",
  "completed",
  "dropped",
] as const;

type Patch = {
  status?: (typeof ALLOWED_STATUSES)[number];
  title?: string;
  body?: string | null;
  owner?: string | null;
  client?: string | null;
  deadline?: string | null;
  priority?: number | null;
  est_minutes?: number | null;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await ctx.params;
  const taskId = parseInt(id, 10);
  if (!Number.isFinite(taskId)) {
    return NextResponse.json({ error: "invalid task id" }, { status: 400 });
  }

  const patch = (await req.json()) as Patch;
  if (patch.status && !ALLOWED_STATUSES.includes(patch.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  try {
    const completedAt =
      patch.status === "completed" ? new Date().toISOString() : null;
    const clearCompletedAt =
      patch.status && patch.status !== "completed" ? true : false;

    const rows = await sql`
      UPDATE director_tasks
      SET
        status = COALESCE(${patch.status ?? null}, status),
        title = COALESCE(${patch.title ?? null}, title),
        body = CASE WHEN ${patch.body === undefined} THEN body ELSE ${patch.body ?? null} END,
        owner = CASE WHEN ${patch.owner === undefined} THEN owner ELSE ${patch.owner ?? null} END,
        client = CASE WHEN ${patch.client === undefined} THEN client ELSE ${patch.client ?? null} END,
        deadline = CASE WHEN ${patch.deadline === undefined} THEN deadline ELSE ${patch.deadline ?? null}::date END,
        priority = CASE WHEN ${patch.priority === undefined} THEN priority ELSE ${patch.priority ?? null} END,
        est_minutes = CASE WHEN ${patch.est_minutes === undefined} THEN est_minutes ELSE ${patch.est_minutes ?? null} END,
        completed_at = CASE
          WHEN ${completedAt !== null} THEN NOW()
          WHEN ${clearCompletedAt} THEN NULL
          ELSE completed_at
        END,
        updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING id, status, completed_at::text AS completed_at
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "task not found" }, { status: 404 });
    }
    return NextResponse.json({ task: rows[0] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await ctx.params;
  const taskId = parseInt(id, 10);
  if (!Number.isFinite(taskId)) {
    return NextResponse.json({ error: "invalid task id" }, { status: 400 });
  }
  try {
    await sql`UPDATE director_tasks SET status = 'dropped', updated_at = NOW() WHERE id = ${taskId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
