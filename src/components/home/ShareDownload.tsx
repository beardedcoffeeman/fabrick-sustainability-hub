"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Linkedin, Twitter, Link2, Check } from "lucide-react";

// ============================================================
// Snapshot data types
// ============================================================

export interface SnapshotStat {
  label: string;
  value: string;
  color?: string;
}

export interface SnapshotData {
  headline: string;
  headlineColor?: string;
  subtitle?: string;
  stats?: SnapshotStat[];
  footer?: string;
  variant: "dark" | "light" | "teal";
}

// ============================================================
// Brand colours (raw hex, no Tailwind/oklab needed)
// ============================================================

const BRAND = {
  navy: "#2D2D3F",
  navyLight: "#3D3D52",
  charcoal: "#1A1A2E",
  teal: "#00BFA5",
  pink: "#FF3D7F",
  cream: "#F0EBE3",
  creamDark: "#E5DFD5",
  warmGray: "#8A8A9A",
  white: "#FFFFFF",
};

const VARIANT_BG: Record<SnapshotData["variant"], string> = {
  dark: BRAND.charcoal,
  light: BRAND.white,
  teal: BRAND.teal,
};

const VARIANT_TEXT: Record<SnapshotData["variant"], string> = {
  dark: BRAND.white,
  light: BRAND.navy,
  teal: BRAND.white,
};

const VARIANT_SUBTEXT: Record<SnapshotData["variant"], string> = {
  dark: BRAND.warmGray,
  light: BRAND.warmGray,
  teal: "rgba(255,255,255,0.7)",
};

const VARIANT_STAT_BG: Record<SnapshotData["variant"], string> = {
  dark: "rgba(255,255,255,0.08)",
  light: BRAND.cream,
  teal: "rgba(255,255,255,0.15)",
};

const VARIANT_STAT_TEXT: Record<SnapshotData["variant"], string> = {
  dark: BRAND.white,
  light: BRAND.navy,
  teal: BRAND.white,
};

const VARIANT_GRID: Record<SnapshotData["variant"], string> = {
  dark: "rgba(255,255,255,0.03)",
  light: "rgba(45,45,63,0.04)",
  teal: "rgba(255,255,255,0.06)",
};

// ============================================================
// Canvas drawing helpers
// ============================================================

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  spacing: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (let x = spacing; x < w; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = spacing; y < h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function formatDateStamp(): string {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function dateSlug(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ============================================================
// Core render function: draws snapshot entirely via Canvas 2D
// ============================================================

function renderSnapshot(data: SnapshotData): HTMLCanvasElement {
  const SCALE = 2;
  const W = 800;
  const H = 500;
  const CW = W * SCALE;
  const CH = H * SCALE;

  const canvas = document.createElement("canvas");
  canvas.width = CW;
  canvas.height = CH;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  const bg = VARIANT_BG[data.variant];
  const textColor = VARIANT_TEXT[data.variant];
  const subtextColor = VARIANT_SUBTEXT[data.variant];
  const gridColor = VARIANT_GRID[data.variant];
  const statBg = VARIANT_STAT_BG[data.variant];
  const statText = VARIANT_STAT_TEXT[data.variant];

  // -- Background with rounded corners --
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.save();
  roundRect(ctx, 0, 0, W, H, 24);
  ctx.clip();

  // -- Grid pattern --
  drawGrid(ctx, W, H, gridColor, 40);

  // -- Content area --
  const PAD_X = 48;
  let cursorY = 56;

  // -- Subtitle (small caps above headline) --
  if (data.subtitle) {
    ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = subtextColor;
    ctx.letterSpacing = "2px";
    ctx.textBaseline = "top";
    ctx.fillText(data.subtitle.toUpperCase(), PAD_X, cursorY);
    ctx.letterSpacing = "0px";
    cursorY += 30;
  }

  // -- Headline --
  ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = data.headlineColor || textColor;
  ctx.textBaseline = "top";

  // Word-wrap the headline if it is too wide
  const headlineMaxW = W - PAD_X * 2;
  const headlineLines = wrapText(ctx, data.headline, headlineMaxW);
  for (const line of headlineLines) {
    ctx.fillText(line, PAD_X, cursorY);
    cursorY += 62;
  }

  cursorY += 8;

  // -- Stats row --
  if (data.stats && data.stats.length > 0) {
    const gap = 12;
    const statCount = data.stats.length;
    const totalGap = gap * (statCount - 1);
    const availW = W - PAD_X * 2;
    const statW = Math.min((availW - totalGap) / statCount, 200);
    const statH = 76;
    const statR = 14;

    let sx = PAD_X;
    for (const stat of data.stats) {
      // Stat box background
      roundRect(ctx, sx, cursorY, statW, statH, statR);
      ctx.fillStyle = statBg;
      ctx.fill();

      // Stat value
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = stat.color || statText;
      ctx.textBaseline = "top";
      ctx.fillText(stat.value, sx + 16, cursorY + 14);

      // Stat label
      ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillStyle = subtextColor;
      ctx.fillText(stat.label, sx + 16, cursorY + 48);

      sx += statW + gap;
    }
    cursorY += statH + 20;
  }

  // -- Footer / source line --
  if (data.footer) {
    ctx.font = "400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillStyle = subtextColor;
    ctx.textBaseline = "top";
    ctx.fillText(data.footer, PAD_X, Math.min(cursorY, H - 120));
  }

  // -- Branding strip at bottom --
  const brandY = H - 62;

  // Separator line
  ctx.beginPath();
  ctx.moveTo(PAD_X, brandY - 8);
  ctx.lineTo(W - PAD_X, brandY - 8);
  ctx.strokeStyle =
    data.variant === "light" ? BRAND.creamDark : "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left: FABRICK pill
  const pillText = "FABRICK";
  ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  const pillTextW = ctx.measureText(pillText).width;
  const pillW = pillTextW + 20;
  const pillH = 24;
  const pillX = PAD_X;
  const pillY = brandY + 4;

  roundRect(ctx, pillX, pillY, pillW, pillH, 12);
  ctx.fillStyle = BRAND.navy;
  ctx.fill();
  ctx.fillStyle = BRAND.white;
  ctx.textBaseline = "middle";
  ctx.fillText(pillText, pillX + 10, pillY + pillH / 2 + 1);

  // "Built Environment Data" next to pill
  ctx.font = "500 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = subtextColor;
  ctx.textBaseline = "middle";
  ctx.fillText("Built Environment Data", pillX + pillW + 10, pillY + pillH / 2 + 1);

  // Right side: tagline and date
  ctx.textAlign = "right";

  // Tagline
  ctx.font = "italic 11px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = subtextColor;
  ctx.fillText("Driven by data. Powered by creativity.", W - PAD_X, brandY + 10);

  // Date stamp
  ctx.font = "500 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  ctx.fillStyle = subtextColor;
  ctx.fillText(formatDateStamp(), W - PAD_X, brandY + 28);

  ctx.textAlign = "left"; // Reset

  // -- Accent bar at very top --
  const accentH = 4;
  const gradient = ctx.createLinearGradient(0, 0, W, 0);
  gradient.addColorStop(0, BRAND.teal);
  gradient.addColorStop(0.5, BRAND.pink);
  gradient.addColorStop(1, BRAND.teal);
  roundRect(ctx, 0, 0, W, accentH + 24, 24);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, accentH);
  ctx.restore();

  ctx.restore(); // pop the main clip

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ============================================================
// Component
// ============================================================

interface ShareDownloadProps {
  /** A ref to the DOM element to capture for download (kept for backward compat) */
  captureRef: React.RefObject<HTMLElement | null>;
  /** Title used in social share text and file name */
  title: string;
  /** The URL path for sharing (e.g. /dashboard) */
  sharePath?: string;
  compact?: boolean;
  /** Data for generating a canvas-drawn PNG snapshot */
  snapshotData?: SnapshotData;
}

export function ShareDownload({
  captureRef,
  title,
  sharePath = "/",
  compact = false,
  snapshotData,
}: ShareDownloadProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  // ---- Download Snapshot (Canvas 2D) ----
  const handleDownload = useCallback(() => {
    if (!snapshotData) return;
    setDownloading(true);

    // Use requestAnimationFrame to let the UI update with the loading state
    requestAnimationFrame(() => {
      try {
        const canvas = renderSnapshot(snapshotData);
        const dataUrl = canvas.toDataURL("image/png");

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `fabrick-${slugify(title)}-${dateSlug()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        console.error("Snapshot download failed:", err);
      } finally {
        setDownloading(false);
      }
    });
  }, [snapshotData, title]);

  // ---- Fallback: copy text data ----
  const handleCopyData = useCallback(() => {
    if (!captureRef.current) return;

    const el = captureRef.current;
    const textContent = el.innerText
      .split("\n")
      .filter((line: string) => line.trim())
      .join("\n");

    const formatted = `${title} - Fabrick Built Environment Data\n${"=".repeat(40)}\n${textContent}\n\nSource: ${typeof window !== "undefined" ? window.location.origin : ""}${sharePath}\nDriven by data. Powered by creativity.`;

    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [captureRef, title, sharePath]);

  const handleCopyLink = useCallback(() => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }, [getShareUrl]);

  const handleLinkedIn = useCallback(() => {
    const url = getShareUrl();
    const text = `${title} - Live data from the Fabrick Built Environment Platform`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=500"
    );
  }, [getShareUrl, title]);

  const handleTwitter = useCallback(() => {
    const url = getShareUrl();
    const text = `${title} - Live data from @FabrickAgency's Built Environment Platform`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  }, [getShareUrl, title]);

  if (compact) {
    const btnBase =
      "h-7 w-7 rounded-md text-warm-gray/60 hover:text-navy hover:bg-cream-dark";
    const iconSize = "h-3 w-3";
    return (
      <div className="flex items-center gap-0.5">
        <button
          onClick={snapshotData ? handleDownload : handleCopyData}
          className={`${btnBase} flex items-center justify-center transition-colors`}
          title={snapshotData ? "Download snapshot" : "Copy data"}
        >
          <Download className={iconSize} />
        </button>
        <button
          onClick={handleCopyLink}
          className={`${btnBase} flex items-center justify-center transition-colors`}
          title="Copy link"
        >
          {copied ? (
            <Check className={`${iconSize} text-teal`} />
          ) : (
            <Link2 className={iconSize} />
          )}
        </button>
      </div>
    );
  }

  // Full-size: proper labeled buttons
  const btnClasses =
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all cursor-pointer";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {snapshotData ? (
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`${btnClasses} bg-white/10 hover:bg-white/20 text-current`}
        >
          {downloading ? (
            <>
              <Download className="h-3 w-3 animate-pulse" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-3 w-3" />
              Download Snapshot
            </>
          )}
        </button>
      ) : (
        <button
          onClick={handleCopyData}
          className={`${btnClasses} bg-white/10 hover:bg-white/20 text-current`}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-teal" />
              Copied!
            </>
          ) : (
            <>
              <Download className="h-3 w-3" />
              Copy Data
            </>
          )}
        </button>
      )}
      <button
        onClick={handleLinkedIn}
        className={`${btnClasses} bg-white/10 hover:bg-white/20 text-current`}
      >
        <Linkedin className="h-3 w-3" />
        LinkedIn
      </button>
      <button
        onClick={handleTwitter}
        className={`${btnClasses} bg-white/10 hover:bg-white/20 text-current`}
      >
        <Twitter className="h-3 w-3" />
        X
      </button>
      <button
        onClick={handleCopyLink}
        className={`${btnClasses} bg-white/10 hover:bg-white/20 text-current`}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-teal" />
            Copied!
          </>
        ) : (
          <>
            <Link2 className="h-3 w-3" />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}
