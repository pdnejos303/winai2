// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/BulkEditModal.tsx
// DESC: Modal แก้ dueDate / urgency / category พร้อมกันหลาย Task
// ╰─ ESLint fixed:   • setOpen ใช้แล้ว  • ไม่มี any                      •
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { Task } from "@prisma/client";

interface Props {
  ids: number[];
  setOpen: (b: boolean) => void;       // 🟢 ใช้งานแล้ว
  onUpdated: (t: Task) => void;
  clearSelection: () => void;          // rename from onDone
}

type Body = Partial<{
  dueDate: string;
  urgency: "low" | "medium" | "high";
  category: string;
}>;

export default function BulkEditModal({
  ids,
  setOpen,
  onUpdated,
  clearSelection,
}: Props) {
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState<"" | "low" | "medium" | "high">("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!dueDate && !urgency && !category) {
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
          if (category) body.category = category;

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
    setOpen(false);       // 🟢 setOpen used
    clearSelection();
  }

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

        {/* Urgency */}
        <label className="mb-1 block text-sm">Urgency</label>
        <select
          value={urgency}
          onChange={(e) =>
            setUrgency(e.target.value as "" | "low" | "medium" | "high")
          }
          className="mb-3 w-full rounded border px-3 py-2"
        >
          <option value="">— keep —</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Category */}
        <label className="mb-1 block text-sm">Category</label>
        <input
          className="mb-4 w-full rounded border px-3 py-2"
          placeholder="(keep)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

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
