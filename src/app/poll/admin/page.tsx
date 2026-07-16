"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminData {
  total: number;
  featureCounts: Array<{ feature: string; n: number }>;
  responses: Array<{
    id: number;
    feature: string | null;
    data_wish: string | null;
    question: string | null;
    created_at: string;
  }>;
}

export default function PollAdminPage() {
  const [passcode, setPasscode] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onUnlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/poll/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const json = (await res.json().catch(() => ({}))) as Partial<AdminData> & {
        error?: string;
      };
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setData(json as AdminData);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const maxVotes = data
    ? Math.max(1, ...data.featureCounts.map((f) => f.n))
    : 1;

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <Link
          href="/poll"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to poll
        </Link>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold text-navy">
          Poll results
        </h1>

        {!data ? (
          <>
            <p className="mt-3 text-warm-gray">
              Enter the admin password to view responses.
            </p>
            <form onSubmit={onUnlock} className="mt-8 max-w-sm space-y-4">
              <div>
                <label
                  htmlFor="poll-admin-passcode"
                  className="block text-xs font-semibold text-navy mb-1.5"
                >
                  Password
                </label>
                <input
                  id="poll-admin-passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full rounded-full border border-navy/15 bg-white px-5 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
              {error && (
                <p className="rounded-xl border border-pink/30 bg-pink/5 px-4 py-3 text-sm text-navy">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-light disabled:opacity-60"
              >
                {loading ? "Unlocking..." : "Unlock"}
              </button>
            </form>
          </>
        ) : (
          <div className="mt-8 space-y-10">
            <p className="text-warm-gray">
              {data.total} response{data.total === 1 ? "" : "s"} so far.
            </p>

            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-4">
                Which feature would save you the most time?
              </h2>
              {data.featureCounts.length === 0 ? (
                <p className="text-sm text-warm-gray">No votes yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.featureCounts.map(({ feature, n }) => (
                    <li key={feature}>
                      <div className="flex items-baseline justify-between text-sm text-navy mb-1">
                        <span>{feature}</span>
                        <span className="font-semibold">{n}</span>
                      </div>
                      <div className="h-2 rounded-full bg-cream-dark">
                        <div
                          className="h-2 rounded-full bg-teal"
                          style={{ width: `${(n / maxVotes) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink mb-4">
                Individual responses
              </h2>
              <ul className="space-y-4">
                {data.responses.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl bg-white/60 border border-navy/10 p-5 text-sm"
                  >
                    <p className="text-[11px] text-warm-gray mb-2">
                      {new Date(r.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                      {r.feature && (
                        <span className="ml-2 rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal-dark">
                          {r.feature}
                        </span>
                      )}
                    </p>
                    {r.data_wish && (
                      <p className="text-navy">
                        <span className="font-semibold">Data wish:</span>{" "}
                        {r.data_wish}
                      </p>
                    )}
                    {r.question && (
                      <p className="text-navy mt-1">
                        <span className="font-semibold">Question:</span>{" "}
                        {r.question}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
