import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { RoleFilter } from "@/components/dashboard/RoleFilter";

export const metadata = {
  title: "Live UK Construction Data Dashboard | Fabrick",
  description:
    "Live UK construction data: grid carbon intensity, material prices, ONS output, planning activity and EPC ratings. Filter by role. Refreshed automatically.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 pb-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard" },
            ]}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Live Data
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            Construction Data Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-gray-400">
            Live and regularly updated UK construction data. Pick a role below
            and we will surface the dashboards most relevant to your work.
          </p>
        </div>
      </section>

      {/* Filter by role - the only entry point into the dashboards */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-cream-dark p-6 md:p-10">
          <RoleFilter />
        </div>
      </section>

      {/* My Pulse promo */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 rounded-3xl bg-navy p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:flex">
              <LayoutDashboard className="h-5 w-5 text-teal" />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold md:text-2xl">
                Make it yours with My Pulse
              </h2>
              <p className="mt-1 text-sm text-gray-400 max-w-xl">
                Create a free account and build your own dashboard from these
                live data widgets - saved to you, on every device, every visit.
              </p>
            </div>
          </div>
          <Link
            href="/my-pulse"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-pink-light"
          >
            Build my dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
