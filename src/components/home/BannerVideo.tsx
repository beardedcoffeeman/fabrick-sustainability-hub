"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

interface BannerVideoProps {
  src: string;
  poster?: string;
}

export function BannerVideo({ src, poster }: BannerVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReducedMotion(mq.matches);
      if (mq.matches && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay={!reducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
        {/* Contrast overlay: vertical gradient for text readability.
            Lighter tones than before - lifts the brightness of the
            footage while keeping copy legible. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-charcoal/45 via-charcoal/25 to-charcoal/55"
        />
        {/* Subtle vignette on the left where copy sits */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-charcoal/25 via-transparent to-transparent"
        />
      </div>

      {/* Pause/play control - WCAG 2.2.2. Sibling, not child, so it stacks above content. */}
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-white transition-all hover:bg-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
        aria-label={isPlaying ? "Pause background video" : "Play background video"}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4 translate-x-[1px]" aria-hidden="true" />
        )}
      </button>
    </>
  );
}
