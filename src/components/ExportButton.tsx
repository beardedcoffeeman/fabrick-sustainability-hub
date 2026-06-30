"use client";

import { useState } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { track } from "@/lib/analytics";

/**
 * Captures a DOM element to a PNG and downloads it, so a user can drop a live
 * Pulse view straight into a presentation and cite us as the source (Amelia's
 * ask in the 30 Jun meeting). The element is referenced by id so any page can
 * mark its capture area without prop-drilling refs.
 */
export function ExportButton({
  targetId,
  filename,
  source,
  label = "Download",
  className = "",
}: {
  /** id of the element to capture. */
  targetId: string;
  /** download filename without extension. */
  filename: string;
  /** analytics label for what was exported. */
  source?: string;
  label?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "done">("idle");

  async function handleExport() {
    const node = document.getElementById(targetId);
    if (!node || state === "working") return;

    setState("working");
    track("dashboard_export", { source: source ?? filename, format: "png" });

    try {
      const dataUrl = await toPng(node, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
        // Skip any element marked data-export-ignore (e.g. the button itself).
        filter: (el) =>
          !(el instanceof HTMLElement && el.dataset.exportIgnore === "true"),
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();

      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      console.error("Pulse export failed", err);
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={state === "working"}
      data-export-ignore="true"
      className={`inline-flex items-center gap-2 rounded-full border border-charcoal/15 bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors hover:bg-cream disabled:opacity-60 ${className}`}
    >
      {state === "working" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : state === "done" ? (
        <Check className="h-3.5 w-3.5 text-teal" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      {state === "done" ? "Saved" : label}
    </button>
  );
}
