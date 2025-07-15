// ─────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskCard.tsx
// DESC: Card 320×400 px – แถบ “ความเร่งด่วน” 3 ท่อนติดกัน
// NOTES:
// • ลบ startTime/endTime – model ยังไม่มี
// • เอา progress bar (pink/green) ออก → ใช้ UrgencyBars 3 ช่องติด
// • แก้ ESLint/TS ทุกจุด (no-explicit-any, unused eslint-disable, TS2741 ฯลฯ)
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
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
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
  categories?: Category[]; // ส่งต่อให้ EditTaskModal
}

/* Urgency → สี */
const flagColors = ["text-gray-400", "text-emerald-500", "text-sky-500", "text-rose-500"] as const;
const barColors = ["bg-gray-300", "bg-emerald-400", "bg-sky-400", "bg-rose-400"] as const;

/* meta row (icon + text) */
const MetaRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <p className="flex items-center gap-2 text-sm">
    {icon}
    {children}
  </p>
);

/* UrgencyBars – 3 ช่องติดกันเห็นรอยต่อ */
function UrgencyBars({ level }: { level: UrgencyNum }) {
  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={clsx("h-1 w-full rounded-sm", i < level ? barColors[level] : "bg-gray-200")}
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
  categories,
}: Props) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);

  /* ---------- derived ---------- */
  const nextStatus: TaskStatus = task.status === "completed" ? "incompleted" : "completed";
  const remain = Math.max(differenceInCalendarDays(task.dueDate, new Date()), 0);

  /* ---------- category icon ---------- */
  const DynamicIcons = LucideIcons as unknown as Record<string, LucideIcon>; // → แก้ TS2352
  const IconComp =
    task.category && DynamicIcons[task.category.icon] ? DynamicIcons[task.category.icon] : Package;

  return (
    <>
      <div
        className={clsx(
          "relative flex h-[400px] w-[320px] flex-col rounded-lg bg-white p-6 shadow transition",
          hover && "shadow-lg",
          selected && "ring-2 ring-green-700",
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
        <Flag className={clsx("absolute left-4 top-4 h-5 w-5", flagColors[task.urgency])} />

        {/* -------- TOP content (flex-1) -------- */}
        <div className="mb-4 mt-8 flex-1 space-y-3 overflow-y-auto">
          <h3 className="break-words text-lg font-semibold">{task.title}</h3>

          {task.description && (
            <p className="whitespace-pre-line break-words text-sm text-gray-700">
              {task.description}
            </p>
          )}

          <hr />

          {/* due date */}
          <MetaRow icon={<Calendar className="h-4 w-4" />}>
            {format(task.dueDate, "d MMMM yyyy", { locale: th })}&nbsp;
            ({format(task.dueDate, "dd/MM/yyyy")})
          </MetaRow>

          {/* category (icon + name) */}
          <MetaRow icon={<IconComp className="h-4 w-4" />}>
            {task.category?.name ?? "No category"}
          </MetaRow>

          <hr />

          <p className="text-center text-sm italic text-gray-500">
            {remain === 0 ? "Due today" : `Due in ${remain} day${remain > 1 ? "s" : ""}`}
          </p>

          {/* UrgencyBars */}
          <UrgencyBars level={task.urgency as UrgencyNum} />
        </div>

        {/* -------- ACTION ZONE (bottom) -------- */}
        <div className="mt-auto flex gap-1">
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
              <CheckCircle2 className="mx-auto h-5 w-5" />
            ) : (
              <Circle className="mx-auto h-5 w-5" />
            )}
          </button>

          {(hover || selected) && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded bg-sky-200 py-2 text-sky-800 hover:bg-sky-300"
                title="Edit Task"
              >
                <Pencil className="mx-auto h-5 w-5" />
              </button>
              <button
                onClick={() => confirm("Delete this task?") && onDeleted(task.id)}
                className="flex-1 rounded bg-rose-500 py-2 text-white hover:bg-rose-600"
                title="Delete Task"
              >
                <Trash className="mx-auto h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal edit */}
      {editing && (
        <EditTaskModal
          task={task}
          categories={categories ?? []}
          setOpen={setEditing}
          onUpdated={(u) => {
            onUpdated(u as TaskWithCat);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}
