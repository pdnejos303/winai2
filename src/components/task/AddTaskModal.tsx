"use client";

import { useState } from "react";
import { formatISO } from "date-fns";
import { Task } from "@prisma/client";

type Props = {
  onCreated: (task: Task) => void;
};

export default function AddTaskModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(formatISO(new Date()).slice(0, 16));
  const [urgency, setUrgency] = useState<"high" | "medium" | "low">("medium");
  const [category, setCategory] = useState("General");

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate, urgency, category }),
    });
    const task: Task = await res.json();
    onCreated(task);
    setSaving(false);
    setOpen(false);
  }

  /* ---- UI ---- */
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-md bg-brand-green text-white font-medium hover:opacity-90"
      >
        + Add Task
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold">Create new task</h2>

            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24 resize-none"
            />

            <div className="flex gap-3">
              <label className="flex flex-col flex-1 text-sm">
                Due date
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </label>

              <label className="flex flex-col text-sm">
                Urgency
                <select
                  value={urgency}
                  onChange={(e) =>
                    setUrgency(e.target.value as "high" | "medium" | "low")
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>

            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={handleSave}
                className="px-4 py-1 rounded-md bg-brand-green text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
