// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskCard.tsx
// DESC: Card 320×400 px – แถบ “ความเร่งด่วน” 3 ท่อนติดกัน
// NOTES:
//   • ลบ startTime/endTime – model ยังไม่มี
//   • เอา progress bar (pink/green) ออก → ใช้ UrgencyBars 3 ช่องติด
//   • แก้ ESLint: fmt, UrgencyNum now used
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import clsx from "clsx";
import { format, differenceInCalendarDays } from "date-fns";
import { th } from "date-fns/locale";
import {
  Flag,
  Calendar,
  Package,
  Circle,
  CheckCircle2,
  Pencil,
  Trash,
} from "lucide-react";
import type { Task, Category } from "@prisma/client";
import EditTaskModal from "./EditTaskModal";

/* ---------- types & helpers ---------- */
type TaskStatus = "completed" | "incompleted";
type UrgencyNum = 0 | 1 | 2 | 3;
export type TaskWithCat = Task & { category: Category | null };

interface Props {
  task: TaskWithCat;
  selected: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number, next: TaskStatus) => void;
  onDeleted: (id: number) => void;
  onUpdated: (t: TaskWithCat) => void;
}

/* Urgency → สี */
const flagColors = [
  "text-gray-400",
  "text-emerald-500",
  "text-sky-500",
  "text-rose-500",
] as const;

/* Urgency bar mapping: color + amount */
const barMap: Record<UrgencyNum, { count: 0 | 1 | 2 | 3; color: string }> = {
  0: { count: 0, color: "bg-gray-300" },
  1: { count: 1, color: "bg-emerald-400" },
  2: { count: 2, color: "bg-sky-400" },
  3: { count: 3, color: "bg-rose-400" },
};

const MetaRow = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => <div className="flex items-center gap-2 text-sm">{icon}{children}</div>;

/* แถบ 3 ช่องติด (ไม่มีช่องว่าง) */
function UrgencyBars({ level }: { level: UrgencyNum }) {
  const { count, color } = barMap[level];
  return (
    <div className="mt-2 flex h-[5px] w-full overflow-hidden rounded-full">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            "flex-1",
            i < count ? color : "bg-gray-300/60",
          )}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
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
  const remain = Math.max(differenceInCalendarDays(task.dueDate, new Date()), 0);

  return (
    <>
      <div
        className={clsx(
          "relative flex h-[400px] w-[320px] flex-col rounded-lg border border-[#C9D1C3] bg-white p-5 shadow transition",
          hover && "shadow-lg",
          selected && "ring-2 ring-blue-500",
          task.status === "completed" && "opacity-60 line-through",
        )}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Checkbox select */}
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(task.id)}
          className="absolute right-4 top-4 size-5 rounded-sm border-2 border-green-700 text-green-700 focus:ring-green-700"
        />

        {/* Urgency flag */}
        <Flag
          size={16}
          className={clsx("absolute left-4 top-4", flagColors[task.urgency])}
        />

        {/* -------- TOP content (flex-1) -------- */}
        <div className="flex-1 overflow-hidden">
          <h3 className="pr-8 text-xl font-bold">{task.title}</h3>

          {task.description && (
            <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-gray-700">
              {task.description}
            </p>
          )}

          <hr className="my-3 border-t border-gray-300/60" />

          <div className="space-y-2">
            <MetaRow icon={<Calendar className="h-4 w-4 stroke-[2]" />}>
              {format(task.dueDate, "d MMMM yyyy", { locale: th })}&nbsp;
              <span className="text-xs text-gray-400">
                ({format(task.dueDate, "dd/MM/yyyy")})
              </span>
            </MetaRow>

            <MetaRow icon={<Package className="h-4 w-4 stroke-[2]" />}>
              {task.category?.name ?? "No category"}
            </MetaRow>
          </div>

          <hr className="my-3 border-t border-gray-300/60" />

          <p className="text-center text-[14px] text-gray-700">
            {remain === 0 ? "Due today" : `Due in ${remain} day`}
          </p>

          {/* ── UrgencyBars 3 ช่องติดกัน ── */}
          <UrgencyBars level={task.urgency as UrgencyNum} />
        </div>

        {/* -------- ACTION ZONE (bottom) -------- */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onToggle(task.id, nextStatus)}
            className={clsx(
              "flex-1 rounded py-2 text-white transition",
              task.status === "completed"
                ? "bg-gray-400 hover:bg-gray-500"
                : "bg-emerald-500 hover:bg-emerald-600",
            )}
            title="Toggle status"
          >
            {task.status === "completed" ? (
              <CheckCircle2 size={20} />
            ) : (
              <Circle size={20} />
            )}
          </button>

          {(hover || selected) && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded bg-sky-200 py-2 text-sky-800 hover:bg-sky-300"
                title="Edit Task"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() =>
                  confirm("Delete this task?") && onDeleted(task.id)
                }
                className="flex-1 rounded bg-rose-500 py-2 text-white hover:bg-rose-600"
                title="Delete Task"
              >
                <Trash size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal edit */}
      {editing && (
        <EditTaskModal
          task={task}
          categories={[]} /* ส่ง array เปล่า เมื่อเรียกจาก Card */
          setOpen={setEditing}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
