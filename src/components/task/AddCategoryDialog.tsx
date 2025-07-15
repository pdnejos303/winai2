// ────────────────────────────────────────────────────────────────
// FILE: src/components/task/AddCategoryDialog.tsx
// DESC: กล่องเพิ่ม Category (ชื่อ + ไอคอน + สี)
// ────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";
import {
  Briefcase,
  Book,
  Heart,
  Dumbbell,
  Music,
  Star,
  Utensils,
  GraduationCap,
  Wallet,
  Sparkles,
  Film,
  Gamepad2,
} from "lucide-react";

/* ---------- icon list ---------- */
const ICONS = [
  { key: "Briefcase", Icon: Briefcase },
  { key: "Book", Icon: Book },
  { key: "Heart", Icon: Heart },
  { key: "Dumbbell", Icon: Dumbbell },
  { key: "Music", Icon: Music },
  { key: "Star", Icon: Star },
  { key: "Utensils", Icon: Utensils },
  { key: "GraduationCap", Icon: GraduationCap },
  { key: "Wallet", Icon: Wallet },
  { key: "Sparkles", Icon: Sparkles },
  { key: "Film", Icon: Film },
  { key: "Gamepad2", Icon: Gamepad2 },
] as const;

/* ---------- util-type ---------- */
type IconKey = typeof ICONS[number]["key"];

/* ---------- props ---------- */
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCreated: (c: Category) => void;
}

/* ---------- component ---------- */
export default function AddCategoryDialog({
  open,
  setOpen,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconKey>("Briefcase");
  const [color, setColor] = useState("#64748b"); // slate-500
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setIcon("Briefcase");
    setColor("#64748b");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        icon,
        color: color.startsWith("#") ? color : `#${color}`,
      }),
    });

    if (res.ok) {
      const cat: Category = await res.json();
      onCreated(cat);
      reset();
      setOpen(false);
    } else if (res.status === 409) {
      alert("มีชื่อหมวดนี้อยู่แล้ว");
    } else {
      alert("บันทึกไม่สำเร็จ");
    }
    setSaving(false);
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">สร้างหมวดใหม่</h2>

        <form onSubmit={handleSubmit}>
          {/* name */}
          <label className="mb-1 block text-sm font-medium">ชื่อหมวด</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
            placeholder="เช่น Work, Study…"
          />

          {/* icon */}
          <label className="mb-2 block text-sm font-medium">เลือกไอคอน</label>
          <div className="mb-4 grid grid-cols-4 gap-3">
            {ICONS.map(({ key, Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => setIcon(key)}
                className={`flex h-10 w-10 items-center justify-center rounded border ${
                  icon === key
                    ? "border-sky-500 bg-sky-100"
                    : "border-transparent hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>

          {/* color */}
          <label className="mb-2 block text-sm font-medium">สีประจำหมวด</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mb-6 h-10 w-full cursor-pointer rounded border"
          />

          {/* actions */}
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
              className="rounded bg-brand-green px-4 py-1 text-white disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก…" : "สร้าง"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────── END FILE */
