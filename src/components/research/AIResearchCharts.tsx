"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

// Study data lives in aiStudyData.ts, which is deliberately not a client
// module so the server-rendered pages can import the same values. Re-exported
// here so existing imports from this file keep working.
import { MODELS, MODEL_ORDER, MODEL_NAMES, CATEGORIES, STUDY } from "./aiStudyData";
import type { ModelRow, CategoryRow } from "./aiStudyData";

export { MODELS, MODEL_ORDER, MODEL_NAMES, CATEGORIES, STUDY };
export type { ModelRow, CategoryRow };

const TEAL = "#00BFA5";
const PINK = "#FF3D7F";

// ──────────────────────────────────────────────────
// Rankings chart — horizontal bars, paid vs free
// ──────────────────────────────────────────────────

export function AIRankingsChart() {
  const data = MODELS.map((m) => ({ ...m }));
  // Models within the tie band scored closely enough that the order between
  // them is not meaningful. Grouping them keeps the chart from implying a
  // precision the data does not support.
  const bands = Array.from(new Set(data.map((m) => m.band)));
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TEAL }} />
          <span className="text-warm-gray">Paid model</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PINK }} />
          <span className="text-warm-gray">Free model</span>
        </div>
      </div>
      <p className="mb-4 rounded-lg bg-cream px-3 py-2 text-xs leading-relaxed text-warm-gray">
        <strong className="text-navy">Read these as {bands.length} groups, not 18 places.</strong>{" "}
        Models within {STUDY.tieBandPp} percentage points of each other are tied, because gaps that
        small sit inside the margin of the scoring method. Hover any bar for the exact model version
        tested and the models it ties with.
      </p>
      {/* Height scales with the model count so bars stay legible as the
          line-up changes between waves. */}
      <div className="w-full" style={{ height: Math.max(460, data.length * 34 + 48) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="#E5DFD5" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#8A8A9A" fontSize={11} />
            <YAxis type="category" dataKey="name" width={150} stroke="#2D2D3F" fontSize={12} tick={{ fontWeight: 600 }} />
            <Tooltip
              cursor={{ fill: "rgba(0,191,165,0.06)" }}
              contentStyle={{ background: "#1A1A2E", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
              formatter={(value, _name, ctx) => {
                // Read the row straight off the payload rather than by index:
                // the previous index lookup silently returned the wrong model
                // whenever Recharts reordered or filtered the series.
                const m = (ctx as { payload?: ModelRow }).payload;
                if (!m) return [`${value}%`, "Score"];
                const ties = data.filter((d) => d.band === m.band && d.id !== m.id);
                const tieNote = ties.length
                  ? ` — tied with ${ties.map((t) => t.name).join(", ")}`
                  : " — no other model within the tie band";
                return [
                  `${value}%  (Correct ${m.correct} | Partial ${m.partial} | Wrong ${m.wrong})${tieNote}`,
                  m.modelId,
                ];
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.paid ? TEAL : PINK} />
              ))}
              <LabelList dataKey="score" position="right" formatter={(v) => `${v}%`} fill="#2D2D3F" fontSize={11} fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Paid vs Free chart — vertical, grouped paid first then free
// ──────────────────────────────────────────────────

export function AIPaidFreeChart() {
  const paid = MODELS.filter((m) => m.paid).sort((a, b) => b.score - a.score);
  const free = MODELS.filter((m) => !m.paid).sort((a, b) => b.score - a.score);
  const data = [...paid, ...free];
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="w-full" style={{ height: 440 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 96 }}>
            <CartesianGrid vertical={false} stroke="#E5DFD5" />
            <XAxis dataKey="name" stroke="#2D2D3F" fontSize={11} angle={-30} textAnchor="end" interval={0} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#8A8A9A" fontSize={11} />
            <Tooltip
              cursor={{ fill: "rgba(0,191,165,0.06)" }}
              contentStyle={{ background: "#1A1A2E", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
              formatter={(value) => [`${value}%`, "Score"]}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.paid ? TEAL : PINK} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Heatmap — scores per category x model
// ──────────────────────────────────────────────────

function heatColor(val: number): { bg: string; fg: string } {
  if (val >= 75) return { bg: "#0d8c87", fg: "#fff" };
  if (val >= 60) return { bg: "#00BFA5", fg: "#fff" };
  if (val >= 45) return { bg: "#A8ACA2", fg: "#fff" };
  if (val >= 30) return { bg: "#FF8C5A", fg: "#fff" };
  return { bg: "#FF3D7F", fg: "#fff" };
}

export function AICategoryHeatmap() {
  const catNames = Object.keys(CATEGORIES).sort();
  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-white px-3 py-3 text-left font-semibold text-navy">Category</th>
            {MODEL_ORDER.map((id) => (
              <th key={id} className="px-2 py-3 text-center font-semibold text-navy whitespace-nowrap">
                {MODEL_NAMES[id]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {catNames.map((cat) => (
            <tr key={cat} className="border-t border-cream-dark">
              <td className="sticky left-0 z-10 bg-white px-3 py-2 text-left">
                <span className="font-medium text-navy">{cat}</span>
                <span className="ml-1 text-[10px] text-warm-gray">({CATEGORIES[cat].questions} Qs)</span>
              </td>
              {MODEL_ORDER.map((id) => {
                const val = CATEGORIES[cat].scores[id];
                const c = heatColor(val);
                return (
                  <td key={id} className="px-1.5 py-1.5 text-center">
                    <span
                      className="inline-block min-w-[44px] rounded-md px-2 py-1 text-[11px] font-bold"
                      style={{ background: c.bg, color: c.fg }}
                    >
                      {val}%
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ──────────────────────────────────────────────────
// Category deep dive — selectable category, ranked horizontal bars
// ──────────────────────────────────────────────────

export function AICategoryDeepDive() {
  const catNames = Object.keys(CATEGORIES).sort();
  const [selected, setSelected] = useState(catNames[0]);
  const cat = CATEGORIES[selected];
  const isPaid: Record<string, boolean> = Object.fromEntries(MODELS.map((m) => [m.id, m.paid]));
  const sorted = MODEL_ORDER.slice().sort((a, b) => cat.scores[b] - cat.scores[a]);
  const data = sorted.map((id) => ({ id, name: MODEL_NAMES[id], score: cat.scores[id], paid: isPaid[id] }));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="categorySelect" className="text-sm font-semibold text-navy">
          Category:
        </label>
        <select
          id="categorySelect"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-teal"
        >
          {catNames.map((c) => (
            <option key={c} value={c}>
              {c} ({CATEGORIES[c].questions} Qs)
            </option>
          ))}
        </select>
      </div>
      {/* Height scales with the model count so bars stay legible as the
          line-up changes between waves. */}
      <div className="w-full" style={{ height: Math.max(460, data.length * 34 + 48) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="#E5DFD5" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#8A8A9A" fontSize={11} />
            <YAxis type="category" dataKey="name" width={150} stroke="#2D2D3F" fontSize={12} tick={{ fontWeight: 600 }} />
            <Tooltip
              cursor={{ fill: "rgba(0,191,165,0.06)" }}
              contentStyle={{ background: "#1A1A2E", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
              formatter={(value) => [`${value}%`, "Score"]}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.paid ? TEAL : PINK} />
              ))}
              <LabelList dataKey="score" position="right" formatter={(v) => `${v}%`} fill="#2D2D3F" fontSize={11} fontWeight={600} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
