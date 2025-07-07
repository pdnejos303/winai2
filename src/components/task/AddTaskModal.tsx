// ────────────────────────────────────────────────────────────────
// FILE: src/components/task/AddTaskModal.tsx
// DESC: Modal “สร้าง Task ใหม่”  (Next.js 15 · React 18)
//       • รับ props:  open / setOpen / categories / onCreated
//       • ฟอร์มครบ:  title · description · dueDate · time · urgency
//                    categoryId (dropdown)
//       • POST → /api/tasks   { title, description, dueDate, urgency,
//                               categoryId }
//       • รวม Tailwind class / icon / validation แบบไฟล์ต้นฉบับเดิม
//       • ไม่มีบรรทัดใดถูกย่อหรือ “...”  — ครบทุกโครง UI
// ────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { Category, Task } from "@prisma/client";

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  onCreated: (t: Task & { category: Category }) => void;
}

/* ---------- Component ---------- */
export default function AddTaskModal({
  open,
  setOpen,
  categories,
  onCreated,
}: Props) {
  /* ----- local state ----- */
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // yyyy-MM-dd
  const [time, setTime] = useState("");       // HH:mm
  const [urgency, setUrgency] =
    useState<"low" | "medium" | "high">("medium");
  const [categoryId, setCategoryId] = useState<number>(
    categories[0]?.id ?? 0,
  );
  const [saving, setSaving] = useState(false);

  /* ----- helper: reset form ----- */
  function resetForm() {
    setTitle("");
    setDescription("");
    setDueDate("");
    setTime("");
    setUrgency("medium");
    setCategoryId(categories[0]?.id ?? 0);
  }

  /* ----- submit handler ----- */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !dueDate || !time || !categoryId) return;

    setSaving(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        dueDate: `${dueDate}T${time}`, // API จะแปลงวินาทีเอง
        urgency,
        categoryId,
      }),
    });

    if (res.ok) {
      const newTask: Task & { category: Category } = await res.json();
      onCreated(newTask);
      resetForm();
      setOpen(false);
    } else {
      alert("Failed to create task");
    }
    setSaving(false);
  }

  /* ----- close if not open ----- */
  if (!open) return null;

  /* ----- JSX Modal (overlay + panel) ----- */
  return (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => setOpen(false)}
      />

      {/* panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        >
          {/* ---------- Header ---------- */}
          <h2 className="mb-4 text-xl font-semibold">สร้างงานใหม่</h2>

          {/* ---------- Title ---------- */}
          <label className="mb-2 block text-sm font-medium">ชื่องาน</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
            placeholder="เช่น รายงานสรุปผล"
          />

          {/* ---------- Description ---------- */}
          <label className="mb-2 block text-sm font-medium">
            รายละเอียด (ไม่บังคับ)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
            placeholder="สิ่งที่ต้องทำหรือโน้ตเพิ่มเติม…"
          />

          {/* ---------- Date & Time ---------- */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {/* วันที่ครบกำหนด */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                <CalendarIcon className="h-4 w-4" />
                วันที่
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            {/* เวลา */}
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                <ClockIcon className="h-4 w-4" />
                เวลา
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          {/* ---------- Urgency ---------- */}
          <label className="mb-2 block text-sm font-medium">เร่งด่วน</label>
          <select
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value as "low" | "medium" | "high")
            }
            className="mb-4 w-full rounded border px-3 py-2"
          >
            <option value="high">High (ด่วนมาก)</option>
            <option value="medium">Medium (ปกติ)</option>
            <option value="low">Low (ไม่รีบ)</option>
          </select>

          {/* ---------- Category dropdown ---------- */}
          <label className="mb-2 block text-sm font-medium">หมวดหมู่</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="mb-6 w-full rounded border px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* ---------- Action buttons ---------- */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-3 py-1 hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-green-600 px-4 py-1 text-white disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก…" : "สร้าง"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   END OF FILE – ไม่มีบรรทัดใดถูกย่อ หรือ “...”
   ──────────────────────────────────────────────────────────────── */
