import { CarbonIntensityWidget } from "@/components/dashboard/CarbonIntensityWidget";
import { FabrickPlatformCTA } from "@/components/layout/FabrickCTA";
import { Zap, Building2, Factory, TrendingDown, Users, HardHat, Ruler, Warehouse } from "lucide-react";

export const metadata = {
  title: "Live Dashboard | Fabrick Sustainability Hub",
  description:
    "Real-time UK grid carbon intensity, generation mix, and construction emissions data.",
};

const stats = [
  {
    label: "UK Construction Emissions",
    value: "~40 MtCO2e",
    subtext: "per year (DESNZ / CCC estimates)",
    detail:
      "The UK construction sector and built environment emit roughly 40 million tonnes of CO₂ equivalent every year — covering both embodied carbon locked into materials like cement and steel, and operational carbon from energy used on site and in buildings. This figure is the baseline the industry must reduce.",
    icon: Building2,
  },
  {
    label: "% of UK Total",
    value: "~25%",
    subtext: "of all UK carbon emissions",
    detail:
      "Construction and the built environment account for around a quarter of all UK carbon emissions, making it the single largest emitting sector. This includes material manufacturing, on-site energy, and the operational energy of buildings once occupied.",
    icon: Factory,
  },
  {
    label: "Reduction Target",
    value: "78%",
    subtext: "by 2035 vs 1990 levels",
    detail:
      "Under the UK's Sixth Carbon Budget, emissions must fall 78% below 1990 levels by 2035. For construction, this means radical decarbonisation of materials, energy sources, and building performance — making live carbon data essential for planning.",
    icon: TrendingDown,
  },
];

const audienceRoles = [
  {
    icon: Ruler,
    role: "Architects & Specifiers",
    need: "Understand grid carbon when specifying electrically-manufactured materials",
  },
  {
    icon: HardHat,
    role: "Site Managers & Contractors",
    need: "Plan energy-intensive activities for low-carbon periods",
  },
  {
    icon: Warehouse,
    role: "Manufacturers",
    need: "Track how grid intensity affects the embodied carbon of your products",
  },
  {
    icon: Users,
    role: "Sustainability Leads",
    need: "Report on operational carbon with real-time evidence",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-charcoal py-12 pb-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-green-400 pulse-live" />
            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Live Data
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl font-bold md:text-5xl">
            UK Carbon Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            Real-time carbon intensity data from the UK National Grid. See how
            clean your electricity is right now and when is best to run
            energy-intensive construction equipment.
          </p>

          {/* Who this is for */}
          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {audienceRoles.map(({ icon: Icon, role, need }) => (
              <div
                key={role}
                className="rounded-xl bg-navy-light/60 border border-gray-700/40 px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-4 w-4 text-teal shrink-0" />
                  <span className="text-xs font-semibold text-white">{role}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{need}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-teal" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
                    {stat.label}
                  </span>
                </div>
                <p className="text-3xl font-bold text-navy">{stat.value}</p>
                <p className="text-xs text-warm-gray mt-1">{stat.subtext}</p>
                <p className="text-[11px] text-warm-gray/80 mt-2 leading-relaxed border-t border-cream-dark pt-2">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* Main Widget */}
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CarbonIntensityWidget />
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-navy">
                Why This Matters for Construction
              </h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-cream p-4">
                  <h4 className="text-sm font-semibold text-navy">
                    Operational Carbon
                  </h4>
                  <p className="mt-1 text-xs text-warm-gray">
                    When grid intensity is low (high renewable generation),
                    electricity-powered construction equipment and site
                    operations have a lower carbon footprint. Plan heavy power
                    usage for low-intensity periods.
                  </p>
                </div>
                <div className="rounded-lg bg-cream p-4">
                  <h4 className="text-sm font-semibold text-navy">
                    Material Manufacturing
                  </h4>
                  <p className="mt-1 text-xs text-warm-gray">
                    Grid carbon intensity directly affects the embodied carbon of
                    electrically-manufactured building products. Lower grid
                    intensity = lower embodied carbon in UK-made materials.
                  </p>
                </div>
                <div className="rounded-lg bg-cream p-4">
                  <h4 className="text-sm font-semibold text-navy">
                    Future Homes Standard
                  </h4>
                  <p className="mt-1 text-xs text-warm-gray">
                    With the FHS requiring 75-80% less carbon in new homes from
                    December 2026, understanding the carbon intensity of your
                    energy supply is critical for compliance.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-teal p-6 text-white">
              <Zap className="h-8 w-8 mb-3 opacity-60" />
              <h3 className="font-bold">Best Time to Build?</h3>
              <p className="mt-2 text-sm text-white/80">
                Check the forecast above. When carbon intensity drops below
                100g CO2/kWh, it&apos;s an ideal time for energy-intensive
                construction activities. Windy, sunny days = cleaner
                construction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fabrick CTA */}
      <FabrickPlatformCTA />
    </div>
  );
}
