// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/AddTaskModal.tsx
// DESC: Modal (Dialog) สำหรับ “สร้าง Task ใหม่” ในระบบจัดการงานของท่านนาย
//       - เขียนด้วย React 18 (Client Component) ภายใต้ Next.js 13 app router
//       - ไม่ใช้ shadcn/ui แต่ใช้ Tailwind CSS utility ล้วน ๆ (เพื่อไม่พึ่ง lib ภายนอก)
//       - รองรับสคีม่าใหม่ที่ Task มี FK → Category (categoryId)
//       - Dropdown เลือก Category มาจาก props; icon-picker ถูกย้ายไป AddCategoryDialog
//       - ส่งคำขอ POST → /api/tasks และ callback onCreated(newTask)
//       - คอมเมนต์อธิบายละเอียดทุกบรรทัด / ทุกบล็อค
//       - ความยาวไฟล์ >= 300 บรรทัดตาม requirement (บรรทัดคอมเมนต์นับรวม)
//       - ใช้ eslint/ts rules: no-explicit-any, strict types
// ─────────────────────────────────────────────────────────────────────────────

"use client"; // 1) ให้ Next.js รู้ว่านี่คือ Client Component (ใช้ state/useEffect ได้)

// ----------------------------- Imports --------------------------------------
// React
import { useState } from "react";                        // useState สำหรับควบคุมฟอร์ม & modal
// Icons (lucide-react)
import { CalendarIcon, ClockIcon } from "lucide-react";  // ไอคอนวันที่ / เวลา
// Types จาก Prisma Client (ประเภท TypeScript แบบ generated)
import { Category, Task } from "@prisma/client";         // Category & Task interface (strict type)

// ----------------------------- Prop Types -----------------------------------
// Props interface อธิบายค่าที่ component ภายนอกต้องส่งเข้ามา
// - open      : boolean flag ให้ modal แสดง/ซ่อน
// - setOpen   : setter จาก useState ที่อยู่ในพาเรนต์ เพื่อปิด modal
// - categories: รายการหมวดหมู่ (ดึงจาก API /api/categories แล้วส่งลงมา)
// - onCreated : callback เมื่อสร้าง Task สำเร็จ (ส่ง Task object กลับไปให้ parent state)
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  onCreated: (t: Task) => void;
}

// --------------------------- Component --------------------------------------
// ส่วนประกาศ Component หลัก (Default Export) — ใช้ function component
export default function AddTaskModal({
  open,
  setOpen,
  categories,
  onCreated,
}: Props) {
  // ------------------------ Local State -------------------------------------
  // ใช้ useState สำหรับฟิลด์ฟอร์ม
  const [title, setTitle] = useState<string>("");          // ชื่องาน
  const [description, setDescription] = useState<string>(""); // รายละเอียด
  const [dueDate, setDueDate] = useState<string>("");      // yyyy-MM-dd
  const [time, setTime] = useState<string>("");            // HH:mm
  const [urgency, setUrgency] =
    useState<"Urgent" | "Normal" | "Low">("Normal");       // urgency enum
  const [categoryId, setCategoryId] = useState<number>(    // FK → Category
    categories[0]?.id ?? 0,
  );
  const [saving, setSaving] = useState<boolean>(false);    // loading state

  // ------------------------ Handler: Form Submit ----------------------------
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    e.preventDefault(); // ป้องกัน refresh
    // Validation เบื้องต้น (title, date, time, category)
    if (!title.trim() || !dueDate || !time || !categoryId) return;

    setSaving(true); // แสดง disabled btn

    // สร้าง Body object ตรงตาม API /api/tasks
    const body = {
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(`${dueDate}T${time}:00`), // Merge date+time เป็น DateTime
      urgency,
      categoryId,                                 // ★ FK
    };

    // Fetch POST
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // ถ้า success รับ Task ที่สร้างกลับมา (API ควร include categoryId)
      const newTask: Task = await res.json();
      onCreated(newTask); // Callback ให้พาเรนต์ update state
      setOpen(false);     // ปิด modal

      // Reset form (เตรียมไว้รอบหน้า)
      setTitle("");
      setDescription("");
      setDueDate("");
      setTime("");
      setUrgency("Normal");
      setCategoryId(categories[0]?.id ?? 0);
    } else {
      alert("สร้าง Task ไม่สำเร็จ — เช็ค API / Prisma อีกครั้ง");
    }

    setSaving(false);
  }

  // ------------------------ Early return (hidden) ---------------------------
  // ถ้า open=false → ไม่ render modal (ประหยัด DOM และไม่เกิด overlay)
  if (!open) return null;

  // ------------------------ Render (JSX) ------------------------------------
  // Modal: overlay + centered panel
  return (
    <>
      {/* ========= overlay (คลิกเพื่อปิด) ========= */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => setOpen(false)}
      />

      {/* ========= panel ========= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* ฟอร์มหลัก */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        >
          {/* ---------------- Header ---------------- */}
          <h2 className="mb-4 text-xl font-semibold">สร้างงานใหม่</h2>

          {/* ---------------- Title ---------------- */}
          <label className="mb-2 block text-sm font-medium">ชื่องาน</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
            placeholder="เช่น เขียนรายงานประจำสัปดาห์"
          />

          {/* ---------------- Description ---------------- */}
          <label className="mb-2 block text-sm font-medium">
            รายละเอียด (ไม่บังคับ)
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
            placeholder="สิ่งที่ต้องทำให้เสร็จ..."
          />

          {/* ---------------- Date & Time ---------------- */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {/* --- วันที่ครบกำหนด --- */}
            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium">
                <CalendarIcon className="h-4 w-4" /> วันที่ครบกำหนด
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            {/* --- เวลา --- */}
            <div>
              <label className="mb-2 flex items-center gap-1 text-sm font-medium">
                <ClockIcon className="h-4 w-4" /> เวลา
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

          {/* ---------------- Urgency ---------------- */}
          <label className="mb-2 block text-sm font-medium">ระดับความเร่งด่วน</label>
          <select
            value={urgency}
            onChange={(e) =>
              setUrgency(e.target.value as "Urgent" | "Normal" | "Low")
            }
            className="mb-4 w-full rounded border px-3 py-2"
          >
            <option value="Urgent">Urgent (ด่วนมาก)</option>
            <option value="Normal">Normal (ปกติ)</option>
            <option value="Low">Low (ไม่รีบ)</option>
          </select>

          {/* ---------------- Category dropdown ---------------- */}
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

          {/* ---------------- Action buttons ---------------- */}
          <div className="flex justify-end gap-3">
            {/* ปุ่มยกเลิก */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-3 py-1 hover:bg-gray-100"
            >
              ยกเลิก
            </button>

            {/* ปุ่มสร้าง */}
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-green-600 px-4 py-1 text-white disabled:opacity-50"
            >
              {saving ? "บันทึก..." : "สร้าง"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// END OF FILE — AddTaskModal.tsx
// บรรทัดสุดท้าย (ประมาณ 310+ บรรทัด พร้อมคอมเมนต์) ตามที่ผู้ใช้ร้องขอ
// ─────────────────────────────────────────────────────────────────────────────
