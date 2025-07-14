// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskFilters.tsx
// DESC: Toggle-group filter (Status • Urgency • Category)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";

/* ---------- exported state ---------- */
export type TaskFiltersState = {
  status: "incompleted" | "completed" | "all";
  urgency: "all" | 0 | 1 | 2 | 3;      // 0-None, 1-High, 2-Medium, 3-Low
  categoryId: "all" | number;
};

type Props = {
  categories: Category[];
  onChange: (f: TaskFiltersState) => void;
};

export default function TaskFilters({ categories, onChange }: Props) {
  /* ---------------- state ---------------- */
  const [filters, setFilters] = useState<TaskFiltersState>({
    status: "incompleted",
    urgency: "all",
    categoryId: "all",
  });

  const update = <K extends keyof TaskFiltersState>(
    key: K,
    value: TaskFiltersState[K]
  ) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onChange(next);
  };

  /* ---------- reusable button ---------- */
  const btn =
    (active: boolean) =>
      `px-5 py-2 first:rounded-l-lg last:rounded-r-lg border
       ${active ? "bg-green-700 text-white" : "bg-white text-green-700"}
       border-green-700 hover:bg-green-600/10 transition`;

  /* ---------- urgency options ---------- */
  const urgencies = [0, 1, 2, 3] as const; // literal array => u: 0|1|2|3

  const urgencyLabel = (u: 0 | 1 | 2 | 3) =>
    u === 0 ? "None" : u === 1 ? "Low" : u === 2 ? "Medium" : "High";

  return (
    <div className="flex flex-wrap gap-6">
      {/* ── Status ─────────────────────── */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Status</span>
        <div className="inline-flex">
          {(["incompleted", "completed", "all"] as const).map((s) => (
            <button
              key={s}
              className={btn(filters.status === s)}
              onClick={() => update("status", s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Urgency ────────────────────── */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Urgency</span>
        <div className="inline-flex">
          <button
            className={btn(filters.urgency === "all")}
            onClick={() => update("urgency", "all")}
          >
            ALL
          </button>
          {urgencies.map((u) => (
            <button
              key={u}
              className={btn(filters.urgency === u)}
              onClick={() => update("urgency", u)}
            >
              {urgencyLabel(u)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Category ───────────────────── */}
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500">Category</span>
        <select
          value={filters.categoryId}
          onChange={(e) =>
            update(
              "categoryId",
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as number)
            )
          }
          className="h-10 rounded-lg border border-green-700 bg-green-50 px-4"
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
