import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { RoleFilter } from "@/components/dashboard/RoleFilter";

export const metadata = {
  title: "Live Dashboard | Fabrick Built Environment Data",
  description:
    "Live UK construction data: carbon intensity, material prices, construction output, planning activity, and EPC ratings. All in one place, filterable by role.",
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
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-cream-dark p-6 md:p-10">
          <RoleFilter />
        </div>
      </section>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
