/* ───────────────────────────────────────────────────────────────
   TaskFilter.tsx
   ----------------------------------------------------------------
   ● กรอง 3 เงื่อนไข   keyword  ·  categoryId  ·  urgency
   ● ส่งผลผ่าน onChange(FilterState)
   ● ใช้ Tailwind ล้วน  (รีโปไม่ได้ติดตั้ง shadcn/ui)
   ────────────────────────────────────────────────────────────── */
"use client";

import { Category } from "@prisma/client";
import { useState } from "react";

export interface FilterState {
  search: string;
  categoryId: number | "all";
  urgency: "all" | "low" | "medium" | "high";
}

export default function TaskFilter({
  categories,
  onChange,
}: {
  categories: Category[];
  onChange: (f: FilterState) => void;
}) {
  const [state, setState] = useState<FilterState>({
    search: "",
    categoryId: "all",
    urgency: "all",
  });

  function update<K extends keyof FilterState>(k: K, v: FilterState[K]) {
    const next = { ...state, [k]: v };
    setState(next);
    onChange(next);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-4">
      {/* ── keyword ── */}
      <input
        className="w-48 flex-grow rounded border px-2 py-1"
        placeholder="ค้นหา..."
        value={state.search}
        onChange={(e) => update("search", e.target.value)}
      />

      {/* ── category ── */}
      <select
        className="rounded border px-2 py-1"
        value={state.categoryId}
        onChange={(e) =>
          update(
            "categoryId",
            e.target.value === "all" ? "all" : Number(e.target.value),
          )
        }
      >
        <option value="all">ทุกหมวด</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* ── urgency ── */}
      <select
        className="rounded border px-2 py-1"
        value={state.urgency}
        onChange={(e) =>
          update("urgency", e.target.value as FilterState["urgency"])
        }
      >
        <option value="all">ทุกความเร่งด่วน</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
