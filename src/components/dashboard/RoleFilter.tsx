"use client";

import { useState } from "react";
import { RoleSelector, type Role } from "@/components/home/RoleSelector";
import { RecommendedDashboards } from "@/components/home/RecommendedDashboards";

export function RoleFilter() {
  const [activeRole, setActiveRole] = useState<Role>("all");

  return (
    <div>
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink">
          Tailor the data to your role
        </span>
        <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-navy">
          What do you want to know about UK construction?
        </h3>
        <p className="mt-3 text-sm text-warm-gray">
          Default view shows every dashboard. Pick a role and we will
          surface the three most useful for you.
        </p>
      </div>

      <div className="mb-8">
        <RoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />
      </div>

      <RecommendedDashboards activeRole={activeRole} />
    </div>
  );
}
