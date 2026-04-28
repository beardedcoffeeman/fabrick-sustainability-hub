"use client";

import { useState } from "react";
import { RoleSelector, type Role } from "@/components/home/RoleSelector";
import { RecommendedDashboards } from "@/components/home/RecommendedDashboards";

export function RoleFilter() {
  const [activeRole, setActiveRole] = useState<Role>("all");

  return (
    <div>
      <div className="text-center mb-8 max-w-xl mx-auto">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
          Show me what matters
        </span>
        <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-navy">
          Pick the role that fits how you work.
        </h3>
        <p className="mt-3 text-sm text-warm-gray">
          Default view shows everything. Pick a role and we&rsquo;ll surface
          the three dashboards we&rsquo;d recommend you start with.
        </p>
      </div>

      <div className="mb-8">
        <RoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />
      </div>

      <RecommendedDashboards activeRole={activeRole} />
    </div>
  );
}
