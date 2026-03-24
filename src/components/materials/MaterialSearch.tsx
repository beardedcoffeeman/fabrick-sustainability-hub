"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpRight, ArrowDownRight, Scale, Info } from "lucide-react";
import { iceDatabase, materialCategories, type MaterialData } from "@/lib/carbon-data";

export function MaterialSearch() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [compareList, setCompareList] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "carbon">("carbon");

  const filteredMaterials = useMemo(() => {
    let results = iceDatabase;

    if (selectedCategory !== "all") {
      results = results.filter((m) => m.category === selectedCategory);
    }

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.notes?.toLowerCase().includes(q)
      );
    }

    results.sort((a, b) =>
      sortBy === "carbon"
        ? a.embodiedCarbon - b.embodiedCarbon
        : a.name.localeCompare(b.name)
    );

    return results;
  }, [query, selectedCategory, sortBy]);

  const comparedMaterials = iceDatabase.filter((m) =>
    compareList.includes(m.id)
  );

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-4)
    );
  };

  const getCarbonLevel = (value: number): { label: string; color: string } => {
    if (value < 0.1) return { label: "Very Low", color: "text-green-600 bg-green-50" };
    if (value < 0.5) return { label: "Low", color: "text-lime-600 bg-lime-50" };
    if (value < 1.5) return { label: "Medium", color: "text-yellow-600 bg-yellow-50" };
    if (value < 3) return { label: "High", color: "text-orange-600 bg-orange-50" };
    return { label: "Very High", color: "text-red-600 bg-red-50" };
  };

  const maxCarbon = Math.max(...filteredMaterials.map((m) => m.embodiedCarbon));

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-warm-gray" />
            <input
              type="text"
              placeholder="Search materials... (e.g. concrete, timber, insulation)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-cream-dark bg-cream py-3 pl-10 pr-4 text-sm text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "carbon")}
            className="rounded-xl border border-cream-dark bg-cream px-4 py-3 text-sm text-navy outline-none"
          >
            <option value="carbon">Sort: Lowest Carbon</option>
            <option value="name">Sort: A-Z</option>
          </select>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-navy text-white"
                : "bg-cream text-navy hover:bg-cream-dark"
            }`}
          >
            All ({iceDatabase.length})
          </button>
          {materialCategories.map((cat) => {
            const count = iceDatabase.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-navy text-white"
                    : "bg-cream text-navy hover:bg-cream-dark"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Bar */}
      {comparedMaterials.length > 0 && (
        <div className="rounded-2xl bg-charcoal p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-teal" />
              <h3 className="text-sm font-semibold">
                Comparing {comparedMaterials.length} materials
              </h3>
            </div>
            <button
              onClick={() => setCompareList([])}
              className="text-xs text-gray-400 hover:text-white"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-3">
            {comparedMaterials.map((m) => {
              const maxCompare = Math.max(
                ...comparedMaterials.map((x) => x.embodiedCarbon)
              );
              const width = (m.embodiedCarbon / maxCompare) * 100;
              return (
                <div key={m.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{m.name}</span>
                    <span className="font-bold tabular-nums">
                      {m.embodiedCarbon} {m.unit}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-navy-light overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal to-pink transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {comparedMaterials.length >= 2 && (
            <div className="mt-4 p-3 rounded-lg bg-navy-light text-xs text-gray-300">
              <strong className="text-teal">Carbon saving:</strong> Switching from{" "}
              {comparedMaterials.reduce((max, m) =>
                m.embodiedCarbon > max.embodiedCarbon ? m : max
              ).name}{" "}
              to{" "}
              {comparedMaterials.reduce((min, m) =>
                m.embodiedCarbon < min.embodiedCarbon ? m : min
              ).name}{" "}
              saves{" "}
              <strong>
                {(
                  ((Math.max(...comparedMaterials.map((m) => m.embodiedCarbon)) -
                    Math.min(...comparedMaterials.map((m) => m.embodiedCarbon))) /
                    Math.max(...comparedMaterials.map((m) => m.embodiedCarbon))) *
                  100
                ).toFixed(0)}
                %
              </strong>{" "}
              embodied carbon per kg.
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        <p className="text-sm text-warm-gray">
          {filteredMaterials.length} materials found
        </p>
        {filteredMaterials.map((material) => {
          const level = getCarbonLevel(material.embodiedCarbon);
          const barWidth = maxCarbon > 0 ? (material.embodiedCarbon / maxCarbon) * 100 : 0;
          const isComparing = compareList.includes(material.id);
          return (
            <div
              key={material.id}
              className={`group rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                isComparing ? "ring-2 ring-teal" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-navy">{material.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${level.color}`}
                    >
                      {level.label}
                    </span>
                  </div>
                  <p className="text-xs text-warm-gray mt-0.5">{material.category}</p>
                  {material.notes && (
                    <p className="text-xs text-warm-gray mt-1 flex items-start gap-1">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      {material.notes}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold tabular-nums text-navy">
                    {material.embodiedCarbon}
                  </p>
                  <p className="text-[10px] text-warm-gray">{material.unit}</p>
                </div>
              </div>

              {/* Carbon bar */}
              <div className="mt-3 h-1.5 rounded-full bg-cream overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor:
                      material.embodiedCarbon < 0.5
                        ? "#00BFA5"
                        : material.embodiedCarbon < 2
                        ? "#eab308"
                        : "#FF3D7F",
                  }}
                />
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => toggleCompare(material.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isComparing
                      ? "bg-teal text-white"
                      : "bg-cream text-navy hover:bg-cream-dark"
                  }`}
                >
                  {isComparing ? "Comparing" : "Compare"}
                </button>
                {material.alternatives && (
                  <span className="flex items-center gap-1 text-xs text-teal">
                    <ArrowDownRight className="h-3 w-3" />
                    Lower carbon options available
                  </span>
                )}
                {material.density && (
                  <span className="text-xs text-warm-gray ml-auto">
                    {material.density} kg/m³
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
