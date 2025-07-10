// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskCard.tsx
// DESC: Card งานตามดีไซน์ใหม่ (แสดงข้อมูลครบ 8 ฟิลด์)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { Task } from "@prisma/client";
import clsx from "clsx";
import EditTaskModal from "./EditTaskModal";

/* ── types ──────────────────────────────────────────────── */
type TaskStatus = "completed" | "incompleted";

interface Props {
  task: Task;
  selected: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number, next: TaskStatus) => void;
  onDeleted: (id: number) => void;
  onUpdated: (t: Task) => void;
}

/* ── helpers ────────────────────────────────────────────── */
const fmt = (iso: Date | string) =>
  new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));

const urgencyColor: Record<Task["urgency"], string> = {
  Urgent: "bg-red-500",
  Normal: "bg-yellow-500",
  Low: "bg-emerald-500",
};

/* ── component ──────────────────────────────────────────── */
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

  /* -- delete ------------------------------------------------ */
  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted(task.id);
  }

  /* -- toggle ------------------------------------------------ */
  const nextStatus: TaskStatus =
    task.status === "completed" ? "incompleted" : "completed";

  /* -- ui state --------------------------------------------- */
  const border = selected ? "border-2 border-blue-500" : "border";
  const faded = task.status === "completed" ? "opacity-60 line-through" : "";

  return (
    <>
      <div
        className={clsx(
          "relative rounded-lg p-4 shadow transition hover:shadow-lg",
          border,
          faded
        )}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* checkbox select */}
        <button
          onClick={() => onSelect(task.id)}
          className={clsx(
            "absolute right-3 top-3 h-5 w-5 rounded-sm border",
            selected ? "bg-blue-500" : "bg-white"
          )}
          aria-label="เลือกงาน"
        />

        {/* title */}
        <h3 className="mb-1 text-lg font-semibold">{task.title}</h3>

        {/* description */}
        {task.description && (
          <p className="mb-2 line-clamp-2 text-sm text-gray-700">
            {task.description}
          </p>
        )}

        {/* badges */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          {/* urgency */}
          <span
            className={clsx(
              "rounded px-2 py-0.5 font-medium text-white",
              urgencyColor[task.urgency]
            )}
          >
            {task.urgency}
          </span>

          {/* category */}
          <span className="rounded bg-gray-200 px-2 py-0.5 text-gray-600">
            {task.category}
          </span>

          {/* status */}
          <span
            className={clsx(
              "rounded px-2 py-0.5 font-medium",
              task.status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            )}
          >
            {task.status === "completed" ? "Completed" : "Incompleted"}
          </span>
        </div>

        {/* dates */}
        <ul className="space-y-0.5 text-xs text-gray-500">
          <li>Due&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {fmt(task.dueDate)}</li>
          <li>Created : {fmt(task.createdAt)}</li>
          <li>Updated : {fmt(task.updatedAt)}</li>
        </ul>

        {/* actions */}
        <div className="mt-4 flex gap-2">
          {/* toggle */}
          <button
            onClick={() => onToggle(task.id, nextStatus)}
            className="flex-1 rounded bg-emerald-500 py-3 text-white hover:bg-emerald-600"
            title="Toggle completed"
          >
            ✓
          </button>

          {/* edit / delete (show on hover or selected) */}
          {(hover || selected) && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded bg-sky-200 py-3 text-sky-800 hover:bg-sky-300"
                title="Edit"
              >
                ✎
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded bg-rose-500 py-3 text-white hover:bg-rose-600"
                title="Delete"
              >
                🗑
              </button>
            </>
          )}
        </div>
      </div>

      {/* modal edit */}
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
