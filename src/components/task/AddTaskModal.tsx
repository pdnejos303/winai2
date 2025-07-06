// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/AddTaskModal.tsx
// DESC: Modal สร้าง Task – เติมค่า default ให้ครบ (พรุ่งนี้ 09:00)
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { addDays, set } from "date-fns";          // ใช้คำนวณวันพรุ่งนี้
import { useState } from "react";
import { Task } from "@prisma/client";

interface Props {
  open?: boolean;                 // ถ้าไม่ส่ง => เปิดทันที
  setOpen?: (b: boolean) => void; // ฟังก์ชันปิด (optional)
  onCreated: (task: Task) => void;
}

/* ---------- helper: yyyy-MM-ddTHH:mm ---------- */
function formatLocalInput(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default function AddTaskModal({
  open = true,
  setOpen,
  onCreated,
}: Props) {
  /* ---------- default tomorrow 09:00 ---------- */
  const tomorrowAtNine = set(addDays(new Date(), 1), {
    hours: 9,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  /* ---------- local state ---------- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(formatLocalInput(tomorrowAtNine)); // ★
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [category, setCategory] = useState("General");
  const [saving, setSaving] = useState(false);

  /* ---------- save ---------- */
  async function handleSave() {
    if (!title.trim()) {
      alert("กรุณาใส่ Title");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        urgency,
        category,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      const task: Task = await res.json();
      onCreated(task);

      /* reset form เป็น default ชุดใหม่ */
      setTitle("");
      setDescription("");
      setDueDate(formatLocalInput(tomorrowAtNine));
      setUrgency("medium");
      setCategory("General");
      setOpen?.(false);
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (open === false) return null;

  /* ---------- UI ---------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold">Create new task</h2>

        {/* Title (จำเป็น) */}
        <input
          className="mb-3 w-full rounded border px-3 py-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Description (ไม่บังคับ) */}
        <textarea
          className="mb-3 h-24 w-full resize-none rounded border px-3 py-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Due date – default พรุ่งนี้ 09:00 */}
        <label className="mb-1 block text-sm">Due date</label>
        <input
          type="datetime-local"
          className="mb-3 w-full rounded border px-3 py-2"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Urgency */}
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

        {/* Category */}
        <input
          className="mb-4 w-full rounded border px-3 py-2"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setOpen?.(false)}
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
