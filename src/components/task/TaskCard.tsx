// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskCard.tsx
// DESC: Card งานตามดีไซน์ใหม่
//       • สี่เหลี่ยมมุมขวาบน = เลือก (เพื่อ batch action)
//       • ปุ่มเขียวใหญ่ล่าง = toggle completed
//       • ขอบน้ำเงิน = ถูกเลือก, การ์ดจาง/ขีดฆ่าเมื่อ completed
//       • ✎ / 🗑 โชว์เมื่อ hover หรือถูกเลือก
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { Task } from "@prisma/client";
import EditTaskModal from "./EditTaskModal";

/* -------------------------------------------------------------------------- */
interface Props {
  task: Task;
  selected: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number, s: "completed" | "incompleted") => void;
  onDeleted: (id: number) => void;
  onUpdated: (t: Task) => void;
}
/* -------------------------------------------------------------------------- */
export default function TaskCard({
  task,
  selected,
  onSelect,
  onToggle,
  onDeleted,
  onUpdated,
}: Props) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted(task.id);
  }

  const border = selected ? "border-2 border-blue-500" : "border";
  const faded = task.status === "completed" ? "opacity-60" : "";

  return (
    <>
      <div
        className={`relative rounded-lg p-4 shadow transition hover:shadow-lg ${border} ${faded}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* ── select square ── */}
        <button
          onClick={() => onSelect(task.id)}
          className={`absolute right-3 top-3 h-5 w-5 rounded-sm border ${
            selected ? "bg-blue-500" : "bg-white"
          }`}
        />

        {/* ── title & description ── */}
        <h3
          className={`mb-1 text-lg font-semibold ${
            task.status === "completed" ? "line-through" : ""
          }`}
        >
          {task.title}
        </h3>
        {task.description && (
          <p
            className={`mb-2 line-clamp-2 text-sm ${
              task.status === "completed"
                ? "text-gray-500 line-through"
                : "text-gray-600"
            }`}
          >
            {task.description}
          </p>
        )}

        {/* ── due date ตัวอย่าง ── */}
        <p className="text-sm text-gray-500">
          {new Date(task.dueDate).toLocaleDateString()}
        </p>

        {/* ── action bar ── */}
        <div className="mt-6 flex gap-3">
          {/* toggle completed */}
          <button
            onClick={() =>
              onToggle(
                task.id,
                task.status === "completed" ? "incompleted" : "completed",
              )
            }
            className="flex-1 rounded bg-emerald-500 py-3 text-white hover:bg-emerald-600"
          >
            ✓
          </button>

          {/* edit / delete — โชว์เมื่อ hover หรือ selected */}
          {(hover || selected) && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded bg-sky-200 py-3 text-sky-800 hover:bg-sky-300"
              >
                ✎
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded bg-rose-500 py-3 text-white hover:bg-rose-600"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <EditTaskModal
          task={task}
          setOpen={setEditing}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
