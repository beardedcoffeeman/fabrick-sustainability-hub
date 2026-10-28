"use client";

import { useState } from "react";
import type { ArticleFigure as Figure } from "@/lib/article-content";

// Chart palette: validated against both the cream page (#F0EBE3) and white
// cards for lightness, chroma, CVD separation and 3:1 contrast.
const INK = "#2D2D3F"; // text primary (navy)
const INK_2 = "#8A8A9A"; // text secondary (warm gray)
const GRID = "#E5DFD5"; // hairline, one step off the surface
const SERIES_1 = "#00836F"; // teal, emphasis / positive
const SERIES_2 = "#E8246B"; // pink, second series / negative
const MUTED = "#B9B9C4"; // de-emphasis marks
const SURFACE = "#FFFFFF";

const fmt = (n: number, unit?: string, decimals?: number) => {
  const abs = Math.abs(n);
  const d = decimals ?? (abs >= 1000 ? 0 : abs < 1 ? 2 : abs < 10 ? 1 : 0);
  const s = n.toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
  if (!unit) return s;
  if (unit === "%") return `${s}%`;
  if (unit.startsWith("£")) return `${n < 0 ? "-" : ""}£${s.replace("-", "")}${unit.slice(1)}`;
  return `${s} ${unit}`;
};

// "Nice" axis ticks: a step of 1, 2, 2.5 or 5 x 10^k that gives about 4 to 5 ticks.
const niceTicks = (lo: number, hi: number, target = 4) => {
  const raw = (hi - lo) / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? pow * 10;
  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
  return { min, max, ticks };
};

function Card({
  title,
  caption,
  source,
  children,
  table,
}: {
  title?: string;
  caption?: string;
  source?: string;
  children: React.ReactNode;
  table?: React.ReactNode;
}) {
  return (
    <figure className="my-6 rounded-2xl bg-white p-5 shadow-sm">
      {title && <figcaption className="text-sm font-semibold text-navy mb-3">{title}</figcaption>}
      {children}
      {caption && <p className="mt-3 text-xs text-navy/70 leading-snug">{caption}</p>}
      {source && <p className="mt-1 text-[11px] text-warm-gray">Source: {source}</p>}
      {table && (
        <details className="mt-2">
          <summary className="cursor-pointer text-[11px] text-warm-gray hover:text-teal">View as table</summary>
          <div className="mt-2 overflow-x-auto">{table}</div>
        </details>
      )}
    </figure>
  );
}

function Tip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute z-10 rounded-md bg-charcoal px-2 py-1 text-[11px] text-white shadow"
      style={{ left: `${x}%`, top: y, transform: "translate(-50%, -110%)", whiteSpace: "nowrap" }}
    >
      {children}
    </div>
  );
}

function Stats({ f }: { f: Extract<Figure, { kind: "stats" }> }) {
  return (
    <Card title={f.title} source={f.source}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {f.items.map((it) => (
          <div key={it.label} className="rounded-xl bg-cream p-4">
            <div className="text-[11px] uppercase tracking-wide text-warm-gray">{it.label}</div>
            <div className="mt-1 text-2xl font-semibold text-navy">{it.value}</div>
            {it.note && <div className="mt-1 text-xs text-navy/70 leading-snug">{it.note}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function Bars({ f }: { f: Extract<Figure, { kind: "bars" }> }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...f.items.map((i) => i.value));
  const W = 640, labelW = 290, rowH = 34, barH = 18, padR = 70;
  const H = f.items.length * rowH + 8;
  const scale = (v: number) => ((W - labelW - padR) * v) / max;
  return (
    <Card title={f.title} caption={f.caption} source={f.source}
      table={<table className="text-xs text-navy"><tbody>{f.items.map((i) => (
        <tr key={i.label}><td className="pr-4 py-0.5">{i.label}</td><td className="py-0.5 tabular-nums">{fmt(i.value, f.unit)}</td></tr>))}</tbody></table>}>
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label={f.title}>
          {f.items.map((it, idx) => {
            const y = idx * rowH + 4;
            const w = Math.max(scale(it.value), 2);
            return (
              <g key={it.label} onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)}>
                <rect x={0} y={y} width={W} height={rowH - 4} fill="transparent" />
                <text x={labelW - 10} y={y + barH / 2 + 4} textAnchor="end" fontSize={12} fill={INK}>{it.label}</text>
                <path d={`M${labelW},${y} h${w - 4} a4,4 0 0 1 4,4 v${barH - 8} a4,4 0 0 1 -4,4 h-${w - 4} z`}
                  fill={SERIES_1} opacity={hover === null || hover === idx ? 1 : 0.55} />
                <text x={labelW + w + 8} y={y + barH / 2 + 4} fontSize={12} fill={INK} className="tabular-nums">{fmt(it.value, f.unit)}</text>
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <Tip x={((labelW + scale(f.items[hover].value) / 2) / W) * 100} y={(hover * rowH + 4) * 0.9}>
            {f.items[hover].label}: {fmt(f.items[hover].value, f.unit)}{f.items[hover].note ? ` (${f.items[hover].note})` : ""}
          </Tip>
        )}
      </div>
    </Card>
  );
}

function Diverging({ f }: { f: Extract<Figure, { kind: "diverging" }> }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...f.items.map((i) => Math.abs(i.value)));
  const W = 600, labelW = 220, rowH = 30, barH = 16;
  const H = f.items.length * rowH + 8;
  const half = (W - labelW - 60) / 2;
  const zero = labelW + half;
  const scale = (v: number) => ((half - 56) * Math.abs(v)) / max;
  return (
    <Card title={f.title} caption={f.caption} source={f.source}
      table={<table className="text-xs text-navy"><tbody>{f.items.map((i) => (
        <tr key={i.label}><td className="pr-4 py-0.5">{i.label}</td><td className="py-0.5 tabular-nums">{fmt(i.value, f.unit, 1)}</td></tr>))}</tbody></table>}>
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label={f.title}>
          <line x1={zero} x2={zero} y1={0} y2={H} stroke={GRID} strokeWidth={1} />
          {f.items.map((it, idx) => {
            const y = idx * rowH + 4;
            const w = Math.max(scale(it.value), 2);
            const neg = it.value < 0;
            const x = neg ? zero - w : zero;
            const d = neg
              ? `M${zero},${y} h-${w - 4} a4,4 0 0 0 -4,4 v${barH - 8} a4,4 0 0 0 4,4 h${w - 4} z`
              : `M${zero},${y} h${w - 4} a4,4 0 0 1 4,4 v${barH - 8} a4,4 0 0 1 -4,4 h-${w - 4} z`;
            return (
              <g key={it.label} onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)}>
                <rect x={0} y={y - 2} width={W} height={rowH} fill="transparent" />
                <text x={labelW - 10} y={y + barH / 2 + 4} textAnchor="end" fontSize={12} fill={INK}>{it.label}</text>
                <path d={d} fill={neg ? SERIES_2 : SERIES_1} opacity={hover === null || hover === idx ? 1 : 0.55} />
                <text x={neg ? x - 6 : zero + w + 6} y={y + barH / 2 + 4} textAnchor={neg ? "end" : "start"} fontSize={12} fill={INK}>
                  {it.value > 0 ? "+" : ""}{fmt(it.value, f.unit, 1)}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-2 flex items-center gap-4 text-[11px] text-navy/70">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERIES_1 }} />Up on a year earlier</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERIES_2 }} />Down on a year earlier</span>
        </div>
      </div>
    </Card>
  );
}

function Lines({ f }: { f: Extract<Figure, { kind: "lines" }> }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 260, padL = 48, padR = 150, padT = 16, padB = 34;
  const all = f.series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const nice = niceTicks(f.yMin ?? Math.min(...all), Math.max(...all));
  const yMin = nice.min, yMax = nice.max;
  const n = f.xLabels.length;
  const x = (i: number) => padL + ((W - padL - padR) * i) / (n - 1);
  const y = (v: number) => padT + (H - padT - padB) * (1 - (v - yMin) / (yMax - yMin || 1));
  const colour = (s: (typeof f.series)[number], i: number) =>
    f.series.length === 1 ? SERIES_1 : s.emphasis ? SERIES_1 : f.series.some((q) => q.emphasis) ? MUTED : i === 0 ? SERIES_1 : SERIES_2;
  const step = Math.max(1, Math.ceil(n / 8));
  return (
    <Card title={f.title} caption={f.caption} source={f.source}
      table={<table className="text-xs text-navy"><thead><tr><th className="pr-3 text-left"></th>{f.series.map((s) => <th key={s.name} className="pr-3 text-left font-medium">{s.name}</th>)}</tr></thead>
        <tbody>{f.xLabels.map((l, i) => (<tr key={l}><td className="pr-3 py-0.5">{l}</td>{f.series.map((s) => <td key={s.name} className="pr-3 py-0.5 tabular-nums">{s.values[i] === null ? "" : fmt(s.values[i] as number)}</td>)}</tr>))}</tbody></table>}>
      <div className="relative overflow-x-auto" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label={f.title}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const i = Math.round(((px - padL) / (W - padL - padR)) * (n - 1));
            setHover(Math.max(0, Math.min(n - 1, i)));
          }}>
          {nice.ticks.map((v) => {
            return (
              <g key={v}>
                <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke={GRID} strokeWidth={1} />
                <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill={INK_2} className="tabular-nums">{fmt(v)}</text>
              </g>
            );
          })}
          {f.xLabels.map((l, i) => (i % step === 0 || i === n - 1) && (
            <text key={l} x={x(i)} y={H - padB + 18} textAnchor="middle" fontSize={11} fill={INK_2}>{l}</text>
          ))}
          {f.forecastFrom !== undefined && (
            <line x1={x(f.forecastFrom)} x2={x(f.forecastFrom)} y1={padT} y2={H - padB} stroke={INK_2} strokeWidth={1} strokeDasharray="3 3" />
          )}
          {f.forecastFrom !== undefined && (
            <text x={x(f.forecastFrom) + 4} y={padT + 10} fontSize={10} fill={INK_2}>forecast</text>
          )}
          {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke={INK_2} strokeWidth={1} />}
          {f.series.map((s, si) => {
            const c = colour(s, si);
            const pts = s.values.map((v, i) => (v === null ? null : [x(i), y(v)] as const));
            let d = ""; let pen = false;
            pts.forEach((p) => { if (!p) { pen = false; return; } d += `${pen ? "L" : "M"}${p[0]},${p[1]} `; pen = true; });
            const lastIdx = s.values.map((v, i) => (v === null ? -1 : i)).filter((i) => i >= 0).pop() ?? 0;
            const last = s.values[lastIdx] as number;
            return (
              <g key={s.name}>
                <path d={d} fill="none" stroke={c} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={x(lastIdx)} cy={y(last)} r={4} fill={c} stroke={SURFACE} strokeWidth={2} />
                {f.series.length <= 4 && (
                  <text x={x(lastIdx) + 10} y={y(last) + 4} fontSize={11} fill={INK}>{s.name} {fmt(last)}</text>
                )}
                {hover !== null && s.values[hover] !== null && (
                  <circle cx={x(hover)} cy={y(s.values[hover] as number)} r={4} fill={c} stroke={SURFACE} strokeWidth={2} />
                )}
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <Tip x={(x(hover) / W) * 100} y={padT * 0.9}>
            <div>{f.xLabels[hover]}</div>
            {f.series.map((s) => s.values[hover] !== null && (
              <div key={s.name}>{s.name}: {fmt(s.values[hover] as number, f.unit)}</div>
            ))}
          </Tip>
        )}
        {f.series.length > 1 && (
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-navy/70">
            {f.series.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1"><span className="inline-block h-0.5 w-4" style={{ background: colour(s, i) }} />{s.name}</span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function Dumbbell({ f }: { f: Extract<Figure, { kind: "dumbbell" }> }) {
  const [hover, setHover] = useState<number | null>(null);
  const all = f.items.flatMap((i) => [i.from, i.to]);
  const min = 0, max = Math.max(...all) * 1.15;
  const W = 600, labelW = 230, rowH = 36, padR = 30;
  const H = f.items.length * rowH + 8;
  const x = (v: number) => labelW + ((W - labelW - padR) * (v - min)) / (max - min);
  return (
    <Card title={f.title} caption={f.caption} source={f.source}
      table={<table className="text-xs text-navy"><thead><tr><th></th><th className="px-2 text-left font-medium">{f.fromLabel}</th><th className="px-2 text-left font-medium">{f.toLabel}</th></tr></thead>
        <tbody>{f.items.map((i) => (<tr key={i.label}><td className="pr-2 py-0.5">{i.label}</td><td className="px-2 tabular-nums">{fmt(i.from, f.unit, 1)}</td><td className="px-2 tabular-nums">{fmt(i.to, f.unit, 1)}</td></tr>))}</tbody></table>}>
      <div className="relative overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label={f.title}>
          {f.items.map((it, idx) => {
            const cy = idx * rowH + rowH / 2;
            return (
              <g key={it.label} onMouseEnter={() => setHover(idx)} onMouseLeave={() => setHover(null)}>
                <rect x={0} y={idx * rowH} width={W} height={rowH} fill="transparent" />
                <text x={labelW - 10} y={cy + 4} textAnchor="end" fontSize={12} fill={INK}>{it.label}</text>
                <line x1={labelW} x2={W - padR} y1={cy} y2={cy} stroke={GRID} strokeWidth={1} />
                <line x1={x(it.from)} x2={x(it.to)} y1={cy} y2={cy} stroke={INK_2} strokeWidth={2} />
                <circle cx={x(it.from)} cy={cy} r={5} fill={MUTED} stroke={SURFACE} strokeWidth={2} />
                <circle cx={x(it.to)} cy={cy} r={5} fill={SERIES_1} stroke={SURFACE} strokeWidth={2} />
                <text x={x(Math.max(it.from, it.to)) + 10} y={cy + 4} fontSize={12} fill={INK} className="tabular-nums">
                  {fmt(it.from, f.unit, 1)} to {fmt(it.to, f.unit, 1)}
                </text>
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <Tip x={(x(f.items[hover].to) / W) * 100} y={hover * rowH + 6}>
            {f.items[hover].label}: {f.fromLabel} {fmt(f.items[hover].from, f.unit, 1)}, {f.toLabel} {fmt(f.items[hover].to, f.unit, 1)}
          </Tip>
        )}
        <div className="mt-2 flex items-center gap-4 text-[11px] text-navy/70">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: MUTED }} />{f.fromLabel}</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SERIES_1 }} />{f.toLabel}</span>
        </div>
      </div>
    </Card>
  );
}

function Timeline({ f }: { f: Extract<Figure, { kind: "timeline" }> }) {
  return (
    <Card title={f.title} source={f.source}>
      <ol className="relative ml-3 border-l-2 border-cream-dark pl-5">
        {f.items.map((it) => (
          <li key={it.date + it.label} className="relative mb-4 last:mb-0">
            <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white" style={{ background: it.highlight ? SERIES_2 : SERIES_1 }} />
            <div className="text-[11px] font-semibold uppercase tracking-wide text-warm-gray">{it.date}</div>
            <div className="text-sm text-navy leading-snug">{it.label}</div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function ArticleFigure({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case "stats": return <Stats f={figure} />;
    case "bars": return <Bars f={figure} />;
    case "diverging": return <Diverging f={figure} />;
    case "lines": return <Lines f={figure} />;
    case "dumbbell": return <Dumbbell f={figure} />;
    case "timeline": return <Timeline f={figure} />;
  }
}
