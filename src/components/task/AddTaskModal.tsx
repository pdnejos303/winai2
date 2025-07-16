// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/AddTaskModal.tsx
// DESC: Modal สร้าง Task – ปุ่ม Priority & Grid Category (มี Icon)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Category, Task } from "@prisma/client";
import * as LucideIcons from "lucide-react";
import {
  Flag,
  type LucideIcon,
  Package, // fallback
} from "lucide-react";

/* ---------- ชนิด Task รวม relation ---------- */
export type TaskWithCat = Task & { category: Category | null };

/* ---------- props ---------- */
interface Props {
  open: boolean;
  setOpen: (b: boolean) => void;
  categories: Category[];
  onCreated: (t: TaskWithCat) => void;
}

/* ---------- style map ---------- */
const urgencyUI = {
  1: {
    label: "Low",
    ring: "ring-emerald-400",
    active: "bg-emerald-500 text-white",
    inactive: "border-emerald-300 text-emerald-600 hover:bg-emerald-50",
  },
  2: {
    label: "Medium",
    ring: "ring-amber-400",
    active: "bg-amber-400 text-white",
    inactive: "border-amber-300 text-amber-700 hover:bg-amber-50",
  },
  3: {
    label: "High",
    ring: "ring-rose-500",
    active: "bg-rose-500 text-white",
    inactive: "border-rose-300 text-rose-700 hover:bg-rose-50",
  },
} as const;

export default function AddTaskModal({
  open,
  setOpen,
  categories,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState<0 | 1 | 2 | 3>(0); // 0=none
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  /* ----------- handlers ----------- */
  if (!open) return null;

  async function handleSave() {
    if (!title || !dueDate)
      return alert("Fill required fields");
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "",
          dueDate: new Date(dueDate).toISOString(),
          urgency,
          categoryId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onCreated(await res.json());

      // reset & close
      setTitle("");
      setDueDate("");
      setUrgency(0);
      setCategoryId(null);
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Create failed");
    } finally {
      setSaving(false);
    }
  }

  /* ----------- helpers ----------- */
  const DynamicIcons = LucideIcons as unknown as Record<string, LucideIcon>;

  /* ----------- UI ----------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">New task</h2>

        {/* title */}
        <input
          className="mb-3 w-full rounded border px-3 py-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* due date */}
        <label className="mb-1 block text-sm">Due date</label>
        <input
          type="datetime-local"
          className="mb-3 w-full rounded border px-3 py-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Urgency buttons */}
        <label className="mb-2 flex items-center gap-2 text-sm">
          <Flag className="h-4 w-4 text-green-600" />
          Priority
        </label>
        <div className="mb-4 flex gap-4">
          {(Object.keys(urgencyUI) as Array<"1" | "2" | "3">).map((k) => {
            const lv = Number(k) as 1 | 2 | 3;
            const active = urgency === lv;
            return (
              <button
                type="button"
                key={lv}
                onClick={() => setUrgency(active ? 0 : lv)}
                className={`
                  w-24 rounded-full border px-4 py-2 text-sm transition
                  ${active ? urgencyUI[lv].active : urgencyUI[lv].inactive}
                  ${!active && "border"} ${active && urgencyUI[lv].ring}
                `}
              >
                {urgencyUI[lv].label}
              </button>
            );
          })}
        </div>

        {/* Category grid */}
        <label className="mb-2 block text-sm">Category</label>
        <div className="mb-4 grid grid-cols-4 gap-3">
          {/* none */}
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            className={`flex h-10 w-full flex-col items-center justify-center rounded border text-xs ${
              categoryId === null
                ? "border-sky-500 bg-sky-50"
                : "border-transparent hover:bg-gray-50"
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
                onClick={() => setCategoryId(active ? null : c.id)}
                className={`flex h-10 w-full flex-col items-center justify-center rounded border text-xs ${
                  active
                    ? "border-sky-500 bg-sky-50"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setOpen(false)}
            className="rounded px-3 py-1 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            onClick={handleSave}
            className="rounded bg-brand-green px-4 py-1 text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
