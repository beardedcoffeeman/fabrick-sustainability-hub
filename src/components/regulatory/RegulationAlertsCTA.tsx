"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

type SignupStatus = "idle" | "submitting" | "success" | "error";

export function RegulationAlertsCTA() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/data-point-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, source: "regulations_alerts" }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setErrorMessage(
          data.error ?? "Something went wrong. Please try again."
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl bg-charcoal p-6 md:p-8 text-white">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="h-4 w-4 text-pink" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink">
              Regulation alerts
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold leading-tight">
            Stay ahead of every deadline
          </h2>
          <p className="mt-2 text-sm text-gray-300 leading-relaxed">
            Get notified when a regulation on this timeline goes live, moves
            date, or a new one is added - so nothing catches your projects out.
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          {status === "success" ? (
            <div className="rounded-2xl border border-teal/40 bg-navy-light/40 px-5 py-4 text-center">
              <p className="font-[family-name:var(--font-playfair)] text-lg font-bold text-teal">
                You&apos;re on the list.
              </p>
              <p className="mt-1 text-xs text-gray-300">
                We&apos;ll email you when regulations go live or new ones land
                on the timeline.
              </p>
            </div>
          ) : (
            <>
              <form
                onSubmit={onSubmit}
                className="flex flex-col sm:flex-row gap-3"
                noValidate
              >
                {/* Honeypot: hidden from real users, irresistible to bots. */}
                <label
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
                >
                  Company
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>

                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "submitting"}
                  className="flex-1 rounded-full bg-navy-light px-5 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal/40 border border-gray-700 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-pink-light disabled:opacity-60"
                >
                  {status === "submitting" ? "Signing up…" : "Notify me"}
                </button>
              </form>
              {status === "error" && errorMessage && (
                <p className="mt-2 text-xs text-pink" role="alert">
                  {errorMessage}
                </p>
              )}
              <p className="mt-3 text-[11px] text-gray-500">
                No spam. Unsubscribe in one click.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
