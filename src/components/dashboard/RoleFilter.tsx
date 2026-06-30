"use client";

import { RoleSelector, type Role } from "@/components/home/RoleSelector";
import { RecommendedDashboards } from "@/components/home/RecommendedDashboards";
import { usePulsePrefs } from "@/lib/usePulsePrefs";
import { track } from "@/lib/analytics";

export function RoleFilter() {
  const { prefs, toggleFavourite, isFavourite, setRole } = usePulsePrefs();

  // Saved role drives the view. useSyncExternalStore renders the "all" default
  // on the server / first client paint, then syncs to the stored role, so this
  // is hydration-safe.
  const activeRole = prefs.role as Role;

  function handleRoleChange(role: Role) {
    setRole(role);
    track("dashboard_role_selected", { role });
  }

  function handleToggleFavourite(id: string) {
    const nowFavourite = toggleFavourite(id);
    track("dashboard_favourite_toggled", { dashboard: id, favourite: nowFavourite });
  }

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
          Pick a role and pin the dashboards you use most. We will remember your
          set-up on this device, so it is ready the next time you visit.
        </p>
      </div>

      <div className="mb-8">
        <RoleSelector activeRole={activeRole} onRoleChange={handleRoleChange} />
      </div>

      <RecommendedDashboards
        activeRole={activeRole}
        isFavourite={isFavourite}
        onToggleFavourite={handleToggleFavourite}
      />
    </div>
  );
}
