"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ShareDownload, type SnapshotData } from "./ShareDownload";
import { SkeletonCard } from "./SkeletonCard";

export type CardVariant = "charcoal" | "white" | "teal" | "navy" | "pink";

interface DataCardProps {
  id: string;
  title: string;
  icon: React.ElementType;
  variant: CardVariant;
  loading: boolean;
  relevant: boolean;
  dimmed: boolean;
  delay: number;
  href?: string;
  sharePath?: string;
  className?: string;
  snapshotData?: SnapshotData;
  children: React.ReactNode;
}

const variantStyles: Record<
  CardVariant,
  { bg: string; text: string; subtext: string; iconColor: string }
> = {
  charcoal: {
    bg: "bg-charcoal",
    text: "text-white",
    subtext: "text-gray-400",
    iconColor: "text-teal",
  },
  white: {
    bg: "bg-white",
    text: "text-navy",
    subtext: "text-warm-gray",
    iconColor: "text-teal",
  },
  teal: {
    bg: "bg-teal",
    text: "text-white",
    subtext: "text-white/70",
    iconColor: "text-white",
  },
  navy: {
    bg: "bg-navy",
    text: "text-white",
    subtext: "text-gray-400",
    iconColor: "text-pink",
  },
  pink: {
    bg: "bg-pink",
    text: "text-white",
    subtext: "text-white/80",
    iconColor: "text-white",
  },
};

export function DataCard({
  id: _id,
  title,
  icon: Icon,
  variant,
  loading,
  relevant,
  dimmed,
  delay,
  href,
  sharePath = "/",
  className = "",
  snapshotData,
  children,
}: DataCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{
        opacity: dimmed ? 0.45 : 1,
        y: 0,
        scale: dimmed ? 0.98 : 1,
      }}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={`
        group relative rounded-3xl p-6 transition-all duration-300 overflow-hidden
        ${styles.bg} ${styles.text}
        ${relevant && !dimmed ? "ring-2 ring-teal/40 card-relevant" : ""}
        ${dimmed ? "pointer-events-none" : "hover:shadow-2xl hover:-translate-y-1"}
        ${className}
      `}
    >
      {/* Skeleton overlay */}
      {loading && (
        <div className="absolute inset-0 z-10 rounded-3xl overflow-hidden pointer-events-none">
          <SkeletonCard variant={variant} className="h-full !rounded-3xl" />
        </div>
      )}

      {/* Arrow motif - top right */}
      {href ? (
        <a
          href={href}
          className={`absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl
            transition-all duration-200 z-20
            ${variant === "white" ? "bg-cream group-hover:bg-navy group-hover:text-white" : "bg-white/10 group-hover:bg-white/20"}
          `}
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      ) : (
        <div
          className={`absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-xl
            ${variant === "white" ? "bg-cream" : "bg-white/10"}
          `}
        >
          <ArrowUpRight className="h-4 w-4 opacity-50" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pr-12">
        <Icon className={`h-4.5 w-4.5 ${styles.iconColor}`} />
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${styles.subtext}`}>
          {title}
        </span>
      </div>

      {/* Content */}
      {children}

      {/* Share/Download */}
      <div
        className="mt-4 pt-3 border-t opacity-50 group-hover:opacity-100 transition-opacity duration-200 relative z-20"
        style={{ borderColor: variant === "white" ? "var(--color-cream-dark)" : "rgba(255,255,255,0.1)" }}
      >
        <ShareDownload
          title={title}
          sharePath={sharePath}
          compact={false}
          snapshotData={snapshotData}
        />
      </div>
    </motion.div>
  );
}
