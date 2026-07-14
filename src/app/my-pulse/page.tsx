import { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { MyPulseDashboard } from "@/components/my-pulse/MyPulseDashboard";

export const metadata: Metadata = {
  title: "My Pulse: Your Personal Construction Data Dashboard | Fabrick",
  description:
    "Build your own live UK construction data dashboard: pick the widgets you use - grid carbon, material prices, planning, ONS output, EPC - and it is there every time you sign in.",
  openGraph: {
    title: "My Pulse: build your own live construction data dashboard",
    description:
      "Free account. Pick your widgets - grid carbon, material prices, planning activity, ONS output, EPC data - and your dashboard is waiting on every login.",
    url: "https://pulse.fabrick.agency/my-pulse",
  },
};

export default function MyPulsePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-10 pb-6 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "My Pulse" }]}
          />
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Your Live Data
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl lg:text-6xl">
            My Pulse
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-gray-400">
            Your personal dashboard: the live construction data you choose,
            arranged your way, saved to your account.
          </p>
        </div>
      </section>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <MyPulseDashboard />
      </section>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
