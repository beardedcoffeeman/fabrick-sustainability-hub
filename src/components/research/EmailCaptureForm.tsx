"use client";

import { Mail } from "lucide-react";

interface EmailCaptureFormProps {
  variant?: "light" | "dark";
  buttonText?: string;
}

export function EmailCaptureInline({ variant = "light", buttonText = "Notify me" }: EmailCaptureFormProps) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-warm-gray" />
        <input
          type="email"
          placeholder="your@email.com"
          className={`w-full rounded-lg border py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal/40 ${
            variant === "light"
              ? "border-cream-dark bg-cream text-navy placeholder:text-warm-gray/60"
              : "border-gray-700 bg-navy-light text-white placeholder:text-gray-500"
          }`}
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-pink px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-pink-light"
      >
        {buttonText}
      </button>
    </form>
  );
}

export function EmailCaptureStacked() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="mt-5 space-y-3"
    >
      <input
        type="email"
        placeholder="your@email.com"
        className="w-full rounded-lg bg-navy-light px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal/40 border border-gray-700"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-pink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-pink-light"
      >
        Register for early access
      </button>
    </form>
  );
}
