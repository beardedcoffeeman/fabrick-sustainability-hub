"use client";

import { useLiveData } from "./swr";

type GraphEvent = {
  id: string;
  subject: string;
  bodyPreview: string;
  isAllDay: boolean;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName?: string };
  attendees?: Array<{ emailAddress: { name?: string; address?: string } }>;
  organizer?: { emailAddress: { name?: string; address?: string } };
  webLink?: string;
};

type Resp = { events: GraphEvent[]; generatedAt: string; error?: string };

function formatTime(dt: string): string {
  // Graph returns UTC strings like "2026-05-14T13:00:00.0000000"
  const d = new Date(dt + "Z");
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function CalendarPanel() {
  const { data, error, isLoading } = useLiveData<Resp>("/api/director/calendar?days=1");

  if (isLoading) return <PanelShell title="Today's Calendar"><Skeleton /></PanelShell>;
  if (error || data?.error)
    return (
      <PanelShell title="Today's Calendar">
        <ErrorBox msg={data?.error ?? "Failed to load calendar"} hint="Check MS365_GRAPH_* env vars on Vercel." />
      </PanelShell>
    );

  const events = data?.events ?? [];
  const allDay = events.filter((e) => e.isAllDay);
  const timed = events.filter((e) => !e.isAllDay);

  return (
    <PanelShell title="Today's Calendar" generatedAt={data?.generatedAt}>
      {allDay.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {allDay.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {e.subject}
            </span>
          ))}
        </div>
      )}
      {timed.length === 0 ? (
        <p className="text-sm text-stone-500">No timed events today.</p>
      ) : (
        <ol className="space-y-2">
          {timed.map((e) => {
            const attendeeNames =
              e.attendees
                ?.slice(0, 4)
                .map((a) => a.emailAddress.name ?? a.emailAddress.address)
                .filter(Boolean)
                .join(", ") ?? "";
            return (
              <li key={e.id} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-stone-500 tabular-nums">
                    {formatTime(e.start.dateTime)} – {formatTime(e.end.dateTime)}
                  </span>
                  {e.webLink && (
                    <a
                      href={e.webLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Open
                    </a>
                  )}
                </div>
                <p className="mt-0.5 text-sm font-medium text-slate-900">{e.subject}</p>
                {attendeeNames && (
                  <p className="mt-0.5 text-xs text-stone-500">{attendeeNames}</p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </PanelShell>
  );
}

function PanelShell({
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
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </h2>
        {generatedAt && (
          <span className="text-xs text-stone-400 tabular-nums">
            updated {new Date(generatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
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
      <div className="h-12 animate-pulse rounded bg-stone-200" />
      <div className="h-12 animate-pulse rounded bg-stone-200" />
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
