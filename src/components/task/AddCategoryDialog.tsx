// ────────────────────────────────────────────────────────────────
// FILE: src/components/task/AddCategoryDialog.tsx
// DESC: Dialog สร้าง Category + เลือก Icon  ★ส่ง Category object คืน
// CHANGES:
//   • POST → /api/categories
//   • รับ prop existing เพื่อกันชื่อซ้ำ
//   • return Category object (id, name, icon)
// ────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import {
  Briefcase,
  Heart,
  BookOpen,
  Dumbbell,
  Coffee,
  Globe,
  Music,
  ShoppingCart,
  Star,
  Tag,
  LucideIcon,
} from "lucide-react";
import { Category } from "@prisma/client";

/* ---------- icon list ---------- */
const ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "Briefcase", Icon: Briefcase },
  { name: "Heart", Icon: Heart },
  { name: "BookOpen", Icon: BookOpen },
  { name: "Dumbbell", Icon: Dumbbell },
  { name: "Coffee", Icon: Coffee },
  { name: "Globe", Icon: Globe },
  { name: "Music", Icon: Music },
  { name: "ShoppingCart", Icon: ShoppingCart },
  { name: "Star", Icon: Star },
  { name: "Tag", Icon: Tag },
];

interface Props {
  children: React.ReactNode;           // trigger
  onCreated?: (c: Category) => void;   // ✨ return Category
  existing: Category[];                // ✨ ตรวจชื่อซ้ำ
}

export default function AddCategoryDialog({
  children,
  onCreated,
  existing,
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("Tag");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    if (existing.some((c) => c.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("ชื่อซ้ำ");
      return;
    }
    setSaving(true);

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), icon: iconName }),
    });
    if (res.ok) {
      const cat: Category = await res.json();
      onCreated?.(cat);
      setName("");
      setIconName("Tag");
      setError("");
      setOpen(false);
    } else {
      setError("สร้างไม่สำเร็จ");
    }
    setSaving(false);
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
            >
              <h2 className="mb-4 text-lg font-semibold">เพิ่มหมวดหมู่ใหม่</h2>

              <input
                autoFocus
                placeholder="ชื่อหมวดหมู่"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="mb-4 w-full rounded border px-3 py-2"
              />

              <p className="mb-2 text-sm font-medium text-gray-600">
                เลือกไอคอน
              </p>
              <div className="mb-4 grid grid-cols-5 gap-2">
                {ICONS.map(({ name: n, Icon }) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setIconName(n)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                      iconName === n
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>

              {error && (
                <p className="mb-2 text-sm text-red-600">{error}</p>
              )}

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
                  disabled={!name.trim() || saving}
                  className="rounded bg-green-600 px-4 py-1 text-white disabled:opacity-50"
                >
                  {saving ? "กำลังบันทึก…" : "สร้าง"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
