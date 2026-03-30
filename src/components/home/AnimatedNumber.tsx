"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Delay before starting the count-up animation (ms) */
  startDelay?: number;
}

export function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  startDelay = 0,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(startDelay === 0);
  const prevValue = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle start delay
  useEffect(() => {
    if (startDelay > 0) {
      timerRef.current = setTimeout(() => setStarted(true), startDelay);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;

    const start = prevValue.current;
    const diff = value - start;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, started]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
