// Ask Pulse: one spec per tool input, turned into both the strict JSON schema
// sent to the model and the check run on what the model sends back. With
// eager input streaming the API does not validate tool input, and the SDK's
// tolerant parser can hand back a cut-off object, so every input is checked
// here before a tool runs.
//
// Every field is required and none is a union type: strict tool use allows
// at most 24 optional and 16 union-typed parameters across all tools in a
// request, so "no filter" is an empty string, "any", or 0 instead.

export type FieldSpec =
  | { kind: "string"; description: string; maxLength: number }
  | { kind: "enum"; description: string; values: readonly string[] }
  | { kind: "integer"; description: string; min: number; max: number }
  | { kind: "boolean"; description: string }
  | { kind: "enumArray"; description: string; values: readonly string[]; maxItems: number };

export type InputSpec = Record<string, FieldSpec>;

export type InputValue<S extends InputSpec> = {
  [K in keyof S]: S[K] extends { kind: "string" }
    ? string
    : S[K] extends { kind: "enum" }
      ? string
      : S[K] extends { kind: "integer" }
        ? number
        : S[K] extends { kind: "boolean" }
          ? boolean
          : string[];
};

/** The JSON schema for a spec: closed, every field required, no unsupported keywords. */
export function toJsonSchema(spec: InputSpec): {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
} {
  const properties: Record<string, unknown> = {};
  for (const [name, f] of Object.entries(spec)) {
    switch (f.kind) {
      case "string":
        properties[name] = { type: "string", description: f.description };
        break;
      case "enum":
        properties[name] = { type: "string", enum: [...f.values], description: f.description };
        break;
      case "integer":
        properties[name] = { type: "integer", description: f.description };
        break;
      case "boolean":
        properties[name] = { type: "boolean", description: f.description };
        break;
      case "enumArray":
        properties[name] = {
          type: "array",
          items: { type: "string", enum: [...f.values] },
          description: f.description,
        };
        break;
    }
  }
  return { type: "object", properties, required: Object.keys(spec), additionalProperties: false };
}

export type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

// Strict tool use does not guarantee the case of enum values, so they are
// matched case-insensitively and mapped back to the canonical spelling.
function matchEnum(values: readonly string[], v: string): string | null {
  const lower = v.trim().toLowerCase();
  return values.find((x) => x.toLowerCase() === lower) ?? null;
}

/** Checks the model's input against a spec. Unknown keys, wrong types or out-of-range values fail. */
export function checkInput<S extends InputSpec>(spec: S, raw: unknown): Checked<InputValue<S>> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "The input must be a JSON object." };
  }
  const obj = raw as Record<string, unknown>;
  const extra = Object.keys(obj).filter((k) => !(k in spec));
  if (extra.length) {
    return { ok: false, error: `Unknown field(s): ${extra.join(", ")}. Accepted fields: ${Object.keys(spec).join(", ")}.` };
  }
  const out: Record<string, unknown> = {};
  for (const [name, f] of Object.entries(spec)) {
    const v = obj[name];
    if (v === undefined) return { ok: false, error: `${name} is required.` };
    switch (f.kind) {
      case "string": {
        if (typeof v !== "string") return { ok: false, error: `${name} must be a string.` };
        if (v.length > f.maxLength) return { ok: false, error: `${name} must be at most ${f.maxLength} characters.` };
        // Control characters have no place in a filter.
        out[name] = v.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
        break;
      }
      case "enum": {
        const m = typeof v === "string" ? matchEnum(f.values, v) : null;
        if (!m) return { ok: false, error: `${name} must be one of: ${f.values.join(", ")}.` };
        out[name] = m;
        break;
      }
      case "integer": {
        if (typeof v !== "number" || !Number.isInteger(v)) return { ok: false, error: `${name} must be a whole number.` };
        if (v < f.min || v > f.max) return { ok: false, error: `${name} must be between ${f.min} and ${f.max}.` };
        out[name] = v;
        break;
      }
      case "boolean": {
        if (typeof v !== "boolean") return { ok: false, error: `${name} must be true or false.` };
        out[name] = v;
        break;
      }
      case "enumArray": {
        if (!Array.isArray(v)) return { ok: false, error: `${name} must be an array.` };
        if (v.length > f.maxItems) return { ok: false, error: `${name} can hold at most ${f.maxItems} items.` };
        const items: string[] = [];
        for (const item of v) {
          const m = typeof item === "string" ? matchEnum(f.values, item) : null;
          if (!m) return { ok: false, error: `Each item of ${name} must be one of: ${f.values.join(", ")}.` };
          if (!items.includes(m)) items.push(m);
        }
        out[name] = items;
        break;
      }
    }
  }
  return { ok: true, value: out as InputValue<S> };
}

/** Lower-case letters and digits only, "&" read as "and": for forgiving name matching. */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "");
}

/** Does every word of the query appear in the text (ignoring case and punctuation)? */
export function wordsMatch(text: string, query: string): boolean {
  const words = query
    .toLowerCase()
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0);
  if (!words.length) return true;
  const hay = ` ${text.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ")} `;
  return words.every((w) => hay.includes(w));
}

function bigrams(s: string): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
  return out;
}

/** Dice similarity of letter pairs, 0 to 1. */
export function similarity(a: string, b: string): number {
  const x = bigrams(norm(a));
  const y = bigrams(norm(b));
  if (!x.size || !y.size) return 0;
  let both = 0;
  for (const g of x) if (y.has(g)) both++;
  return (2 * both) / (x.size + y.size);
}

/** Up to n names most like the query (for "did you mean"). */
export function closest(query: string, names: string[], n = 6, threshold = 0.35): string[] {
  return names
    .map((name) => ({ name, s: similarity(query, name) }))
    .filter((x) => x.s >= threshold)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.name);
}

/** Cut text to n characters at a word boundary, with an ellipsis when cut. */
export function clip(text: string, n: number): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > n * 0.6 ? cut.slice(0, sp) : cut).trimEnd()}...`;
}

/** Round to d decimal places (for computed percentages). */
export function round(n: number, d = 1): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "" or a valid YYYY-MM-DD date; anything else is an error message. */
export function checkDate(name: string, v: string): string | null {
  if (!v) return null;
  if (!ISO_DATE.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) return `${name} must be empty or a date written YYYY-MM-DD.`;
  return null;
}
