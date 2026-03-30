"use client";

interface SkeletonCardProps {
  variant?: "charcoal" | "white" | "teal" | "navy" | "pink";
  className?: string;
}

export function SkeletonCard({
  variant = "white",
  className = "",
}: SkeletonCardProps) {
  const isDark = variant === "charcoal" || variant === "navy" || variant === "teal" || variant === "pink";
  const shimmerClass = isDark ? "skeleton-shimmer-dark" : "skeleton-shimmer";

  const bgMap: Record<string, string> = {
    charcoal: "bg-charcoal",
    white: "bg-white",
    teal: "bg-teal",
    navy: "bg-navy",
    pink: "bg-pink",
  };

  return (
    <div
      className={`rounded-3xl p-6 ${bgMap[variant]} ${className}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`h-5 w-5 rounded ${shimmerClass}`} />
          <div className={`h-3 w-24 rounded ${shimmerClass}`} />
        </div>
        <div className={`h-5 w-5 rounded ${shimmerClass}`} />
      </div>

      {/* Big number */}
      <div className={`h-10 w-32 rounded-lg mb-3 ${shimmerClass}`} />

      {/* Subtitle */}
      <div className={`h-3 w-20 rounded mb-6 ${shimmerClass}`} />

      {/* Chart area */}
      <div className={`h-20 w-full rounded-xl ${shimmerClass}`} />

      {/* Footer line */}
      <div className={`h-3 w-40 rounded mt-4 ${shimmerClass}`} />
    </div>
  );
}
