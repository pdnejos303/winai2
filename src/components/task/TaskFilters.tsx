// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskFilters.tsx
// DESC: แถบกรอง Task (urgency + categoryId)  – เวอร์ชัน model ใหม่
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";

/* ---------- state ที่ส่งออกไปให้ parent ---------- */
export type FilterState = {
  status?: "all" | "completed" | "incompleted"; // optional – TaskBoard ใช้เพิ่มเอง
  urgency: 0 | 1 | 2 | 3 | "all";
  categoryId: number | "all";
};

interface Props {
  categories: Category[];            // ต้องเป็น Category[] แล้ว
  onChange: (f: FilterState) => void;
}

export default function TaskFilter({ categories, onChange }: Props) {
  const [state, setState] = useState<FilterState>({
    urgency: "all",
    categoryId: "all",
  });

  function set<K extends keyof FilterState>(k: K, v: FilterState[K]) {
    const next = { ...state, [k]: v };
    setState(next);
    onChange(next);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* urgency */}
      <div>
        <label className="block text-sm">Urgency</label>
        <select
          className="rounded border px-3 py-1"
          value={state.urgency}
          onChange={(e) =>
            set(
              "urgency",
              e.target.value === "all"
                ? "all"
                : (Number(e.target.value) as 0 | 1 | 2 | 3),
            )
          }
        >
          <option value="all">All</option>
          <option value={0}>None</option>
          <option value={1}>Low</option>
          <option value={2}>Medium</option>
          <option value={3}>High</option>
        </select>
      </div>

      {/* categoryId */}
      <div>
        <label className="block text-sm">Category</label>
        <select
          className="rounded border px-3 py-1"
          value={state.categoryId}
          onChange={(e) =>
            set(
              "categoryId",
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
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
