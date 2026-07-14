"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
} from "lucide-react";
import { regulations, type RegulationEvent } from "@/lib/carbon-data";

// ---------------------------------------------------------------------------
// Compact My Pulse widget over the regulations timeline: what is coming next,
// soonest first, linking through to the full timeline at /regulations. Uses
// the same data module as the Regulations page.
// ---------------------------------------------------------------------------

const STATUS: Record<
  RegulationEvent["status"],
  { icon: React.ElementType; label: string; cls: string }
> = {
  active: {
    icon: CheckCircle2,
    label: "Active",
    cls: "bg-green-100 text-green-700",
  },
  upcoming: {
    icon: Clock,
    label: "Upcoming",
    cls: "bg-yellow-100 text-yellow-700",
  },
  consultation: {
    icon: FileText,
    label: "Consultation",
    cls: "bg-blue-100 text-blue-700",
  },
  future: {
    icon: AlertTriangle,
    label: "Future",
    cls: "bg-orange-100 text-orange-700",
  },
};

const CATEGORY: Record<RegulationEvent["category"], string> = {
  carbon: "Carbon",
  energy: "Energy",
  reporting: "Reporting",
  trade: "Trade",
};

// Static data, so compute once at module load (also keeps render pure).
const LOADED_AT = Date.now();
const SORTED = [...regulations].sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
);
const NEXT = SORTED.filter(
  (r) => r.status !== "active" || new Date(r.date).getTime() >= LOADED_AT,
).slice(0, 5);
const ACTIVE_COUNT = regulations.filter((r) => r.status === "active").length;

export function RegulationsWidget() {
  const next = NEXT;
  const activeCount = ACTIVE_COUNT;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream">
            <Scale className="h-4 w-4 text-teal" />
          </div>
          <div>
            <h3 className="font-semibold text-navy">Regulations watch</h3>
            <p className="text-xs text-warm-gray">
              What is changing in built-environment regulation -{" "}
              {activeCount} already in force
            </p>
          </div>
        </div>
        <Link
          href="/regulations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-dark transition-colors"
        >
          Full timeline
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ul className="space-y-2.5">
        {next.map((reg) => {
          const status = STATUS[reg.status];
          const StatusIcon = status.icon;
          return (
            <li
              key={reg.id}
              className="flex items-start gap-3 rounded-xl bg-cream px-4 py-3"
            >
              <div className="w-16 shrink-0 pt-0.5">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-navy">
                  {new Date(reg.date).toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy leading-snug">
                  {reg.title}
                </p>
                <p className="mt-0.5 text-xs text-warm-gray leading-relaxed line-clamp-2">
                  {reg.description}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.cls}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-warm-gray/70">
                    {CATEGORY[reg.category]}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
