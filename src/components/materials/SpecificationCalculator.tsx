"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Leaf,
  Scale,
  Lightbulb,
  BarChart3,
  Target,
  Plane,
  Home,
  Car,
  TreePine,
  Lock,
  Sparkles,
  Check,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  iceDatabase,
  materialCategories,
  carbonBenchmarks,
  type MaterialData,
  type BuildingType,
} from "@/lib/carbon-data";

interface LineItem {
  id: string;
  materialId: string;
  quantity: number;
  unit: "kg" | "tonnes" | "m³";
}

function convertToKg(quantity: number, unit: "kg" | "tonnes" | "m³", density?: number): number {
  switch (unit) {
    case "tonnes":
      return quantity * 1000;
    case "m³":
      return quantity * (density || 1);
    default:
      return quantity;
  }
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1) return n.toFixed(0);
  return n.toFixed(2);
}

function getCarbonLevel(kgCO2e: number): { label: string; color: string } {
  if (kgCO2e < 100) return { label: "Very Low", color: "bg-green-100 text-green-800" };
  if (kgCO2e < 1000) return { label: "Low", color: "bg-lime-100 text-lime-800" };
  if (kgCO2e < 10000) return { label: "Moderate", color: "bg-yellow-100 text-yellow-800" };
  if (kgCO2e < 50000) return { label: "High", color: "bg-orange-100 text-orange-800" };
  return { label: "Very High", color: "bg-red-100 text-red-800" };
}

/* ── Carbon equivalences ─────────────────────────── */
const EQUIVALENCES = {
  londonNyFlight: 986,   // kgCO₂e per economy round-trip London ↔ NYC
  ukHouseholdYear: 2700, // kgCO₂e average UK household per year
  carMiles: 0.271,       // kgCO₂e per mile driven (average UK car)
  treesPerYear: 21,      // kgCO₂e absorbed per mature tree per year
};

const equivalenceItems = [
  { Icon: Plane,    key: "flight", divisor: EQUIVALENCES.londonNyFlight,  label: "return flights London → NYC" },
  { Icon: Home,     key: "home",   divisor: EQUIVALENCES.ukHouseholdYear, label: "years powering a UK home" },
  { Icon: Car,      key: "car",    divisor: EQUIVALENCES.carMiles,        label: "miles driven in a car" },
  { Icon: TreePine, key: "tree",   divisor: EQUIVALENCES.treesPerYear,    label: "trees to offset (per year)" },
];

function formatEquivalence(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 10000) return `${(value / 1000).toFixed(0)}k`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (value >= 10) return Math.round(value).toLocaleString();
  if (value >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

/* ── Multi-criteria trade-off chips ─────────────────────────
   Shown under each alternative so a "lower-carbon" recommendation
   is always read alongside what it costs in thickness, fire and £.
   See /methodology for sources. */

const EUROCLASS_ORDER = ["A1", "A2", "B", "C", "D", "E", "F"];
function fireRank(rating?: string): number {
  if (!rating) return 99;
  const head = rating.split("-")[0].trim();
  const idx = EUROCLASS_ORDER.indexOf(head);
  return idx === -1 ? 99 : idx;
}

const COST_SYMBOLS: Record<number, string> = { 1: "£", 2: "££", 3: "£££", 4: "££££" };

type ChipTone = "good" | "bad" | "neutral";
function Chip({ label, value, tone }: { label: string; value: string; tone: ChipTone }) {
  const cls =
    tone === "good"
      ? "bg-green-50 text-green-800 border-green-200"
      : tone === "bad"
      ? "bg-orange-50 text-orange-800 border-orange-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}
    >
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

function TradeOffChips({
  original,
  alt,
  altCarbonKg,
  originalCarbonKg,
}: {
  original: MaterialData;
  alt: MaterialData;
  altCarbonKg: number;
  originalCarbonKg: number;
}) {
  const chips: { label: string; value: string; tone: ChipTone }[] = [];

  // Carbon (always shown)
  const carbonPct = Math.round(((originalCarbonKg - altCarbonKg) / originalCarbonKg) * 100);
  chips.push({
    label: "Carbon",
    value: carbonPct >= 0 ? `${carbonPct}% lower` : `${Math.abs(carbonPct)}% higher`,
    tone: carbonPct > 5 ? "good" : carbonPct < -5 ? "bad" : "neutral",
  });

  // Thermal (thickness penalty for same U-value)
  if (original.thermalConductivity && alt.thermalConductivity) {
    const ratio = alt.thermalConductivity / original.thermalConductivity;
    if (ratio > 1.05) {
      chips.push({
        label: "Thickness",
        value: `+${Math.round((ratio - 1) * 100)}% thicker`,
        tone: "bad",
      });
    } else if (ratio < 0.95) {
      chips.push({
        label: "Thickness",
        value: `${Math.round((1 - ratio) * 100)}% thinner`,
        tone: "good",
      });
    } else {
      chips.push({ label: "Thickness", value: "similar", tone: "neutral" });
    }
  }

  // Fire (lower index = better)
  if (original.fireRating && alt.fireRating) {
    const origRank = fireRank(original.fireRating);
    const altRank = fireRank(alt.fireRating);
    if (altRank < origRank)
      chips.push({ label: "Fire", value: `${alt.fireRating} (better)`, tone: "good" });
    else if (altRank > origRank)
      chips.push({ label: "Fire", value: `${alt.fireRating} (worse)`, tone: "bad" });
    else chips.push({ label: "Fire", value: alt.fireRating, tone: "neutral" });
  }

  // Cost band
  if (original.costBand && alt.costBand) {
    if (alt.costBand < original.costBand)
      chips.push({ label: "Cost", value: `${COST_SYMBOLS[alt.costBand]} (cheaper)`, tone: "good" });
    else if (alt.costBand > original.costBand)
      chips.push({
        label: "Cost",
        value: `${COST_SYMBOLS[alt.costBand]} (pricier)`,
        tone: "bad",
      });
    else chips.push({ label: "Cost", value: COST_SYMBOLS[alt.costBand], tone: "neutral" });
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {chips.map((c, i) => (
        <Chip key={i} {...c} />
      ))}
    </div>
  );
}

/* ── Component ───────────────────────────────────── */
export function SpecificationCalculator() {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"kg" | "tonnes" | "m³">("tonnes");
  const [buildingType, setBuildingType] = useState<BuildingType>("residential");
  const [buildingArea, setBuildingArea] = useState("");
  const [expandedAlternatives, setExpandedAlternatives] = useState<string | null>(null);

  // Data-capture gate
  const [isReportUnlocked, setIsReportUnlocked] = useState(false);
  const [gateName, setGateName] = useState("");
  const [gateEmail, setGateEmail] = useState("");
  const [gateCompany, setGateCompany] = useState("");

  // Source panel toggle
  const [showSources, setShowSources] = useState(false);

  // UX feedback for Add: button flash + auto-scroll to new item + highlight
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [addedFlash, setAddedFlash] = useState(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!justAddedId) return;
    // Only scroll if the just-added item is off-screen, and only as little
    // as needed. "block: center" was pulling the Add Material form out of
    // view on narrow viewports, making multi-material adding feel broken.
    const el = itemRefs.current[justAddedId];
    if (el) {
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!inView) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
    const flashTimer = setTimeout(() => setAddedFlash(false), 1200);
    const highlightTimer = setTimeout(() => setJustAddedId(null), 2000);
    return () => {
      clearTimeout(flashTimer);
      clearTimeout(highlightTimer);
    };
  }, [justAddedId]);

  const materialsByCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return iceDatabase.filter((m) => m.category === selectedCategory);
  }, [selectedCategory]);

  const totalCarbon = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const material = iceDatabase.find((m) => m.id === item.materialId);
      if (!material) return sum;
      const kgs = convertToKg(item.quantity, item.unit, material.density);
      return sum + kgs * material.embodiedCarbon;
    }, 0);
  }, [lineItems]);

  const areaM2 = parseFloat(buildingArea) || 0;
  const carbonPerM2 = areaM2 > 0 ? totalCarbon / areaM2 : 0;

  // Fabrick Analysis: top contributor, top suggested swap, benchmark commentary.
  const fabrickAnalysis = useMemo(() => {
    if (lineItems.length === 0) return null;

    // Top carbon contributor
    const itemBreakdown = lineItems
      .map((item) => {
        const material = iceDatabase.find((m) => m.id === item.materialId);
        if (!material) return null;
        const kgs = convertToKg(item.quantity, item.unit, material.density);
        const carbon = kgs * material.embodiedCarbon;
        return { item, material, carbon };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.carbon - a.carbon);

    const top = itemBreakdown[0];
    const topPct = top ? (top.carbon / totalCarbon) * 100 : 0;

    // Best alternative for the top contributor
    const altIds = top?.material.alternatives ?? [];
    const alts = altIds
      .map((id) => iceDatabase.find((m) => m.id === id))
      .filter((m): m is NonNullable<typeof m> => !!m)
      .sort((a, b) => a.embodiedCarbon - b.embodiedCarbon);
    const bestAlt = alts[0];
    const swapSavingPct = bestAlt && top
      ? ((top.material.embodiedCarbon - bestAlt.embodiedCarbon) /
          top.material.embodiedCarbon) *
        100
      : 0;

    // Benchmark verdict
    const letiTarget = carbonBenchmarks.leti[buildingType];
    const ribaTarget = carbonBenchmarks.riba2030[buildingType];
    const benchmarkVerdict =
      carbonPerM2 === 0
        ? null
        : carbonPerM2 <= letiTarget
          ? `inside the LETI 2020 target (${letiTarget} kgCO₂e/m²) - ahead of best-practice peers.`
          : carbonPerM2 <= ribaTarget
            ? `between the LETI 2020 and RIBA 2030 targets - competitive, with room to push lower.`
            : `above the RIBA 2030 target (${ribaTarget} kgCO₂e/m²) - the structural materials below are doing most of the carbon.`;

    return { top, topPct, bestAlt, swapSavingPct, benchmarkVerdict };
  }, [lineItems, totalCarbon, carbonPerM2, buildingType]);

  const addLineItem = () => {
    if (!selectedMaterialId || !quantity || parseFloat(quantity) <= 0) return;
    const newItem: LineItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      materialId: selectedMaterialId,
      quantity: parseFloat(quantity),
      unit,
    };
    setLineItems((prev) => [...prev, newItem]);
    setSelectedMaterialId("");
    setQuantity("");
    setJustAddedId(newItem.id);
    setAddedFlash(true);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const getAlternatives = (materialId: string): (MaterialData & { saving: number })[] => {
    const material = iceDatabase.find((m) => m.id === materialId);
    if (!material?.alternatives) return [];
    return material.alternatives
      .map((altId) => iceDatabase.find((m) => m.id === altId))
      .filter((m): m is MaterialData => !!m)
      .map((alt) => ({
        ...alt,
        saving: Math.round(
          ((material.embodiedCarbon - alt.embodiedCarbon) / material.embodiedCarbon) * 100
        ),
      }))
      .filter((alt) => alt.saving > 0)
      .sort((a, b) => b.saving - a.saving);
  };

  const potentialSaving = useMemo(() => {
    let currentTotal = 0;
    let optimisedTotal = 0;
    lineItems.forEach((item) => {
      const material = iceDatabase.find((m) => m.id === item.materialId);
      if (!material) return;
      const kgs = convertToKg(item.quantity, item.unit, material.density);
      const itemCarbon = kgs * material.embodiedCarbon;
      currentTotal += itemCarbon;
      const alts = getAlternatives(item.materialId);
      if (alts.length > 0) {
        optimisedTotal += kgs * alts[0].embodiedCarbon;
      } else {
        optimisedTotal += itemCarbon;
      }
    });
    return currentTotal - optimisedTotal;
  }, [lineItems]);

  const handleUnlockReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateName.trim() && gateEmail.trim()) {
      setIsReportUnlocked(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* ────────── Project Setup ────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-navy mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-teal" />
          Project Settings
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-warm-gray mb-1 block">Building Type</label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value as BuildingType)}
              className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal"
            >
              <option value="residential">Residential</option>
              <option value="office">Office / Commercial</option>
              <option value="school">Education</option>
              <option value="retail">Retail</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-warm-gray mb-1 block">
              Gross Internal Area (m²) - <span className="text-warm-gray/70">for benchmarking</span>
            </label>
            <input
              type="number"
              min="0"
              value={buildingArea}
              onChange={(e) => setBuildingArea(e.target.value)}
              placeholder="e.g. 2500"
              className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal placeholder:text-warm-gray/50"
            />
          </div>
        </div>
      </div>

      {/* ────────── Add Material ────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
            <Plus className="h-4 w-4 text-teal" />
            Add Material to Specification
          </h3>
          {lineItems.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-[11px] font-semibold text-teal">
              <Check className="h-3 w-3" />
              {lineItems.length} material{lineItems.length === 1 ? "" : "s"} in spec - add another
            </span>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-1">
            <label className="text-xs font-medium text-warm-gray mb-1 block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedMaterialId("");
              }}
              className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal"
            >
              <option value="">Select...</option>
              {materialCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-warm-gray mb-1 block">Material</label>
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              disabled={!selectedCategory}
              className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal disabled:opacity-50"
            >
              <option value="">Select material...</option>
              {materialsByCategory.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.embodiedCarbon} kgCO₂e/kg)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-warm-gray mb-1 block">Quantity</label>
            <div className="flex gap-1">
              <input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal placeholder:text-warm-gray/50"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as "kg" | "tonnes" | "m³")}
                className="rounded-lg border border-gray-200 bg-cream px-2 py-2.5 text-xs text-navy outline-none focus:border-teal"
              >
                <option value="kg">kg</option>
                <option value="tonnes">t</option>
                <option value="m³">m³</option>
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={addLineItem}
              disabled={!selectedMaterialId || !quantity}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                addedFlash
                  ? "bg-green-600 scale-[0.98]"
                  : "bg-teal hover:bg-teal-dark"
              }`}
            >
              {addedFlash ? (
                <>
                  <Check className="h-4 w-4" />
                  Added
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>
        {selectedMaterialId && (() => {
          const mat = iceDatabase.find(m => m.id === selectedMaterialId);
          return mat ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {mat.typicalApplications && (
                <p className="text-[11px] text-warm-gray">
                  <span className="font-medium">Typical uses:</span> {mat.typicalApplications}
                </p>
              )}
              <p className="text-[10px] text-warm-gray/60 flex items-center gap-1">
                <Info className="h-2.5 w-2.5" />
                Source: ICE Database (Circular Ecology) · A1–A3 cradle-to-gate
              </p>
            </div>
          ) : null;
        })()}
      </div>

      {/* ────────── Line Items ────────── */}
      {lineItems.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-navy flex items-center gap-2">
            <Scale className="h-4 w-4 text-teal" />
            Your Specification
          </h3>
          {lineItems.map((item) => {
            const material = iceDatabase.find((m) => m.id === item.materialId);
            if (!material) return null;
            const kgs = convertToKg(item.quantity, item.unit, material.density);
            const itemCarbon = kgs * material.embodiedCarbon;
            const level = getCarbonLevel(itemCarbon);
            const alternatives = getAlternatives(item.materialId);
            const isExpanded = expandedAlternatives === item.id;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                className={`rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-500 ${
                  justAddedId === item.id
                    ? "ring-2 ring-teal ring-offset-2 ring-offset-cream shadow-md"
                    : ""
                }`}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Carbon proportion bar */}
                  <div className="hidden sm:block w-1.5 h-14 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="w-full rounded-full transition-all"
                      style={{
                        height: `${Math.min(100, (itemCarbon / (totalCarbon || 1)) * 100)}%`,
                        backgroundColor:
                          itemCarbon / (totalCarbon || 1) > 0.5
                            ? "#ef4444"
                            : itemCarbon / (totalCarbon || 1) > 0.25
                            ? "#f97316"
                            : "#00BFA5",
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-navy truncate">{material.name}</span>
                      {material.fhsRecommended && (
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          FHS ✓
                        </span>
                      )}
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${level.color}`}>
                        {level.label}
                      </span>
                    </div>
                    <p className="text-xs text-warm-gray mt-0.5">
                      {item.quantity} {item.unit} × {material.embodiedCarbon} kgCO₂e/kg ={" "}
                      <strong className="text-navy">{formatNumber(itemCarbon)} kgCO₂e</strong>
                      <span className="text-warm-gray/60">
                        {" "}({((itemCarbon / (totalCarbon || 1)) * 100).toFixed(0)}% of total)
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {alternatives.length > 0 && (
                      <button
                        onClick={() => setExpandedAlternatives(isExpanded ? null : item.id)}
                        className="rounded-lg p-2 text-teal hover:bg-cream transition-colors relative"
                        title={isReportUnlocked ? "View alternatives" : "Unlock report to view alternatives"}
                      >
                        <Lightbulb className="h-4 w-4" />
                        {!isReportUnlocked && (
                          <Lock className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 text-warm-gray" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="rounded-lg p-2 text-warm-gray hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Alternatives panel */}
                {isExpanded && alternatives.length > 0 && (
                  isReportUnlocked ? (
                    <div className="border-t border-gray-100 bg-cream/50 p-4">
                      <p className="text-xs font-semibold text-navy mb-1 flex items-center gap-1.5">
                        <Lightbulb className="h-3.5 w-3.5 text-teal" />
                        Compare alternatives for {material.name}
                      </p>
                      <p className="text-[11px] text-warm-gray mb-3 leading-relaxed">
                        We rank by embodied carbon, but no single axis decides the
                        right material. Trade-offs (thickness for the same U-value,
                        fire rating, indicative cost) are shown alongside so you
                        can choose what matters for your build.
                      </p>
                      <div className="space-y-2">
                        {alternatives.map((alt) => {
                          const altCarbon = kgs * alt.embodiedCarbon;
                          return (
                            <div
                              key={alt.id}
                              className="rounded-lg bg-white p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-navy">{alt.name}</span>
                                    {alt.fhsRecommended && (
                                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                        FHS ✓
                                      </span>
                                    )}
                                  </div>
                                  {alt.notes && (
                                    <p className="text-[11px] text-warm-gray/70 mt-0.5 leading-snug">
                                      {alt.notes}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setLineItems((prev) =>
                                      prev.map((li) =>
                                        li.id === item.id ? { ...li, materialId: alt.id } : li
                                      )
                                    );
                                    setExpandedAlternatives(null);
                                  }}
                                  className="shrink-0 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-dark transition-colors"
                                >
                                  Swap
                                </button>
                              </div>
                              <TradeOffChips original={material} alt={alt} altCarbonKg={altCarbon} originalCarbonKg={itemCarbon} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Locked alternatives teaser */
                    <div className="border-t border-gray-100 bg-cream/50 p-5 text-center">
                      <Lock className="mx-auto h-5 w-5 text-warm-gray/40 mb-2" />
                      <p className="text-sm font-medium text-navy">
                        {alternatives.length} lower-carbon alternative{alternatives.length > 1 ? "s" : ""} available
                      </p>
                      <p className="text-xs text-warm-gray mt-1">
                        Unlock your full report below to view and swap alternatives
                      </p>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ────────── Fabrick Analysis ────────── */}
      {fabrickAnalysis && (
        <div className="rounded-2xl bg-charcoal p-6 md:p-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-pink" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink">
              Fabrick Analysis
            </span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold leading-tight">
            What this spec is telling you
          </h3>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-300 max-w-3xl">
            {fabrickAnalysis.top && (
              <p>
                <strong className="text-white">
                  {fabrickAnalysis.top.material.name}
                </strong>{" "}
                is doing {fabrickAnalysis.topPct.toFixed(0)}% of the carbon work
                in this spec. If you only have time for one swap, this is the
                one that moves the number.
              </p>
            )}
            {fabrickAnalysis.bestAlt && fabrickAnalysis.swapSavingPct > 5 && (
              <p>
                Switching to{" "}
                <strong className="text-teal">
                  {fabrickAnalysis.bestAlt.name}
                </strong>{" "}
                cuts that material&rsquo;s embodied carbon by roughly{" "}
                <strong className="text-teal">
                  {fabrickAnalysis.swapSavingPct.toFixed(0)}%
                </strong>
                . Review the trade-offs (thickness, fire rating, cost) in the
                alternatives panel on that line item before swapping. See{" "}
                <Link href="/methodology" className="text-teal underline underline-offset-2 hover:text-teal-dark">
                  methodology
                </Link>{" "}
                for sources.
              </p>
            )}
            {fabrickAnalysis.benchmarkVerdict && (
              <p>
                At{" "}
                <strong className="text-white">
                  {Math.round(carbonPerM2)} kgCO₂e/m²
                </strong>
                , this spec sits {fabrickAnalysis.benchmarkVerdict}
              </p>
            )}
          </div>
          <p className="mt-5 text-[11px] text-gray-500">
            Fabrick analysis based on ICE Database v4.1 typical values, LETI 2020 and
            RIBA 2030 benchmarks. Real-project numbers vary by mix design and supplier
            - we run project-level analysis with our clients.
          </p>
        </div>
      )}

      {/* ────────── Summary & Benchmarks ────────── */}
      {lineItems.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* ── Carbon Total + Equivalences ── */}
          <div className="rounded-2xl bg-charcoal p-6 text-white">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Total Embodied Carbon
            </h3>
            <p className="font-[family-name:var(--font-playfair)] text-4xl font-bold">
              {formatNumber(totalCarbon)}
              <span className="text-lg text-gray-400 ml-1">kgCO₂e</span>
            </p>
            {totalCarbon >= 1000 && (
              <p className="text-sm text-gray-400 mt-1">
                {(totalCarbon / 1000).toFixed(1)} tCO₂e
              </p>
            )}

            {/* Human-readable equivalences */}
            {totalCarbon >= 100 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  That&apos;s equivalent to…
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {equivalenceItems.map(({ Icon, key, divisor, label }) => {
                    const value = totalCarbon / divisor;
                    return (
                      <div key={key} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                          <Icon className="h-3.5 w-3.5 text-teal" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-none">
                            {formatEquivalence(value)}
                          </p>
                          <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Potential saving */}
            {potentialSaving > 0 && (
              isReportUnlocked ? (
                <div className="mt-4 rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-teal font-semibold flex items-center gap-1.5">
                    <Leaf className="h-3.5 w-3.5" />
                    Potential saving with lower-carbon alternatives
                  </p>
                  <p className="text-lg font-bold text-teal mt-1">
                    −{formatNumber(potentialSaving)} kgCO₂e
                    <span className="text-xs font-normal text-gray-400 ml-2">
                      ({((potentialSaving / totalCarbon) * 100).toFixed(0)}% reduction)
                    </span>
                  </p>
                  {/* Saving equivalences */}
                  {potentialSaving >= 100 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Plane className="h-3 w-3 text-teal/70" />
                        {formatEquivalence(potentialSaving / EQUIVALENCES.londonNyFlight)} fewer flights
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Home className="h-3 w-3 text-teal/70" />
                        {formatEquivalence(potentialSaving / EQUIVALENCES.ukHouseholdYear)} yrs of home energy
                      </span>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 mt-2">
                    Click the <Lightbulb className="inline h-3 w-3" /> icon on each material to view and swap alternatives
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-teal font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Savings available
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Lower-carbon alternatives could reduce your footprint. Unlock your full report to see potential savings and swap materials.
                  </p>
                </div>
              )
            )}
          </div>

          {/* ── Benchmark / Gate ── */}
          {isReportUnlocked ? (
            /* Full benchmark comparison */
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-teal" />
                Benchmark Comparison
              </h3>
              {areaM2 > 0 ? (
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-navy">
                    {carbonPerM2.toFixed(0)}
                    <span className="text-sm text-warm-gray font-normal ml-1">kgCO₂e/m²</span>
                  </p>
                  {(
                    [
                      { key: "leti", ...carbonBenchmarks.leti },
                      { key: "riba2030", ...carbonBenchmarks.riba2030 },
                      { key: "bau", ...carbonBenchmarks.businessAsUsual },
                    ] as const
                  ).map((benchmark) => {
                    const target = benchmark[buildingType];
                    const pct = (carbonPerM2 / target) * 100;
                    const passing = carbonPerM2 <= target;
                    return (
                      <div key={benchmark.key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-warm-gray">{benchmark.label}</span>
                          <span className={`text-xs font-semibold ${passing ? "text-green-600" : "text-orange-500"}`}>
                            {target} kgCO₂e/m²
                            {passing ? " ✓" : ""}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              passing ? "bg-green-400" : pct > 120 ? "bg-red-400" : "bg-orange-400"
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-warm-gray mt-2">
                    Benchmarks from LETI Climate Emergency Design Guide and RIBA 2030 Challenge.
                    Modules A1–A5 (product + construction stage).
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <BarChart3 className="h-8 w-8 text-warm-gray/30 mb-2" />
                  <p className="text-sm text-warm-gray">
                    Enter your building&apos;s gross internal area above to see benchmark comparisons.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Data-capture gate */
            <div className="rounded-2xl bg-white p-6 shadow-sm relative overflow-hidden">
              {/* Blurred benchmark preview */}
              <div className="absolute inset-0 p-6 opacity-[0.08] pointer-events-none select-none" aria-hidden>
                <div className="space-y-4 mt-8">
                  {[85, 60, 40].map((w, i) => (
                    <div key={i}>
                      <div className="h-2 w-24 rounded bg-gray-300 mb-1.5" />
                      <div className="h-2.5 rounded-full bg-gray-300" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gate form */}
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10">
                    <Lock className="h-5 w-5 text-teal" />
                  </div>
                </div>
                <h3 className="text-center font-[family-name:var(--font-playfair)] text-lg font-bold text-navy">
                  Unlock Your Full Report
                </h3>
                <p className="mt-1 text-center text-xs text-warm-gray leading-relaxed max-w-xs mx-auto">
                  Get benchmark comparisons against LETI &amp; RIBA 2030, lower-carbon alternatives, and potential savings.
                </p>

                <form onSubmit={handleUnlockReport} className="mt-5 space-y-3">
                  <div>
                    <input
                      type="text"
                      value={gateName}
                      onChange={(e) => setGateName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal placeholder:text-warm-gray/50"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={gateEmail}
                      onChange={(e) => setGateEmail(e.target.value)}
                      placeholder="Work email"
                      required
                      className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal placeholder:text-warm-gray/50"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={gateCompany}
                      onChange={(e) => setGateCompany(e.target.value)}
                      placeholder="Company (optional)"
                      className="w-full rounded-lg border border-gray-200 bg-cream px-3 py-2.5 text-sm text-navy outline-none focus:border-teal placeholder:text-warm-gray/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark flex items-center justify-center gap-2"
                  >
                    Unlock Report
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <p className="mt-3 text-center text-[10px] text-warm-gray/60">
                  We&apos;ll send you sustainability insights. Unsubscribe anytime.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────────── Empty State ────────── */}
      {lineItems.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <Scale className="mx-auto h-10 w-10 text-warm-gray/30 mb-3" />
          <h3 className="font-semibold text-navy">Start your specification</h3>
          <p className="text-sm text-warm-gray mt-1 max-w-md mx-auto">
            Add materials above to calculate the embodied carbon of your project.
            The tool will suggest lower-carbon alternatives and show how you compare against LETI and RIBA 2030 benchmarks.
          </p>
        </div>
      )}

      {/* ────────── Data Sources & Methodology ────────── */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <button
          onClick={() => setShowSources(!showSources)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-cream/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-navy">
            <Info className="h-4 w-4 text-teal" />
            Data Sources &amp; Methodology
          </span>
          <ChevronDown
            className={`h-4 w-4 text-warm-gray transition-transform ${showSources ? "rotate-180" : ""}`}
          />
        </button>

        {showSources && (
          <div className="border-t border-gray-100 px-4 pb-5 pt-3 space-y-4">
            {/* Primary source */}
            <div>
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Primary Data Source
              </h4>
              <div className="rounded-lg bg-cream p-3">
                <p className="text-sm font-semibold text-navy">
                  ICE Database (Inventory of Carbon &amp; Energy)
                </p>
                <p className="text-xs text-warm-gray mt-0.5">
                  University of Bath / Circular Ecology · Current version: v4.1 (Oct 2025). Values based on v3.0 baseline with v4.1 methodology notes. Always check the latest version for project-specific work.
                </p>
                <a
                  href="https://circularecology.com/embodied-carbon-footprint-database.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal mt-1.5 hover:underline"
                >
                  circularecology.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Supplementary sources */}
            <div>
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Supplementary Sources
              </h4>
              <ul className="space-y-1.5 text-xs text-warm-gray">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-teal shrink-0" />
                  <span><strong className="text-navy">RICS</strong> Professional Statement: Whole Life Carbon Assessment (2nd ed. 2023)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-teal shrink-0" />
                  <span><strong className="text-navy">IStructE</strong> How to Calculate Embodied Carbon (2nd ed. 2022)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-teal shrink-0" />
                  <span><strong className="text-navy">BSRIA</strong> BG 76/2014: Embodied Carbon - The Inventory of Carbon and Energy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-teal shrink-0" />
                  <span>Manufacturer-published <strong className="text-navy">EPDs</strong> via EPD Hub &amp; individual manufacturers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-teal shrink-0" />
                  <span><strong className="text-navy">LETI</strong> Climate Emergency Design Guide (2020) - benchmarks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-teal shrink-0" />
                  <span><strong className="text-navy">RIBA</strong> 2030 Climate Challenge - targets</span>
                </li>
              </ul>
            </div>

            {/* Methodology / disclaimer */}
            <div className="rounded-lg bg-cream/70 border border-warm-gray/10 p-3">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                Important Notes
              </h4>
              <ul className="space-y-1 text-[11px] text-warm-gray leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-warm-gray/40 shrink-0" />
                  All embodied carbon values cover modules <strong className="text-navy">A1–A3</strong> (cradle-to-gate) unless otherwise noted.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-warm-gray/40 shrink-0" />
                  Values are <strong className="text-navy">representative UK industry averages</strong>, suitable for early-stage carbon estimation and awareness.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-warm-gray/40 shrink-0" />
                  For detailed design-stage decisions, always use <strong className="text-navy">project-specific EPD data</strong> from the actual product manufacturer.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 rounded-full bg-warm-gray/40 shrink-0" />
                  Carbon intensity can vary significantly between manufacturers, supply chains, and production methods.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
