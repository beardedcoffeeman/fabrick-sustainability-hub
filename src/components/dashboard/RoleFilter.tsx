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
          Filter by role
        </span>
        <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-navy">
          Show me what matters for my role.
        </h3>
        <p className="mt-3 text-sm text-warm-gray">
          Pick how you work below. We&rsquo;ll surface the three dashboards
          we&rsquo;d recommend you start with.
        </p>
      </div>

      <div className="mb-8">
        <RoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />
      </div>

      {activeRole === "all" ? (
        <div className="rounded-2xl border-2 border-dashed border-charcoal/15 bg-white/40 p-8 md:p-10 text-center max-w-2xl mx-auto">
          <p className="text-sm text-warm-gray">
            Tap a role above to see the three dashboards we&rsquo;d recommend
            first.
          </p>
        </div>
      ) : (
        <RecommendedDashboards activeRole={activeRole} />
      )}
    </div>
  );
}
