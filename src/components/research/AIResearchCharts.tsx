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

// ──────────────────────────────────────────────────
// Data — Fabrick AI in Construction Test (2025)
// ──────────────────────────────────────────────────

export interface ModelRow {
  id: string;
  name: string;
  score: number;
  correct: number;
  partial: number;
  wrong: number;
  paid: boolean;
}

export const MODELS: ModelRow[] = [
  { id: "claude_opus", name: "Claude Opus 4.6", score: 77.0, correct: 587, partial: 367, wrong: 47, paid: true },
  { id: "perplexity_pro", name: "Perplexity Pro", score: 69.6, correct: 502, partial: 390, wrong: 109, paid: true },
  { id: "perplexity", name: "Perplexity", score: 68.0, correct: 478, partial: 405, wrong: 118, paid: false },
  { id: "mistral_large", name: "Mistral Large", score: 64.9, correct: 432, partial: 436, wrong: 133, paid: true },
  { id: "claude_sonnet", name: "Claude Sonnet 4.6", score: 64.8, correct: 436, partial: 426, wrong: 139, paid: false },
  { id: "gemini_paid", name: "Gemini 2.5 Pro", score: 62.1, correct: 408, partial: 427, wrong: 166, paid: true },
  { id: "chatgpt_paid", name: "ChatGPT 5.4", score: 57.4, correct: 355, partial: 440, wrong: 206, paid: true },
  { id: "mistral_small", name: "Mistral Small", score: 54.4, correct: 328, partial: 434, wrong: 239, paid: false },
  { id: "chatgpt_free", name: "ChatGPT Free 5.3", score: 49.3, correct: 271, partial: 444, wrong: 286, paid: false },
  { id: "gemini_free", name: "Gemini 2.5 Flash", score: 42.9, correct: 258, partial: 343, wrong: 400, paid: false },
];

export const MODEL_ORDER = MODELS.map((m) => m.id);
export const MODEL_NAMES: Record<string, string> = Object.fromEntries(MODELS.map((m) => [m.id, m.name]));

export interface CategoryRow {
  questions: number;
  scores: Record<string, number>;
}

export const CATEGORIES: Record<string, CategoryRow> = {
  "Accessibility & Inclusive Design": { questions: 50, scores: { claude_opus: 67, perplexity_pro: 62, perplexity: 52, mistral_large: 61, claude_sonnet: 45, gemini_paid: 58, chatgpt_paid: 40, mistral_small: 38, chatgpt_free: 35, gemini_free: 34 } },
  "British Standards - Concrete & Steel": { questions: 50, scores: { claude_opus: 80, perplexity_pro: 80, perplexity: 78, mistral_large: 79, claude_sonnet: 72, gemini_paid: 76, chatgpt_paid: 65, mistral_small: 60, chatgpt_free: 51, gemini_free: 55 } },
  "British Standards - Other Materials": { questions: 50, scores: { claude_opus: 87, perplexity: 82, perplexity_pro: 79, gemini_paid: 80, mistral_large: 74, claude_sonnet: 77, chatgpt_paid: 67, mistral_small: 65, chatgpt_free: 58, gemini_free: 56 } },
  "Building Regulations - Fire Safety": { questions: 55, scores: { claude_opus: 87, claude_sonnet: 77, mistral_large: 77, gemini_paid: 74, perplexity_pro: 73, perplexity: 69, chatgpt_paid: 65, mistral_small: 58, chatgpt_free: 52, gemini_free: 55 } },
  "Building Regulations - Other Parts": { questions: 50, scores: { claude_opus: 78, perplexity: 74, perplexity_pro: 74, gemini_paid: 70, claude_sonnet: 67, mistral_large: 65, chatgpt_paid: 55, mistral_small: 52, chatgpt_free: 48, gemini_free: 52 } },
  "Building Regulations - Thermal": { questions: 50, scores: { claude_opus: 87, perplexity_pro: 75, gemini_paid: 72, perplexity: 71, claude_sonnet: 65, mistral_large: 62, chatgpt_paid: 55, mistral_small: 50, chatgpt_free: 42, gemini_free: 48 } },
  "Construction Technology": { questions: 50, scores: { claude_opus: 73, perplexity_pro: 66, perplexity: 59, gemini_paid: 55, claude_sonnet: 52, mistral_large: 49, chatgpt_paid: 42, mistral_small: 38, chatgpt_free: 33, gemini_free: 28 } },
  "Contracts & Procurement": { questions: 55, scores: { claude_opus: 64, claude_sonnet: 56, perplexity_pro: 55, mistral_large: 53, perplexity: 50, gemini_paid: 50, chatgpt_paid: 42, mistral_small: 38, chatgpt_free: 30, gemini_free: 32 } },
  "Demolition & Refurbishment": { questions: 41, scores: { claude_opus: 71, perplexity: 61, perplexity_pro: 61, claude_sonnet: 58, gemini_paid: 56, mistral_large: 55, chatgpt_paid: 48, mistral_small: 44, chatgpt_free: 40, gemini_free: 36 } },
  "Environmental & Contamination": { questions: 45, scores: { perplexity_pro: 70, perplexity: 68, claude_opus: 66, gemini_paid: 60, claude_sonnet: 58, mistral_large: 55, chatgpt_paid: 50, mistral_small: 46, chatgpt_free: 42, gemini_free: 42 } },
  "Fire Safety - Post-Grenfell": { questions: 50, scores: { claude_opus: 79, perplexity: 76, perplexity_pro: 74, mistral_large: 68, gemini_paid: 67, claude_sonnet: 66, chatgpt_paid: 57, mistral_small: 52, chatgpt_free: 45, gemini_free: 48 } },
  "Health & Safety / CDM": { questions: 50, scores: { claude_opus: 78, perplexity: 76, perplexity_pro: 72, gemini_paid: 72, mistral_large: 69, claude_sonnet: 68, chatgpt_paid: 61, mistral_small: 58, chatgpt_free: 54, gemini_free: 56 } },
  "MEP & Building Services": { questions: 50, scores: { claude_opus: 73, perplexity_pro: 71, perplexity: 70, gemini_paid: 63, claude_sonnet: 62, mistral_large: 58, chatgpt_paid: 50, mistral_small: 45, chatgpt_free: 38, gemini_free: 46 } },
  "Materials & Products": { questions: 50, scores: { claude_opus: 77, perplexity_pro: 73, perplexity: 70, gemini_paid: 68, mistral_large: 64, claude_sonnet: 64, chatgpt_paid: 56, mistral_small: 50, chatgpt_free: 44, gemini_free: 58 } },
  "NHBC Standards": { questions: 50, scores: { claude_opus: 75, perplexity_pro: 64, mistral_large: 64, perplexity: 62, gemini_paid: 60, claude_sonnet: 60, chatgpt_paid: 52, mistral_small: 48, chatgpt_free: 42, gemini_free: 42 } },
  "Planning & Permitted Development": { questions: 55, scores: { claude_opus: 87, perplexity: 76, perplexity_pro: 76, mistral_large: 73, claude_sonnet: 73, gemini_paid: 72, chatgpt_paid: 67, mistral_small: 62, chatgpt_free: 55, gemini_free: 44 } },
  "Roofing & Cladding": { questions: 50, scores: { claude_opus: 76, perplexity_pro: 66, claude_sonnet: 65, perplexity: 62, gemini_paid: 58, mistral_large: 57, chatgpt_paid: 48, mistral_small: 42, chatgpt_free: 38, gemini_free: 46 } },
  "Structural Design & Loading": { questions: 50, scores: { claude_opus: 82, perplexity: 77, mistral_large: 77, perplexity_pro: 75, gemini_paid: 70, claude_sonnet: 68, chatgpt_paid: 60, mistral_small: 55, chatgpt_free: 48, gemini_free: 56 } },
  "Sustainability & Carbon": { questions: 50, scores: { claude_opus: 91, claude_sonnet: 78, perplexity_pro: 78, gemini_paid: 75, perplexity: 72, mistral_large: 72, chatgpt_paid: 65, mistral_small: 60, chatgpt_free: 55, gemini_free: 60 } },
  "Waterproofing & Below-Ground": { questions: 50, scores: { claude_opus: 59, claude_sonnet: 57, gemini_paid: 53, perplexity_pro: 52, perplexity: 50, mistral_large: 47, chatgpt_paid: 42, mistral_small: 38, chatgpt_free: 33, gemini_free: 34 } },
};

const TEAL = "#00BFA5";
const PINK = "#FF3D7F";

// ──────────────────────────────────────────────────
// Rankings chart — horizontal bars, paid vs free
// ──────────────────────────────────────────────────

export function AIRankingsChart() {
  const data = MODELS.map((m) => ({ ...m }));
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
      <div className="h-[460px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="#E5DFD5" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#8A8A9A" fontSize={11} />
            <YAxis type="category" dataKey="name" width={140} stroke="#2D2D3F" fontSize={12} tick={{ fontWeight: 600 }} />
            <Tooltip
              cursor={{ fill: "rgba(0,191,165,0.06)" }}
              contentStyle={{ background: "#1A1A2E", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
              formatter={(value, _name, ctx) => {
                const m = data[(ctx as { payload?: { index?: number } }).payload?.index ?? 0];
                return [`${value}% — Correct ${m?.correct} | Partial ${m?.partial} | Wrong ${m?.wrong}`, "Score"];
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
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 60 }}>
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
      <div className="h-[460px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 40, left: 8, bottom: 8 }}>
            <CartesianGrid horizontal={false} stroke="#E5DFD5" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} stroke="#8A8A9A" fontSize={11} />
            <YAxis type="category" dataKey="name" width={140} stroke="#2D2D3F" fontSize={12} tick={{ fontWeight: 600 }} />
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
