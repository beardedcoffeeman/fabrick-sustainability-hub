"use client";

import { useCallback, useRef, useState } from "react";
import { Download, Linkedin, Twitter, Link2, Check } from "lucide-react";

interface ShareDownloadProps {
  /** A ref to the DOM element to capture for download */
  captureRef: React.RefObject<HTMLElement | null>;
  /** Title used in social share text */
  title: string;
  /** The URL path for sharing (e.g. /dashboard) */
  sharePath?: string;
  compact?: boolean;
}

export function ShareDownload({
  captureRef,
  title,
  sharePath = "/",
  compact = false,
}: ShareDownloadProps) {
  const [copied, setCopied] = useState(false);
  // downloading state removed - using clipboard-based copy instead
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const handleCopyData = useCallback(() => {
    if (!captureRef.current) return;

    // Extract text content from the card for a clean data copy
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
    // Compact: small icon-only buttons (backward compat)
    const btnBase = "h-7 w-7 rounded-md text-warm-gray/60 hover:text-navy hover:bg-cream-dark";
    const iconSize = "h-3 w-3";
    return (
      <div className="flex items-center gap-0.5">
        <button onClick={handleCopyData} className={`${btnBase} flex items-center justify-center transition-colors`} title="Copy data">
          <Download className={iconSize} />
        </button>
        <button onClick={handleCopyLink} className={`${btnBase} flex items-center justify-center transition-colors`} title="Copy link">
          {copied ? <Check className={`${iconSize} text-teal`} /> : <Link2 className={iconSize} />}
        </button>
      </div>
    );
  }

  // Full-size: proper labeled buttons
  const btnClasses =
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all cursor-pointer";

  return (
    <div className="flex items-center gap-2 flex-wrap">
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
