"use client";

import { useState } from "react";
import { Calculator, Search } from "lucide-react";
import { MaterialSearch } from "./MaterialSearch";
import { SpecificationCalculator } from "./SpecificationCalculator";

export function MaterialsPageContent() {
  const [activeTab, setActiveTab] = useState<"spec" | "browse">("spec");

  return (
    <>
      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-5">
        <div className="flex gap-1 rounded-xl bg-charcoal/80 p-1 max-w-md">
          <button
            onClick={() => setActiveTab("spec")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "spec"
                ? "bg-white text-navy shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Calculator className="h-4 w-4" />
            Specification Tool
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "browse"
                ? "bg-white text-navy shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Search className="h-4 w-4" />
            Browse Database
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`mx-auto px-4 py-8 sm:px-6 lg:px-8 ${activeTab === "spec" ? "max-w-6xl" : "max-w-4xl"}`}>
        {activeTab === "spec" ? <SpecificationCalculator /> : <MaterialSearch />}
      </div>
    </>
  );
}
