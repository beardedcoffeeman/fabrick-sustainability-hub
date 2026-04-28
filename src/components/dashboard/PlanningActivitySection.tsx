"use client";

import { useState } from "react";
import {
  PlanningActivityWidget,
  PlanningCategoryTabs,
  type PlanningCategory,
} from "./PlanningActivityWidget";

export function PlanningActivitySection() {
  const [category, setCategory] = useState<PlanningCategory>("commercial");

  return (
    <div className="space-y-5">
      <PlanningCategoryTabs value={category} onChange={setCategory} />
      <PlanningActivityWidget category={category} />
    </div>
  );
}
