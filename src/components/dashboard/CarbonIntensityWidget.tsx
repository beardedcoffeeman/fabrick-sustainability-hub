"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingDown, TrendingUp, Minus, RefreshCw, Info, ExternalLink } from "lucide-react";
import { getIntensityColor, getIntensityBg } from "@/lib/carbon-data";

interface IntensityData {
  current: {
    from: string;
    to: string;
    intensity: {
      forecast: number;
      actual: number;
      index: string;
    };
  };
  generation: {
    generationmix: Array<{
      fuel: string;
      perc: number;
    }>;
  };
  forecast: Array<{
    from: string;
    to: string;
    intensity: {
      forecast: number;
      actual: number;
      index: string;
    };
  }>;
  regional: {
    regions: Array<{
      shortname: string;
      intensity: { forecast: number; index: string };
    }>;
  };
}

export function CarbonIntensityWidget() {
  const [data, setData] = useState<IntensityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/carbon-intensity");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Unable to load live data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm animate-pulse">
        <div className="h-8 w-48 bg-cream-dark rounded mb-4" />
        <div className="h-24 w-full bg-cream-dark rounded mb-4" />
        <div className="h-40 w-full bg-cream-dark rounded" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-warm-gray">{error}</p>
        <button onClick={fetchData} className="mt-2 text-teal underline text-sm">
          Retry
        </button>
      </div>
    );
  }

  const intensity = data?.current?.intensity;
  const genMix = data?.generation?.generationmix || [];
  const forecast = data?.forecast?.slice(0, 12) || [];

  const renewables = genMix
    .filter((g) => ["wind", "solar", "hydro", "biomass"].includes(g.fuel))
    .reduce((sum, g) => sum + g.perc, 0);
  const fossil = genMix
    .filter((g) => ["gas", "coal", "oil"].includes(g.fuel))
    .reduce((sum, g) => sum + g.perc, 0);

  return (
    <div className="space-y-4">
      {/* Main Intensity Card */}
      <div className="rounded-2xl bg-charcoal p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 pulse-live" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Live UK Grid Carbon Intensity
            </span>
          </div>
          <button
            onClick={fetchData}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex items-end gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tabular-nums" style={{ color: getIntensityColor(intensity?.index || "") }}>
                {intensity?.actual || intensity?.forecast || "-"}
              </span>
              <span className="text-lg text-gray-400">gCO2/kWh</span>
            </div>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getIntensityBg(intensity?.index || "")}`}
            >
              {intensity?.index || "Loading..."}
            </span>
          </div>
          <div className="flex-1" />
          <Zap className="h-16 w-16 text-navy-light opacity-20" />
        </div>

        {/* What this means */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-navy-light/50 px-3 py-2.5">
          <Info className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed">
            <span className="font-semibold text-gray-300">Carbon intensity</span> measures how much CO₂ is emitted per kilowatt-hour of electricity generated.
            Lower numbers mean the grid is running on cleaner energy (wind, solar, nuclear).
            As regulations like Part Z and the Future Homes Standard tighten, understanding grid carbon will become essential for whole-life carbon assessments and Scope 2 reporting across construction projects.
          </p>
        </div>

        {/* Mini forecast sparkline */}
        {forecast.length > 0 && (() => {
          const maxVal = Math.max(...forecast.map((x) => x.intensity.forecast));
          const lowestVal = Math.min(...forecast.map((x) => x.intensity.forecast));
          const lowestIdx = forecast.findIndex((f) => f.intensity.forecast === lowestVal);
          const lowestTime = new Date(forecast[lowestIdx]?.from).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          return (
            <div className="mt-6">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-xs text-gray-400">Today&apos;s forecast</p>
                <p className="text-[10px] text-teal">
                  Lowest: {lowestVal}g at {lowestTime}
                </p>
              </div>
              <div className="flex items-end gap-[2px]" style={{ height: "64px" }}>
                {forecast.map((f, i) => {
                  const val = f.intensity.forecast;
                  const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  const time = new Date(f.from).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  const isLowest = i === lowestIdx;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t transition-all ${isLowest ? "ring-1 ring-teal" : ""}`}
                      style={{
                        height: `${Math.max(height, 4)}%`,
                        backgroundColor: getIntensityColor(f.intensity.index),
                        opacity: isLowest ? 1 : 0.6,
                      }}
                      title={`${time}: ${val} gCO2/kWh (${f.intensity.index})`}
                    />
                  );
                })}
              </div>
              <div className="flex gap-[2px] mt-1">
                {forecast.map((f, i) => {
                  const time = new Date(f.from).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <div key={i} className="flex-1 text-center">
                      {i % 3 === 0 && (
                        <span className="text-[8px] text-gray-500 tabular-nums leading-none">{time}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Generation Mix */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-teal" />
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
              Renewable
            </span>
          </div>
          <p className="text-3xl font-bold text-teal">{renewables.toFixed(1)}%</p>
          <p className="text-[10px] text-warm-gray/70 mt-1 leading-relaxed">
            Share of UK electricity currently from zero-carbon renewable sources. Higher = cleaner grid.
          </p>
          <div className="mt-3 space-y-1.5">
            {genMix
              .filter((g) => ["wind", "solar", "hydro", "biomass"].includes(g.fuel))
              .sort((a, b) => b.perc - a.perc)
              .map((g) => (
                <div key={g.fuel} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-navy">{g.fuel}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-cream-dark overflow-hidden">
                      <div
                        className="h-full rounded-full bg-teal"
                        style={{ width: `${g.perc}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-warm-gray w-10 text-right">
                      {g.perc.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-pink" />
            <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
              Fossil
            </span>
          </div>
          <p className="text-3xl font-bold text-navy">{fossil.toFixed(1)}%</p>
          <p className="text-[10px] text-warm-gray/70 mt-1 leading-relaxed">
            Share from gas, coal, and oil. These are the primary drivers of grid carbon intensity.
          </p>
          <div className="mt-3 space-y-1.5">
            {genMix
              .filter((g) => ["gas", "coal", "oil"].includes(g.fuel))
              .sort((a, b) => b.perc - a.perc)
              .map((g) => (
                <div key={g.fuel} className="flex items-center justify-between text-xs">
                  <span className="capitalize text-navy">{g.fuel}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-cream-dark overflow-hidden">
                      <div
                        className="h-full rounded-full bg-pink"
                        style={{ width: `${Math.min(g.perc * 2, 100)}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-warm-gray w-10 text-right">
                      {g.perc.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            {genMix
              .filter((g) => ["nuclear"].includes(g.fuel))
              .map((g) => (
                <div key={g.fuel} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <Minus className="h-3 w-3 text-warm-gray" />
                    <span className="capitalize text-navy">{g.fuel}</span>
                  </div>
                  <span className="tabular-nums text-warm-gray">
                    {g.perc.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Regional highlights */}
      {data?.regional?.regions && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-warm-gray mb-1">
            Regional Intensity
          </h4>
          <p className="text-[10px] text-warm-gray/70 mb-3 leading-relaxed">
            Carbon intensity varies by region based on local generation mix. Check your project location for the most accurate picture.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {data.regional.regions.map((region) => (
              <div
                key={region.shortname}
                className="flex items-center justify-between rounded-lg bg-cream p-2.5"
              >
                <span className="text-xs font-medium text-navy truncate">
                  {region.shortname}
                </span>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: getIntensityColor(region.intensity.index) }}
                >
                  {region.intensity.forecast}g
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Source Attribution */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start gap-2">
          <Info className="h-3.5 w-3.5 text-warm-gray/60 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-warm-gray leading-relaxed">
              <span className="font-semibold text-navy">Data source:</span>{" "}
              <a
                href="https://carbonintensity.org.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline inline-flex items-center gap-0.5"
              >
                National Grid ESO Carbon Intensity API
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
              {" "}- developed by National Grid ESO, the Environmental Defense Fund Europe, University of Oxford Department of Computer Science, and WWF.
            </p>
            <p className="text-[10px] text-warm-gray/60 mt-1">
              Live data refreshes every 30 minutes at source. Dashboard polls every 5 minutes. All figures are for Great Britain (England, Scotland, Wales).
              Regional forecasts cover all 14 GB grid regions. Generation mix data includes interconnector imports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
