// Path: src/components/task/TaskFilters.tsx
"use client";

import type { Dispatch, SetStateAction } from "react";
import clsx from "clsx";

/* -------------------------------------------------------------------------- */
/*  ชนิดของ state ตัวกรอง                                                     */
/* -------------------------------------------------------------------------- */
export type TaskFiltersState = {
  status: "all" | "completed" | "incompleted";
  urgency: "all" | "high" | "medium" | "low";
  category: string;
};

type Props = {
  value: TaskFiltersState;
  onChange: Dispatch<SetStateAction<TaskFiltersState>>;
  categories: string[];
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function TaskFilters({ value, onChange, categories }: Props) {
  const update = <K extends keyof TaskFiltersState>(
    key: K,
    v: TaskFiltersState[K]
  ) => onChange((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="flex flex-wrap gap-4 pb-6">
      {/* ---------------- Status ---------------- */}
      {(["incompleted", "completed", "all"] as const).map((k) => (
        <button
          key={k}
          onClick={() => update("status", k)}
          className={clsx(
            "px-3 py-1 rounded-md text-sm border font-medium transition",
            value.status === k
              ? "bg-brand-green text-white border-brand-green"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          )}
        >
          {k.toUpperCase()}
        </button>
      ))}

      {/* ---------------- Urgency ---------------- */}
      {(["all", "high", "medium", "low"] as const).map((k) => (
        <button
          key={k}
          onClick={() => update("urgency", k)}
          className={clsx(
            "px-3 py-1 rounded-md text-sm border font-medium transition",
            value.urgency === k
              ? "bg-brand-green text-white border-brand-green"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          )}
        >
          {k === "all" ? "ALL" : k[0].toUpperCase() + k.slice(1)}
        </button>
      ))}

      {/* ---------------- Category ---------------- */}
      <select
        value={value.category}
        onChange={(e) => update("category", e.target.value)}
        className="px-3 py-1 rounded-md border text-sm bg-white text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-brand-green"
      >
        <option value="all">All categories</option>
        {categories.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
