// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/AddTaskModal.tsx
// DESC: Modal สร้าง Task – ใช้ categoryId (dropdown)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Category, Task } from "@prisma/client";

/* ---------- ชนิด Task รวม relation ---------- */
export type TaskWithCat = Task & { category: Category | null };

/* ---------- props ---------- */
interface Props {
  open: boolean;
  setOpen: (b: boolean) => void;
  categories: Category[];            // ← รับรายการหมวด
  onCreated: (t: TaskWithCat) => void;
}

export default function AddTaskModal({
  open,
  setOpen,
  categories,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState<0 | 1 | 2 | 3>(0);
  const [categoryId, setCategoryId] = useState<number | "none">("none");
  const [saving, setSaving] = useState(false);

  /* ----------- handlers ----------- */
  if (!open) return null;

  async function handleSave() {
    if (!title || !dueDate) return alert("Fill required fields");
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
          /* ส่ง FK (nullable) */
          categoryId: categoryId === "none" ? null : categoryId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      onCreated(await res.json());

      // reset state & close
      setTitle("");
      setDueDate("");
      setUrgency(0);
      setCategoryId("none");
      setOpen(false);
    } catch (e) {
      console.error(e);
      alert("Create failed");
    } finally {
      setSaving(false);
    }
  }

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

        {/* urgency */}
        <label className="mb-1 block text-sm">Urgency</label>
        <select
          className="mb-3 w-full rounded border px-3 py-2"
          value={urgency}
          onChange={(e) => setUrgency(+e.target.value as 0 | 1 | 2 | 3)}
        >
          <option value={0}>None</option>
          <option value={1}>Low</option>
          <option value={2}>Medium</option>
          <option value={3}>High</option>
        </select>

        {/* category */}
        <label className="mb-1 block text-sm">Category</label>
        <select
          className="mb-4 w-full rounded border px-3 py-2"
          value={categoryId}
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
