// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/AddCategoryModal.tsx
// DESC: Modal เพิ่ม Category (เก็บ string ในฟิลด์ category ของ Task)
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";

interface Props {
  setOpen: (b: boolean) => void;
  onCreate: (name: string) => void;
}

export default function AddCategoryModal({ setOpen, onCreate }: Props) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    onCreate(name.trim());
    setSaving(false);
    setOpen(false);
  }

  return (
    <>
      {/* overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={() => setOpen(false)}
      />

      {/* panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <form
          onSubmit={handleSave}
          className="w-full max-w-sm rounded-lg bg-white p-6 shadow"
        >
          <h2 className="mb-4 text-lg font-semibold">Add new category</h2>

          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work, Health, Learning"
            className="mb-4 w-full rounded border px-3 py-2"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-3 py-1 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="rounded bg-brand-green px-4 py-1 text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
