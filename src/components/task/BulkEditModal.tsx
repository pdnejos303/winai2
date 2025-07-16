// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/BulkEditModal.tsx
// DESC: Modal แก้ dueDate / urgency / category (Priority button มีสีทุกระดับ)
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Task, Category } from "@prisma/client";
import * as LucideIcons from "lucide-react";
import {
  type LucideIcon,
  Flag,
  Package,
} from "lucide-react";

interface Props {
  ids: number[];
  setOpen: (b: boolean) => void;
  onUpdated: (t: Task) => void;
  clearSelection: () => void;
  categories: Category[];
}

type Body = Partial<{
  dueDate: string;
  urgency: "low" | "medium" | "high";
  categoryId: number | null;
}>;

/* ---------- style map ---------- */
const urgencyUI = {
  low: {
    label: "Low",
    ring: "ring-emerald-400",
    active: "bg-emerald-500 text-white",
    inactive: "border-emerald-300 text-emerald-600 hover:bg-emerald-50",
  },
  medium: {
    label: "Medium",
    ring: "ring-amber-400",
    active: "bg-amber-400 text-white",
    inactive: "border-amber-300 text-amber-700 hover:bg-amber-50",
  },
  high: {
    label: "High",
    ring: "ring-rose-500",
    active: "bg-rose-500 text-white",
    inactive: "border-rose-300 text-rose-700 hover:bg-rose-50",
  },
} as const;

export default function BulkEditModal({
  ids,
  setOpen,
  onUpdated,
  clearSelection,
  categories,
}: Props) {
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState<"" | "low" | "medium" | "high">("");
  const [categoryId, setCategoryId] = useState<number | null | "">("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!dueDate && !urgency && categoryId === "") {
      alert("เลือกฟิลด์อย่างน้อย 1 อย่าง");
      return;
    }
    setSaving(true);
    try {
      await Promise.all(
        ids.map(async (id) => {
          const body: Body = {};
          if (dueDate) body.dueDate = new Date(dueDate).toISOString();
          if (urgency) body.urgency = urgency;
          if (categoryId !== "") body.categoryId = categoryId || null;

          const res = await fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (res.ok) onUpdated(await res.json());
        }),
      );
      closeModal();
    } catch (e) {
      console.error(e);
      alert("Bulk edit failed");
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    setOpen(false);
    clearSelection();
  }

  const DynamicIcons = LucideIcons as unknown as Record<string, LucideIcon>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">
          Bulk edit ({ids.length} tasks)
        </h2>

        {/* Due date */}
        <label className="mb-1 block text-sm">New due date</label>
        <input
          type="datetime-local"
          className="mb-3 w-full rounded border px-3 py-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Priority buttons */}
        <label className="mb-2 flex items-center gap-2 text-sm">
          <Flag className="h-4 w-4 text-green-600" />
          Priority
        </label>
        <div className="mb-4 flex gap-4">
          {(Object.keys(urgencyUI) as Array<"low" | "medium" | "high">).map(
            (lv) => {
              const active = urgency === lv;
              return (
                <button
                  type="button"
                  key={lv}
                  onClick={() => setUrgency(active ? "" : lv)}
                  className={`
                    w-24 rounded-full border px-4 py-2 text-sm transition
                    ${active ? urgencyUI[lv].active : urgencyUI[lv].inactive}
                    ${!active && "border"} ${active && urgencyUI[lv].ring}
                  `}
                >
                  {urgencyUI[lv].label}
                </button>
              );
            },
          )}
        </div>

        {/* Category picker */}
        <label className="mb-2 block text-sm">Category</label>
        <div className="mb-4 grid grid-cols-4 gap-3">
          {/* keep */}
          <button
            type="button"
            onClick={() => setCategoryId("")}
            className={`flex h-10 w-full flex-col items-center justify-center rounded border text-xs ${
              categoryId === "" ? "border-sky-500 bg-sky-50" : "border-transparent"
            }`}
          >
            keep
          </button>
          {/* none */}
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            className={`flex h-10 w-full flex-col items-center justify-center rounded border text-xs ${
              categoryId === null ? "border-sky-500 bg-sky-50" : "border-transparent"
            }`}
          >
            none
          </button>

          {categories.map((c) => {
            const Icon = DynamicIcons[c.icon] ?? Package;
            const active = categoryId === c.id;
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategoryId(active ? "" : c.id)}
                className={`flex h-10 w-full flex-col items-center justify-center rounded border text-xs ${
                  active ? "border-sky-500 bg-sky-50" : "border-transparent hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* actions */}
        <div className="flex justify-end gap-3">
          <button
            disabled={saving}
            onClick={closeModal}
            className="rounded px-3 py-1 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="rounded bg-emerald-600 px-4 py-1 text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
