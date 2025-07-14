// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskFilters.tsx
// DESC: แถบกรอง Task  (urgency + category)  เวอร์ชันใหม่ใช้ categoryId
// API:
//   • categories: List<Category>   → เอาไว้ render dropdown
//   • onChange  : (FilterState)=>void  → ส่ง state ออกไปให้ parent
// NOTE:
//   • ตัว component เป็น “un-controlled” (ถือ state เอง) แล้วค่อยส่ง
//   • ไม่มี prop value / status อีกต่อไป (status อยู่ใน TaskBoard เท่านั้น)
// ─────────────────────────────────────────────────────────────
"use client";

import clsx from "clsx";
import { useState } from "react";
import type { Category } from "@prisma/client";

/* ---------- ประเภท state ที่ export ไว้ให้ Component อื่นใช้ ---------- */
export type FilterState = {
  urgency: 0 | 1 | 2 | 3 | "all";
  categoryId: number | "all";
};

/* ---------- props ---------- */
interface Props {
  categories: Category[];                // dropdown list
  onChange: (f: FilterState) => void;    // callback
}

/* ---------- UI component ---------- */
export default function TaskFilter({ categories, onChange }: Props) {
  /* default state */
  const [state, setState] = useState<FilterState>({
    urgency: "all",
    categoryId: "all",
  });

  /* helper เมื่อ state เปลี่ยน */
  function update<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    const next = { ...state, [key]: val };
    setState(next);
    onChange(next);
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* urgency select */}
      <div>
        <label className="block text-sm">Urgency</label>
        <select
          value={state.urgency}
          onChange={(e) =>
            update(
              "urgency",
              e.target.value === "all" ? "all" : (Number(e.target.value) as 0 | 1 | 2 | 3),
            )
          }
          className="rounded border px-3 py-1"
        >
          <option value="all">All</option>
          <option value={0}>None</option>
          <option value={1}>Low</option>
          <option value={2}>Medium</option>
          <option value={3}>High</option>
        </select>
      </div>

      {/* category select */}
      <div>
        <label className="block text-sm">Category</label>
        <select
          value={state.categoryId}
          onChange={(e) =>
            update(
              "categoryId",
              e.target.value === "all" ? "all" : Number(e.target.value),
            )
          }
          className="rounded border px-3 py-1"
        >
          <option value="all">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className={clsx("pl-4")}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
