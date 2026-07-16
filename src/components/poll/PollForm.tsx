"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FEATURES = [
  "Grid carbon analysis",
  "Material prices",
  "Construction output",
  "Planning activity",
  "EPC lookup",
];

type PollStatus = "idle" | "submitting" | "success" | "error";

function QuestionCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white/60 border border-navy/10 p-6 md:p-8">
      <h2 className="flex items-baseline gap-3 mb-5">
        <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-pink">
          {number}
        </span>
        <span className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-navy">
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}

export function PollForm() {
  const [feature, setFeature] = useState<string | null>(null);
  const [dataWish, setDataWish] = useState("");
  const [question, setQuestion] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<PollStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    if (!feature && dataWish.trim() === "" && question.trim() === "") {
      setErrorMessage("Please answer at least one question before submitting.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, dataWish, question, company }),
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
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-3xl border border-teal/40 bg-white/60 px-8 py-10 text-center">
        <p className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-navy">
          Thank you.
        </p>
        <p className="mt-3 text-warm-gray max-w-md mx-auto">
          Your response is in. It goes straight to the team shaping what Pulse
          does next.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-light"
        >
          Explore Pulse
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <QuestionCard number="01" title="Which of the live dashboards was most useful to you?">
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-full border px-5 py-3.5 text-sm font-medium transition-all ${
                feature === option
                  ? "border-pink bg-white text-navy"
                  : "border-navy/10 bg-cream-dark/40 text-navy/80 hover:border-navy/25"
              }`}
            >
              <input
                type="radio"
                name="feature"
                value={option}
                checked={feature === option}
                onChange={() => setFeature(option)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border ${
                  feature === option ? "border-pink" : "border-navy/30"
                }`}
              >
                {feature === option && (
                  <span className="h-2.5 w-2.5 rounded-full bg-pink" />
                )}
              </span>
              {option}
            </label>
          ))}
        </div>
      </QuestionCard>

      <QuestionCard number="02" title="What data do you wish was easier to access?">
        <textarea
          value={dataWish}
          onChange={(e) => setDataWish(e.target.value)}
          placeholder="Type your answer..."
          maxLength={2000}
          rows={4}
          className="w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy placeholder:text-warm-gray focus:outline-none focus:ring-2 focus:ring-teal/40"
        />
      </QuestionCard>

      <QuestionCard number="03" title="Submit a question you'd like Pulse to answer.">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your answer..."
          maxLength={2000}
          rows={4}
          className="w-full rounded-2xl border border-navy/15 bg-white px-4 py-3 text-sm text-navy placeholder:text-warm-gray focus:outline-none focus:ring-2 focus:ring-teal/40"
        />
      </QuestionCard>

      {/* Honeypot: hidden from real users, bots fill it in. */}
      <input
        type="text"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {errorMessage && (
        <p className="rounded-xl border border-pink/30 bg-pink/5 px-4 py-3 text-sm text-navy">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-warm-gray">
          Anonymous - we don&apos;t collect your name or email.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-pink px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-pink-light disabled:opacity-60"
        >
          {status === "submitting" ? "Sending..." : "Submit response"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
