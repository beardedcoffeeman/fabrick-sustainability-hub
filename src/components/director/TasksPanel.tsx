"use client";

import { useState } from "react";
import { mutate } from "swr";
import { useLiveData } from "./swr";

type Task = {
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
};

type Resp = { tasks: Task[]; generatedAt: string; error?: string };

const TASKS_URL = "/api/director/tasks";

function isOverdue(d: string | null): boolean {
  if (!d) return false;
  return d < new Date().toISOString().slice(0, 10);
}

function isToday(d: string | null): boolean {
  if (!d) return false;
  return d === new Date().toISOString().slice(0, 10);
}

function ownerIsTom(o: string | null): boolean {
  return (o ?? "").toLowerCase().startsWith("tom");
}

async function toggleTask(id: number, currentStatus: string) {
  const next = currentStatus === "completed" ? "open" : "completed";
  await fetch(`/api/director/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: next }),
  });
  mutate(TASKS_URL);
}

async function addTask(payload: {
  title: string;
  deadline?: string;
  est_minutes?: number;
}) {
  await fetch(TASKS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  mutate(TASKS_URL);
}

export function TasksPanel() {
  const { data, error, isLoading } = useLiveData<Resp>(TASKS_URL);

  if (isLoading) return <Shell title="Master Task List"><Skeleton /></Shell>;
  if (error || data?.error)
    return (
      <Shell title="Master Task List">
        <ErrorBox
          msg={data?.error ?? "Failed to load tasks"}
          hint="Run scripts/migrations/003_director_brief.sql + npm run migrate:director."
        />
      </Shell>
    );

  const tasks = (data?.tasks ?? []).filter((t) => ownerIsTom(t.owner)).slice(0, 80);
  const overdue = tasks.filter((t) => isOverdue(t.deadline));
  const today = tasks.filter((t) => isToday(t.deadline));
  const week = tasks.filter((t) => !isToday(t.deadline) && !isOverdue(t.deadline));

  return (
    <Shell
      title={`Master Task List (${tasks.length})`}
      generatedAt={data?.generatedAt}
      action={<AddTaskInline />}
    >
      {overdue.length > 0 && <Group label="Overdue" tone="danger" tasks={overdue} />}
      <Group label="Today" tone="warn" tasks={today} />
      <Group label="This week + later" tone="muted" tasks={week} />
    </Shell>
  );
}

function Group({
  label,
  tone,
  tasks,
}: {
  label: string;
  tone: "danger" | "warn" | "muted";
  tasks: Task[];
}) {
  if (tasks.length === 0 && tone !== "warn") return null;
  const toneClasses =
    tone === "danger"
      ? "text-red-700"
      : tone === "warn"
        ? "text-amber-700"
        : "text-stone-500";
  return (
    <div className="mb-4 last:mb-0">
      <h3 className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${toneClasses}`}>
        {label} ({tasks.length})
      </h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-stone-500">—</p>
      ) : (
        <ul className="divide-y divide-stone-200 rounded-md border border-stone-200 bg-white">
          {tasks.map((t) => (
            <TaskRow key={t.id} t={t} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskRow({ t }: { t: Task }) {
  const [busy, setBusy] = useState(false);
  return (
    <li className="flex items-start gap-3 px-3 py-2.5">
      <input
        type="checkbox"
        checked={t.status === "completed"}
        disabled={busy}
        onChange={async () => {
          setBusy(true);
          try {
            await toggleTask(t.id, t.status);
          } finally {
            setBusy(false);
          }
        }}
        className="mt-1 h-4 w-4 rounded border-stone-300"
      />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${t.status === "completed" ? "text-stone-400 line-through" : "text-slate-900"}`}>
          {t.ref && <span className="mr-2 text-xs text-stone-400">{t.ref}</span>}
          {t.title}
        </p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-stone-500">
          {t.deadline && (
            <span className={isOverdue(t.deadline) ? "text-red-600" : ""}>
              {new Date(t.deadline).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
          {t.est_minutes && <span>~{t.est_minutes} min</span>}
          <span className="text-stone-400">{t.source}</span>
          {t.source_url && (
            <a
              href={t.source_url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              source
            </a>
          )}
        </p>
      </div>
    </li>
  );
}

function AddTaskInline() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estMin, setEstMin] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-stone-300 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-100"
      >
        + Add task
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setBusy(true);
        try {
          await addTask({
            title,
            deadline: deadline || undefined,
            est_minutes: estMin ? parseInt(estMin, 10) : undefined,
          });
          setTitle("");
          setDeadline("");
          setEstMin("");
          setOpen(false);
        } finally {
          setBusy(false);
        }
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
        className="min-w-0 flex-1 rounded-md border border-stone-300 px-2 py-1 text-xs"
      />
      <input
        type="date"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        className="rounded-md border border-stone-300 px-2 py-1 text-xs"
      />
      <input
        type="number"
        min={5}
        step={5}
        value={estMin}
        onChange={(e) => setEstMin(e.target.value)}
        placeholder="min"
        className="w-20 rounded-md border border-stone-300 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={busy || !title.trim()}
        className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-stone-500 hover:text-stone-700"
      >
        Cancel
      </button>
    </form>
  );
}

function Shell({
  title,
  children,
  generatedAt,
  action,
}: {
  title: string;
  children: React.ReactNode;
  generatedAt?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">{title}</h2>
        <div className="flex items-center gap-3">
          {generatedAt && (
            <span className="text-xs text-stone-400 tabular-nums">
              updated{" "}
              {new Date(generatedAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {action}
        </div>
      </header>
      {children}
    </section>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      <div className="h-10 animate-pulse rounded bg-stone-200" />
      <div className="h-10 animate-pulse rounded bg-stone-200" />
      <div className="h-10 animate-pulse rounded bg-stone-200" />
    </div>
  );
}

function ErrorBox({ msg, hint }: { msg: string; hint?: string }) {
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
      <strong>Error:</strong> {msg}
      {hint && <p className="mt-1 text-amber-800">{hint}</p>}
    </div>
  );
}
