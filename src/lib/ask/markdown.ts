// A small, safe markdown reader for Ask Pulse answers. It turns text into a
// tree the panel renders as React elements (never as HTML) and understands
// only what the assistant is asked to write: paragraphs, numbered and bulleted
// lists, small tables, **bold**, *emphasis*, `code` and links. Links survive
// only when they point inside Pulse ("/dashboard/epc") or to an https
// address; anything else (javascript:, data:, http:, //elsewhere) keeps its
// words and loses the link. Copes with a half-streamed answer: an unfinished
// ** or [ simply shows as typed. Adapted from the Digital Dashboard helper.

export type MdInline =
  | { type: "text"; text: string }
  | { type: "strong"; children: MdInline[] }
  | { type: "em"; children: MdInline[] }
  | { type: "code"; text: string }
  | { type: "link"; href: string; external: boolean; children: MdInline[] }
  | { type: "br" };

export type MdBlock =
  | { type: "p"; children: MdInline[] }
  | { type: "ol"; start: number; items: MdInline[][] }
  | { type: "ul"; items: MdInline[][] }
  | { type: "table"; header: MdInline[][]; rows: MdInline[][][] };

/** The href to use for a link, or null when it must not be a link. */
export function safeHref(raw: string): { href: string; external: boolean } | null {
  const href = raw.trim();
  if (/[\s<>"'`\\]/.test(href) || /[\u0000-\u001f\u007f]/.test(href)) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return { href, external: false };
  if (/^https:\/\/[^/]/i.test(href)) {
    try {
      const u = new URL(href);
      return u.protocol === "https:" ? { href: u.toString(), external: true } : null;
    } catch {
      return null;
    }
  }
  return null;
}

const OL = /^\s{0,3}(\d{1,3})[.)]\s+(.*)$/;
const UL = /^\s{0,3}[-*+•]\s+(.*)$/;
const HEADING = /^\s{0,3}#{1,6}\s+(.*)$/;
const FENCE = /^\s{0,3}```/;
const TABLE_ROW = /^\s*\|.*\|\s*$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function parseAnswerMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let para: string[] = [];
  let list: { kind: "ol" | "ul"; start: number; items: string[][] } | null = null;

  const flushPara = () => {
    if (para.length) blocks.push({ type: "p", children: inlineLines(para) });
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map(inlineLines);
    blocks.push(list.kind === "ol" ? { type: "ol", start: list.start, items } : { type: "ul", items });
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE.test(line)) continue; // no code blocks: the fence marks go, the lines read as text
    if (!line.trim()) {
      flushPara();
      continue;
    }
    // A table: a header row, a separator row, then body rows.
    if (TABLE_ROW.test(line) && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1]) && lines[i + 1].includes("-")) {
      flushPara();
      flushList();
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && TABLE_ROW.test(lines[i])) {
        const cells = splitRow(lines[i]);
        rows.push(header.map((_, j) => cells[j] ?? ""));
        i++;
      }
      i--;
      blocks.push({ type: "table", header: header.map((h) => inline(h)), rows: rows.map((r) => r.map((c) => inline(c))) });
      continue;
    }
    const ol = line.match(OL);
    const ul = ol ? null : line.match(UL);
    if (ol || ul) {
      flushPara();
      const kind = ol ? "ol" : "ul";
      const text = (ol ? ol[2] : ul![1]).trim();
      if (!list || list.kind !== kind) {
        flushList();
        list = { kind, start: ol ? Number(ol[1]) : 1, items: [] };
      }
      list.items.push([text]);
      continue;
    }
    const heading = line.match(HEADING);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: "p", children: [{ type: "strong", children: inline(heading[1].trim()) }] });
      continue;
    }
    // An indented line straight after a list item continues that item; otherwise the list is over.
    if (list && /^\s+\S/.test(line) && !para.length) {
      const items = (list as { items: string[][] }).items;
      items[items.length - 1].push(line.trim());
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return blocks;
}

function inlineLines(lines: string[]): MdInline[] {
  const out: MdInline[] = [];
  lines.forEach((l, i) => {
    if (i > 0) out.push({ type: "br" });
    out.push(...inline(l));
  });
  return out;
}

/** Inline markup: `code`, **strong**, *em* / _em_, [text](href). Unclosed marks stay as text. */
export function inline(text: string): MdInline[] {
  const out: MdInline[] = [];
  let buf = "";
  const pushText = () => {
    if (buf) {
      const prev = out[out.length - 1];
      if (prev && prev.type === "text") prev.text += buf;
      else out.push({ type: "text", text: buf });
    }
    buf = "";
  };
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "`") {
      const end = text.indexOf("`", i + 1);
      if (end > i + 1) {
        pushText();
        out.push({ type: "code", text: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    if (c === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end > i + 2) {
        pushText();
        out.push({ type: "strong", children: inline(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }
    if ((c === "*" || c === "_") && text[i + 1] !== c && text[i + 1] !== " " && text[i + 1] !== undefined) {
      // _ only at a word boundary, so snake_case and paths stay intact.
      const wordStart = c === "*" || i === 0 || /[\s(]/.test(text[i - 1]);
      const end = text.indexOf(c, i + 1);
      if (wordStart && end > i + 1 && text[end - 1] !== " " && (c === "*" || end === text.length - 1 || /[\s.,;:!?)]/.test(text[end + 1]))) {
        pushText();
        out.push({ type: "em", children: inline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }
    if (c === "[") {
      const close = findClosingBracket(text, i);
      if (close !== -1 && text[close + 1] === "(") {
        const paren = text.indexOf(")", close + 2);
        if (paren !== -1) {
          const label = text.slice(i + 1, close);
          const target = safeHref(text.slice(close + 2, paren));
          pushText();
          if (target) out.push({ type: "link", href: target.href, external: target.external, children: inline(label) });
          else out.push(...inline(label)); // not a safe link: keep the words, drop the address
          i = paren + 1;
          continue;
        }
      }
    }
    buf += c;
    i++;
  }
  pushText();
  return out;
}

function findClosingBracket(text: string, open: number): number {
  let depth = 0;
  for (let j = open; j < text.length; j++) {
    if (text[j] === "[") depth++;
    else if (text[j] === "]") {
      depth--;
      if (depth === 0) return j;
    }
  }
  return -1;
}
