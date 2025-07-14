// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/EditTaskModal.tsx
// DESC: Modal แก้ไข Task — ใช้ categoryId (FK) แทน category string
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Task, Category } from "@prisma/client";

/* helper: datetime-local format */
const fmtInput = (d: Date | string) => new Date(d).toISOString().slice(0, 16);

/* enum urgency ในฝั่ง UI */
type Urgency = 0 | 1 | 2 | 3;
const label: Record<Urgency, string> = {
  0: "None",
  1: "Low",
  2: "Medium",
  3: "High",
};

/* ---------- props ---------- */
type TaskWithCat = Task & { category: Category | null };

interface Props {
  task: TaskWithCat;
  categories: Category[];              // 💡 ส่ง array จาก TaskBoard/TaskGrid
  setOpen: (b: boolean) => void;
  onUpdated: (t: TaskWithCat) => void;
}

export default function EditTaskModal({
  task,
  categories,
  setOpen,
  onUpdated,
}: Props) {
  /* ---------- state ---------- */
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(fmtInput(task.dueDate));
  const [urgency, setUrgency] = useState<Urgency>(task.urgency as Urgency);
  const [categoryId, setCategoryId] = useState<number | "none">(
    task.categoryId ?? "none",
  );
  const [saving, setSaving] = useState(false);

  /* ---------- save ---------- */
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          urgency,
          categoryId: categoryId === "none" ? null : categoryId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onUpdated(await res.json());
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Edit task</h2>

        <input
          className="mb-3 w-full rounded border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="mb-3 h-24 w-full resize-none rounded border px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="mb-1 block text-sm">Due date</label>
        <input
          type="datetime-local"
          className="mb-3 w-full rounded border px-3 py-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <label className="mb-1 block text-sm">Urgency</label>
        <select
          className="mb-3 w-full rounded border px-3 py-2"
          value={urgency}
          onChange={(e) => setUrgency(+e.target.value as Urgency)}
        >
          {([0, 1, 2, 3] as const).map((v) => (
            <option key={v} value={v}>
              {label[v]}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm">Category</label>
        <select
          className="mb-4 w-full rounded border px-3 py-2"
          value={categoryId ?? "none"}
          onChange={(e) =>
            setCategoryId(e.target.value === "none" ? "none" : +e.target.value)
          }
        >
          <option value="none">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

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
            className="rounded bg-emerald-600 px-4 py-1 text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
