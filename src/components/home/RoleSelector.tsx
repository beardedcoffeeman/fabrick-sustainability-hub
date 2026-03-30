"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Ruler,
  ClipboardList,
  HardHat,
  Wrench,
  Factory,
  Leaf,
  LayoutGrid,
} from "lucide-react";

export type Role =
  | "all"
  | "architect"
  | "specifier"
  | "site-manager"
  | "contractor"
  | "manufacturer"
  | "sustainability-lead";

export interface RoleConfig {
  id: Role;
  label: string;
  icon: React.ElementType;
  description: string;
  relevantCards: string[];
}

export const ROLES: RoleConfig[] = [
  {
    id: "all",
    label: "All Data",
    icon: LayoutGrid,
    description: "Complete overview of all live data feeds",
    relevantCards: [
      "carbon-intensity",
      "material-prices",
      "construction-output",
      "planning",
      "epc",
      "regulations",
    ],
  },
  {
    id: "architect",
    label: "Architect",
    icon: Ruler,
    description: "Design compliance, carbon metrics, material costs",
    relevantCards: [
      "carbon-intensity",
      "material-prices",
      "epc",
      "regulations",
      "construction-output",
    ],
  },
  {
    id: "specifier",
    label: "Specifier",
    icon: ClipboardList,
    description: "Material intelligence, product standards, pricing",
    relevantCards: [
      "material-prices",
      "carbon-intensity",
      "regulations",
      "epc",
    ],
  },
  {
    id: "site-manager",
    label: "Site Manager",
    icon: HardHat,
    description: "Operational carbon, site planning, resource data",
    relevantCards: [
      "carbon-intensity",
      "construction-output",
      "material-prices",
      "planning",
    ],
  },
  {
    id: "contractor",
    label: "Contractor",
    icon: Wrench,
    description: "Pipeline intelligence, tender pricing, output trends",
    relevantCards: [
      "construction-output",
      "material-prices",
      "carbon-intensity",
      "planning",
    ],
  },
  {
    id: "manufacturer",
    label: "Manufacturer",
    icon: Factory,
    description: "Market positioning, CBAM, demand forecasting",
    relevantCards: [
      "material-prices",
      "carbon-intensity",
      "regulations",
      "construction-output",
    ],
  },
  {
    id: "sustainability-lead",
    label: "Sustainability Lead",
    icon: Leaf,
    description: "Full regulatory roadmap, carbon metrics, performance data",
    relevantCards: [
      "carbon-intensity",
      "material-prices",
      "construction-output",
      "regulations",
      "epc",
      "planning",
    ],
  },
];

interface RoleSelectorProps {
  activeRole: Role;
  onRoleChange: (role: Role) => void;
}

export function RoleSelector({ activeRole, onRoleChange }: RoleSelectorProps) {
  const activeConfig = ROLES.find((r) => r.id === activeRole);

  return (
    <div className="space-y-3">
      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
        I work as a...
      </p>

      {/* Pill buttons row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-x-visible">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "text-white shadow-lg"
                  : "bg-white text-navy/70 hover:bg-cream-dark hover:text-navy shadow-sm"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="role-pill-bg"
                  className="absolute inset-0 rounded-full bg-charcoal"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`relative h-4 w-4 ${isActive ? "text-teal" : ""}`}
              />
              <span className="relative">{role.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description line */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeRole}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-navy/60"
        >
          {activeConfig?.description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
