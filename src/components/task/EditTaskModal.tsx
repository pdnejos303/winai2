// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/EditTaskModal.tsx
// DESC: Modal แก้ไข Task  (PATCH /api/tasks/:id)
// FIX : fmtInput รองรับ Date | string  → ไม่มี TS2345
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { Task } from "@prisma/client";

/* ---------- helper ---------- */
// CHANGE: now accepts Date | string
const fmtInput = (d: Date | string) => new Date(d).toISOString().slice(0, 16);

interface Props {
  task: Task;
  setOpen: (b: boolean) => void;
  onUpdated: (t: Task) => void;
}

export default function EditTaskModal({ task, setOpen, onUpdated }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(fmtInput(task.dueDate));   // ✅ ok
  const [urgency, setUrgency] = useState(
    task.urgency as "low" | "medium" | "high",
  );
  const [category, setCategory] = useState(task.category ?? "General");
  const [saving, setSaving] = useState(false);

  /* ---------- save ---------- */
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate: new Date(dueDate).toISOString(),
          urgency,
          category,
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
          onChange={(e) =>
            setUrgency(e.target.value as "low" | "medium" | "high")
          }
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          className="mb-4 w-full rounded border px-3 py-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

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
