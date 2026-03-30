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
  const [downloading, setDownloading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const handleDownload = useCallback(async () => {
    if (!captureRef.current || downloading) return;
    setDownloading(true);

    try {
      const html2canvas = (await import("html2canvas")).default;

      const wrapper = document.createElement("div");
      wrapper.style.cssText = `
        padding: 24px;
        background: #F0EBE3;
        border-radius: 16px;
        position: fixed;
        left: -9999px;
        top: 0;
        z-index: -1;
        width: ${captureRef.current.offsetWidth + 48}px;
      `;

      const clone = captureRef.current.cloneNode(true) as HTMLElement;
      wrapper.appendChild(clone);

      const footer = document.createElement("div");
      footer.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0 0;
        margin-top: 16px;
        border-top: 1px solid #E5DFD5;
        font-family: Inter, sans-serif;
      `;
      footer.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="background:#2D2D3F;color:white;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:0.5px;">FABRICK</div>
          <span style="font-size:10px;color:#8A8A9A;">Built Environment Platform</span>
        </div>
        <span style="font-size:9px;color:#8A8A9A;">Driven by data. Powered by creativity.</span>
      `;
      wrapper.appendChild(footer);

      document.body.appendChild(wrapper);

      const canvas = await html2canvas(wrapper, {
        backgroundColor: "#F0EBE3",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(wrapper);

      const link = document.createElement("a");
      link.download = `fabrick-${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [captureRef, title, downloading]);

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
        <button onClick={handleDownload} disabled={downloading} className={`${btnBase} flex items-center justify-center transition-colors`} title="Download as image">
          <Download className={`${iconSize} ${downloading ? "animate-bounce" : ""}`} />
        </button>
        <button onClick={handleCopyLink} className={`${btnBase} flex items-center justify-center transition-colors`} title="Copy link">
          {copied ? <Check className={`${iconSize} text-teal`} /> : <Link2 className={iconSize} />}
        </button>
      </div>
    );
  }

  // Full-size: proper labeled buttons
  const btnClasses =
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`${btnClasses} bg-white/10 hover:bg-white/20 text-current`}
      >
        <Download className={`h-3 w-3 ${downloading ? "animate-bounce" : ""}`} />
        Download
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
