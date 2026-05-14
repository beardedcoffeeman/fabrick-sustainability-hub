"use client";

import { useLiveData } from "./swr";

type Activity = {
  date: string;
  client: string;
  service_line: string;
  duration_minutes: number;
  description: string | null;
};

type Resp = {
  activity: Activity[];
  totals: {
    entries: number;
    minutes: number;
    hoursDecimal: number;
    byClient: Record<string, number>;
  };
  generatedAt: string;
  error?: string;
};

function fmtDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function GeorgiaPanel() {
  const { data, error, isLoading } = useLiveData<Resp>("/api/director/georgia?days=30");

  if (isLoading) return <Shell title="Georgia — last 30 days"><Skeleton /></Shell>;
  if (error || data?.error)
    return (
      <Shell title="Georgia — last 30 days">
        <ErrorBox
          msg={data?.error ?? "Failed to load Georgia activity"}
          hint="DIGITAL_TOOL_DATABASE_URL env var needs setting on Vercel."
        />
      </Shell>
    );

  const totals = data?.totals;
  const activity = data?.activity ?? [];
  const byClientSorted = totals
    ? Object.entries(totals.byClient).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <Shell
      title={`Georgia — last 30 days (${totals?.hoursDecimal ?? 0}h)`}
      generatedAt={data?.generatedAt}
    >
      {byClientSorted.length === 0 ? (
        <p className="text-sm text-stone-500">No activity logged.</p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {byClientSorted.slice(0, 9).map(([client, mins]) => (
              <div
                key={client}
                className="rounded-md border border-stone-200 bg-white px-2 py-1.5"
              >
                <div className="truncate font-medium text-slate-900">{client}</div>
                <div className="text-stone-500">{fmtDuration(mins)}</div>
              </div>
            ))}
          </div>
          <details className="text-xs">
            <summary className="cursor-pointer text-stone-500 hover:text-stone-700">
              All {activity.length} entries
            </summary>
            <ul className="mt-2 space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {activity.map((a, i) => (
                <li
                  key={`${a.date}-${a.client}-${i}`}
                  className="border-l-2 border-stone-200 pl-2"
                >
                  <div className="text-stone-700">
                    <span className="font-mono tabular-nums text-stone-500">{a.date}</span>{" "}
                    <span className="font-medium text-slate-900">{a.client}</span>{" "}
                    <span className="text-stone-400">({a.service_line})</span>{" "}
                    <span className="text-stone-500">— {fmtDuration(a.duration_minutes)}</span>
                  </div>
                  {a.description && (
                    <div className="text-stone-600">{a.description}</div>
                  )}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </Shell>
  );
}

function Shell({
  title,
  children,
  generatedAt,
}: {
  title: string;
  children: React.ReactNode;
  generatedAt?: string;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">{title}</h2>
        {generatedAt && (
          <span className="text-xs text-stone-400 tabular-nums">
            updated{" "}
            {new Date(generatedAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      <div className="h-16 animate-pulse rounded bg-stone-200" />
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
