"use client";

import { useState } from "react";
import { Calendar, AlertTriangle, CheckCircle2, Clock, FileText, Filter } from "lucide-react";
import { regulations, type RegulationEvent } from "@/lib/carbon-data";

const statusConfig = {
  active: { icon: CheckCircle2, label: "Active", color: "bg-green-100 text-green-700 border-green-200" },
  upcoming: { icon: Clock, label: "Upcoming", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  consultation: { icon: FileText, label: "Consultation", color: "bg-blue-100 text-blue-700 border-blue-200" },
  future: { icon: AlertTriangle, label: "Future", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

const categoryConfig = {
  carbon: { label: "Carbon", color: "bg-teal/10 text-teal" },
  energy: { label: "Energy", color: "bg-pink/10 text-pink" },
  reporting: { label: "Reporting", color: "bg-purple-100 text-purple-700" },
  trade: { label: "Trade", color: "bg-amber-100 text-amber-700" },
};

const roles = [
  { id: "all", label: "All Roles" },
  { id: "developer", label: "Developer" },
  { id: "architect", label: "Architect" },
  { id: "manufacturer", label: "Manufacturer" },
  { id: "contractor", label: "Contractor" },
];

export function RegulationTimeline() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = regulations.filter((reg) => {
    if (roleFilter !== "all" && !reg.affectedRoles.includes(roleFilter)) return false;
    if (categoryFilter !== "all" && reg.category !== categoryFilter) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, RegulationEvent[]>>((acc, reg) => {
    const year = new Date(reg.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(reg);
    return acc;
  }, {});

  const now = new Date();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-warm-gray" />
          <span className="text-sm font-semibold text-navy">Filter by</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div>
            <p className="text-xs text-warm-gray mb-2">I&apos;m a...</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setRoleFilter(role.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    roleFilter === role.id
                      ? "bg-navy text-white"
                      : "bg-cream text-navy hover:bg-cream-dark"
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-warm-gray mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  categoryFilter === "all"
                    ? "bg-navy text-white"
                    : "bg-cream text-navy hover:bg-cream-dark"
                }`}
              >
                All
              </button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    categoryFilter === key
                      ? "bg-navy text-white"
                      : `${config.color}`
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(grouped)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([year, regs]) => (
            <div key={year}>
              <div className="sticky top-16 z-10 mb-4">
                <span className="inline-block rounded-full bg-navy px-4 py-1.5 font-[family-name:var(--font-playfair)] text-lg font-bold text-white shadow-lg">
                  {year}
                </span>
              </div>
              <div className="ml-4 space-y-4 border-l-2 border-cream-dark pl-6">
                {regs
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((reg) => {
                    const statusCfg = statusConfig[reg.status];
                    const catCfg = categoryConfig[reg.category];
                    const StatusIcon = statusCfg.icon;
                    const regDate = new Date(reg.date);
                    const isPast = regDate < now;
                    const daysUntil = Math.ceil(
                      (regDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={reg.id}
                        className={`relative rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                          isPast ? "opacity-80" : ""
                        }`}
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-9 top-6 h-4 w-4 rounded-full border-2 ${
                            reg.status === "active"
                              ? "border-green-400 bg-green-400"
                              : reg.status === "upcoming"
                              ? "border-yellow-400 bg-yellow-400"
                              : reg.status === "consultation"
                              ? "border-blue-400 bg-blue-400"
                              : "border-orange-400 bg-orange-400"
                          }`}
                        />

                        <div className="flex flex-wrap items-start gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusCfg.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusCfg.label}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${catCfg.color}`}
                          >
                            {catCfg.label}
                          </span>
                          {!isPast && daysUntil <= 180 && (
                            <span className="rounded-full bg-pink/10 px-2 py-0.5 text-[10px] font-bold text-pink">
                              {daysUntil} days
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-navy">{reg.title}</h3>

                        <div className="mt-1 flex items-center gap-1 text-xs text-warm-gray">
                          <Calendar className="h-3 w-3" />
                          {regDate.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>

                        <p className="mt-2 text-sm text-navy/80">{reg.description}</p>

                        <div className="mt-3 rounded-lg bg-cream p-3">
                          <p className="text-xs font-semibold text-navy">Impact:</p>
                          <p className="text-xs text-navy/80 mt-0.5">{reg.impact}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {reg.affectedRoles.map((role) => (
                            <span
                              key={role}
                              className="rounded-full bg-cream-dark px-2 py-0.5 text-[10px] font-medium capitalize text-navy"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
