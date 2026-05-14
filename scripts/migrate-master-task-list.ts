// One-off migration: parse Tom's master-task-list.md and seed director_tasks.
// Idempotent on `ref` — re-running upserts rather than duplicating.
//
// Usage:
//   npx tsx scripts/migrate-master-task-list.ts
//   npx tsx scripts/migrate-master-task-list.ts --dry-run
//
// Source: /Users/tom/Work/Fabrick/Client-System/_daily-briefing/master-task-list.md

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import "dotenv/config";

const SOURCE_PATH =
  "/Users/tom/Work/Fabrick/Client-System/_daily-briefing/master-task-list.md";

type ParsedTask = {
  ref: string | null;
  title: string;
  body: string;
  owner: string | null;
  deadline: string | null;
  estMinutes: number | null;
  status: "open" | "in_progress" | "awaiting_review" | "completed" | "dropped";
};

function parseDeadlineHint(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  if (trimmed.includes("today")) return iso(today);
  if (trimmed.includes("tomorrow")) {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return iso(t);
  }
  const m = trimmed.match(/(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const named = trimmed.match(
    /(mon|tue|wed|thu|fri|sat|sun)\s+(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/
  );
  if (named) {
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const day = parseInt(named[2], 10);
    const month = months[named[3]];
    const year = today.getMonth() > month + 6 ? today.getFullYear() + 1 : today.getFullYear();
    return iso(new Date(year, month, day));
  }
  return null;
}

function parseEstMinutes(raw: string | null): number | null {
  if (!raw) return null;
  const m = raw.match(/(\d+(?:\.\d+)?)\s*hr/i);
  if (m) return Math.round(parseFloat(m[1]) * 60);
  const mm = raw.match(/(\d+)\s*min/i);
  if (mm) return parseInt(mm[1], 10);
  return null;
}

function parseTasks(md: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const match = line.match(/^- \[( |x|X)\] (.+)$/);
    if (!match) { i++; continue; }

    const checked = match[1].toLowerCase() === "x";
    let body = match[2];
    let j = i + 1;
    while (j < lines.length && lines[j].startsWith("  ") && !lines[j].match(/^- \[/)) {
      body += "\n" + lines[j];
      j++;
    }
    const fullText = body;

    const refMatch = fullText.match(/\*\*(NEW-[A-Z]+\d+[A-Z]?(?:-[A-Z]+)?)/);
    const ref = refMatch ? refMatch[1] : null;

    const titleMatch = fullText.match(/\*\*[^*]+\*\*(.+?)(?:·|$)/);
    const titleRaw = (titleMatch ? titleMatch[0] : fullText)
      .replace(/\*\*/g, "")
      .replace(/^(NEW-[A-Z]+\d+[A-Z]?\.?\s*)/, "")
      .split("·")[0]
      .trim();
    const title = titleRaw.length > 200 ? titleRaw.slice(0, 200) + "…" : titleRaw;

    const ownerMatch = fullText.match(/\*\*Owner:\*\*\s*([^·\n]+)/i);
    const owner = ownerMatch ? ownerMatch[1].trim() : null;

    const deadlineMatch = fullText.match(/\*\*DEADLINE:\*\*\s*([^·\n]+)/i);
    const deadline = parseDeadlineHint(deadlineMatch ? deadlineMatch[1] : null);

    const estMatch = fullText.match(/\*\*Est:\*\*\s*([^·\n]+)/i);
    const estMinutes = parseEstMinutes(estMatch ? estMatch[1] : null);

    let status: ParsedTask["status"] = checked ? "completed" : "open";
    if (!checked && /awaiting[- ]review/i.test(fullText)) status = "awaiting_review";
    if (!checked && /in[- ]progress/i.test(fullText)) status = "in_progress";

    tasks.push({ ref, title, body: fullText, owner, deadline, estMinutes, status });
    i = j;
  }
  return tasks;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const url = process.env.DATABASE_URL;
  if (!url && !dryRun) {
    throw new Error("DATABASE_URL not set. Run `vercel env pull .env.local` first.");
  }

  const md = readFileSync(SOURCE_PATH, "utf-8");
  const tasks = parseTasks(md);

  console.log(`Parsed ${tasks.length} tasks from ${SOURCE_PATH}`);
  const withRef = tasks.filter((t) => t.ref).length;
  const open = tasks.filter((t) => t.status === "open").length;
  console.log(`  ${withRef} with NEW-* ref, ${open} open`);

  if (dryRun) {
    console.log("\nFirst 5 parsed tasks:");
    for (const t of tasks.slice(0, 5)) {
      console.log({
        ref: t.ref,
        title: t.title.slice(0, 80),
        owner: t.owner,
        deadline: t.deadline,
        est: t.estMinutes,
        status: t.status,
      });
    }
    return;
  }

  const sql = neon(url!);
  let inserted = 0;
  let updated = 0;
  for (const t of tasks) {
    if (t.ref) {
      const result = await sql`
        INSERT INTO director_tasks (ref, title, body, owner, deadline, est_minutes, status, source)
        VALUES (${t.ref}, ${t.title}, ${t.body}, ${t.owner}, ${t.deadline}, ${t.estMinutes}, ${t.status}, 'master_task_list')
        ON CONFLICT (ref) DO UPDATE SET
          title = EXCLUDED.title,
          body = EXCLUDED.body,
          owner = EXCLUDED.owner,
          deadline = EXCLUDED.deadline,
          est_minutes = EXCLUDED.est_minutes,
          status = EXCLUDED.status,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if ((result[0] as { inserted: boolean }).inserted) inserted++;
      else updated++;
    } else {
      await sql`
        INSERT INTO director_tasks (title, body, owner, deadline, est_minutes, status, source)
        VALUES (${t.title}, ${t.body}, ${t.owner}, ${t.deadline}, ${t.estMinutes}, ${t.status}, 'master_task_list')
      `;
      inserted++;
    }
  }

  await sql`
    INSERT INTO director_ingestion_state (source, last_synced)
    VALUES ('master_task_list', NOW())
    ON CONFLICT (source) DO UPDATE SET last_synced = NOW()
  `;

  console.log(`Done. ${inserted} inserted, ${updated} updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
