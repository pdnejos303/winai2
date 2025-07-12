// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/EditTaskModal.tsx
// DESC: Modal แก้ไข Task — urgency เป็น number (0=none 1=low 2=med 3=high)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { Task } from "@prisma/client";

/* helper: แปลง Date เป็นค่า input[type=datetime-local] */
const fmtInput = (d: Date | string) => new Date(d).toISOString().slice(0, 16);

/* enum urgency ในฝั่ง UI */
type Urgency = 0 | 1 | 2 | 3;
const label: Record<Urgency, string> = { 0: "None", 1: "Low", 2: "Medium", 3: "High" };

interface Props {
  task: Task;
  setOpen: (b: boolean) => void;
  onUpdated: (t: Task) => void;
}

export default function EditTaskModal({ task, setOpen, onUpdated }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(fmtInput(task.dueDate));
  const [urgency, setUrgency] = useState<Urgency>(task.urgency as Urgency); // ⭐️ number
  const [category, setCategory] = useState(task.category ?? "General");
  const [saving, setSaving] = useState(false);

  /* save (PATCH) */
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
          urgency,                 // → number
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

  /* UI */
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
