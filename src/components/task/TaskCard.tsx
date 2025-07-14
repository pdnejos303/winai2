// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskCard.tsx
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import {
  Circle,
  CheckCircle2,
  Pencil,
  Trash,
  Flag,
} from "lucide-react";
import type { Task, Category } from "@prisma/client";
import EditTaskModal from "./EditTaskModal";

/* ---------- types ---------- */
type TaskStatus = "completed" | "incompleted";
type UrgencyNum = 0 | 1 | 2 | 3;
type TaskWithCat = Task & { category: Category | null };

interface Props {
  task: TaskWithCat;
  selected: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number, next: TaskStatus) => void;
  onDeleted: (id: number) => void;
  onUpdated: (t: TaskWithCat) => void;
}

/* ---------- helpers ---------- */
const barMap: Record<UrgencyNum, { count: 0 | 1 | 2 | 3; color: string }> = {
  0: { count: 0, color: "bg-gray-300" },
  1: { count: 1, color: "bg-emerald-400" },
  2: { count: 2, color: "bg-sky-400" },
  3: { count: 3, color: "bg-rose-400" },
};
const fmt = (d: Date | string) => format(new Date(d), "yyyy-MM-dd");

/* ---------- component ---------- */
function UrgencyBars({ level }: { level: UrgencyNum }) {
  const { count, color } = barMap[level];
  return (
    <div className="mt-2 flex w-full gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "h-[5px] flex-1 rounded-full",
            i < count ? color : "bg-gray-400/60",
          )}
        />
      ))}
    </div>
  );
}

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
  const nextStatus: TaskStatus =
    task.status === "completed" ? "incompleted" : "completed";

  return (
    <>
      <div
        className={clsx(
          "relative rounded-lg border p-4 shadow transition hover:shadow-lg",
          selected && "border-2 border-blue-500",
          task.status === "completed" && "opacity-60 line-through",
        )}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* select */}
        <button
          onClick={() => onSelect(task.id)}
          className={clsx(
            "absolute right-3 top-3 h-5 w-5 rounded-sm border",
            selected ? "bg-blue-500" : "bg-white",
          )}
          aria-label="Select"
        />

        {/* urgency flag */}
        <Flag
          size={16}
          className={clsx(
            "absolute left-3 top-3",
            ["text-gray-400", "text-emerald-500", "text-sky-500", "text-rose-500"][
              task.urgency
            ],
          )}
        />

        {/* title */}
        <h3 className="mb-1 pr-6 text-lg font-semibold">{task.title}</h3>

        {/* description */}
        {task.description && (
          <p className="mb-2 line-clamp-2 text-sm text-gray-700">
            {task.description}
          </p>
        )}

        <UrgencyBars level={task.urgency as UrgencyNum} />

        {/* category & status */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {task.category ? (
            <span className="flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-gray-600">
              <span
                className="inline-block size-2 rounded-full"
                style={{ background: task.category.color }}
              />
              {task.category.name}
            </span>
          ) : (
            <span className="rounded bg-gray-200 px-2 py-0.5 text-gray-500">
              No category
            </span>
          )}

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

        {/* dates */}
        <ul className="mt-2 space-y-0.5 text-xs text-gray-500">
          <li>Due&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {fmt(task.dueDate)}</li>
          <li>Created : {fmt(task.createdAt)}</li>
          <li>Updated : {fmt(task.updatedAt)}</li>
        </ul>

        {/* actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onToggle(task.id, nextStatus)}
            className="flex-1 rounded bg-emerald-500 py-2 text-white hover:bg-emerald-600"
            title="Toggle"
          >
            {task.status === "completed" ? (
              <CheckCircle2 size={18} />
            ) : (
              <Circle size={18} />
            )}
          </button>
          {(hover || selected) && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded bg-sky-200 py-2 text-sky-800 hover:bg-sky-300"
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() =>
                  confirm("Delete this task?") && onDeleted(task.id)
                }
                className="flex-1 rounded bg-rose-500 py-2 text-white hover:bg-rose-600"
                title="Delete"
              >
                <Trash size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <EditTaskModal
          task={task}
          categories={[]}        /* ส่ง array เปล่า เมื่อเรียกจาก Card */
          setOpen={setEditing}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
