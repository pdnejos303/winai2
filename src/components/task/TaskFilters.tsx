/* Path: src/components/task/TaskFilters.tsx
   ---------------------------------------------------------------------------
   ✔ ทำให้ dropdown มี "all" เสมอ (ส่งมาจาก TaskGrid แล้ว)
   ------------------------------------------------------------------------- */
"use client";

import type { Dispatch, SetStateAction } from "react";
import clsx from "clsx";

/* kind of state */
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

export default function TaskFilters({ value, onChange, categories }: Props) {
  const update = <K extends keyof TaskFiltersState>(
    key: K,
    v: TaskFiltersState[K],
  ) => onChange((p) => ({ ...p, [key]: v }));

  return (
    <div className="flex flex-wrap gap-4 pb-6">
      {/* status */}
      {(["all", "incompleted", "completed"] as const).map((k) => (
        <button
          key={k}
          onClick={() => update("status", k)}
          className={clsx(
            "px-3 py-1 rounded-md text-sm border font-medium transition",
            value.status === k
              ? "bg-brand-green text-white border-brand-green"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
          )}
        >
          {k.toUpperCase()}
        </button>
      ))}

      {/* urgency */}
      {(["all", "high", "medium", "low"] as const).map((k) => (
        <button
          key={k}
          onClick={() => update("urgency", k)}
          className={clsx(
            "px-3 py-1 rounded-md text-sm border font-medium transition",
            value.urgency === k
              ? "bg-brand-green text-white border-brand-green"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
          )}
        >
          {k === "all" ? "ALL" : k[0].toUpperCase() + k.slice(1)}
        </button>
      ))}

      {/* category */}
      <select
        value={value.category}
        onChange={(e) => update("category", e.target.value)}
        className="rounded-md border bg-white px-3 py-1 text-sm text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-brand-green"
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c === "all" ? "All categories" : c}
          </option>
        ))}
      </select>
    </div>
  );
}
