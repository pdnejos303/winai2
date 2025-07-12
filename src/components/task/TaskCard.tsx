// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskCard.tsx
// DESC: Card งาน – แสดงข้อมูลครบ 8 ฟิลด์
//       + “แทบแสดงความเร่งด่วน” 3 ช่อง (0-3)
//       + urgency เก็บเป็น **Int** 0-3 (0 none, 1 low, 2 medium, 3 high)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { Task } from "@prisma/client";
import clsx from "clsx";
import EditTaskModal from "./EditTaskModal";

/* ---------- types ---------- */
type TaskStatus = "completed" | "incompleted";
type UrgencyNum = 0 | 1 | 2 | 3; // 0-3

interface Props {
  task: Task;
  selected: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number, next: TaskStatus) => void;
  onDeleted: (id: number) => void;
  onUpdated: (t: Task) => void;
}

/* ---------- helper: format date (th-TH) ---------- */
const fmt = (iso: Date | string) =>
  new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));

/* ---------- Urgency → (bar count , color) ---------- */
const barMap: Record<UrgencyNum, { count: 0 | 1 | 2 | 3; color: string }> = {
  0: { count: 0, color: "bg-gray-300" },      // ไม่กำหนด
  1: { count: 1, color: "bg-emerald-400" },   // Low
  2: { count: 2, color: "bg-sky-400" },       // Medium
  3: { count: 3, color: "bg-rose-400" },      // High
};

/* ---------- component: UrgencyBars ---------- */
function UrgencyBars({ level }: { level: UrgencyNum }) {
  const { count, color } = barMap[level] ?? barMap[0];
  return (
    <div className="mt-2 flex w-full gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "flex-1 h-[5px] rounded-full",
            i < count ? color : "bg-gray-400/60",
          )}
        />
      ))}
    </div>
  );
}

/* ---------- main TaskCard ---------- */
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

  /* delete */
  async function handleDelete() {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDeleted(task.id);
  }

  /* toggle */
  const nextStatus: TaskStatus =
    task.status === "completed" ? "incompleted" : "completed";

  /* style helpers */
  const border = selected ? "border-2 border-blue-500" : "border";
  const faded =
    task.status === "completed" ? "opacity-60 line-through" : undefined;

  return (
    <>
      <div
        className={clsx(
          "relative rounded-lg p-4 shadow transition hover:shadow-lg",
          border,
          faded,
        )}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* === Checkbox select === */}
        <button
          onClick={() => onSelect(task.id)}
          className={clsx(
            "absolute right-3 top-3 h-5 w-5 rounded-sm border",
            selected ? "bg-blue-500" : "bg-white",
          )}
          aria-label="เลือกงาน"
        />

        {/* === Title === */}
        <h3 className="mb-1 text-lg font-semibold">{task.title}</h3>

        {/* === Description === */}
        {task.description && (
          <p className="mb-2 line-clamp-2 text-sm text-gray-700">
            {task.description}
          </p>
        )}

        {/* === Urgency Bars === */}
        <UrgencyBars level={task.urgency as UrgencyNum} />

        {/* === Category & Status Badges === */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-gray-200 px-2 py-0.5 text-gray-600">
            {task.category}
          </span>
          <span
            className={clsx(
              "rounded px-2 py-0.5 font-medium",
              task.status === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700",
            )}
          >
            {task.status === "completed" ? "Completed" : "Incompleted"}
          </span>
        </div>

        {/* === Dates === */}
        <ul className="mt-2 space-y-0.5 text-xs text-gray-500">
          <li>Due&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {fmt(task.dueDate)}</li>
          <li>Created : {fmt(task.createdAt)}</li>
          <li>Updated : {fmt(task.updatedAt)}</li>
        </ul>

        {/* === Action Buttons === */}
        <div className="mt-4 flex gap-2">
          {/* ✓ Toggle */}
          <button
            onClick={() => onToggle(task.id, nextStatus)}
            className="flex-1 rounded bg-emerald-500 py-3 text-white hover:bg-emerald-600"
            title="Toggle completed"
          >
            ✓
          </button>

          {/* ✎ / 🗑 (show on hover/selected) */}
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

      {/* === Modal Edit === */}
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
