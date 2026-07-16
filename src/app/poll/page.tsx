import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PollForm } from "@/components/poll/PollForm";

export const metadata: Metadata = {
  title: "Pulse Poll | Fabrick",
  description:
    "Pulse by Fabrick has launched. Tell us which features save you time and what UK construction data you wish was easier to access.",
};

export default function PollPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        {/* Hero */}
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 border border-navy/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-pink" />
              Pulse by Fabrick has launched
            </span>
            <h1 className="mt-5 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-navy leading-[1.05] tracking-tight">
              Please take a look at the website and let us know&hellip;
            </h1>
            <p className="mt-4 text-warm-gray leading-relaxed max-w-md">
              Pulse by Fabrick has launched - help us shape what comes next.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-pink-light"
            >
              Visit pulse.fabrick.agency
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Browser-frame mockup of the site (stands in for the prototype's
              laptop render, using assets we actually own). */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="rounded-xl border border-navy/15 bg-white shadow-xl overflow-hidden">
              <div className="flex items-center gap-1.5 bg-cream-dark/60 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-pink/70" />
                <span className="h-2 w-2 rounded-full bg-teal/70" />
                <span className="h-2 w-2 rounded-full bg-navy/20" />
              </div>
              <Image
                src="/og-image.png"
                alt="The Pulse by Fabrick dashboard"
                width={1200}
                height={630}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* The three questions */}
        <div className="mt-14">
          <PollForm />
        </div>

        <p className="mt-14 text-center text-xs text-warm-gray">
          Built by Fabrick &middot;{" "}
          <Link href="/poll/admin" className="underline hover:text-navy">
            Admin
          </Link>
        </p>
      </div>
    </div>
  );
}
