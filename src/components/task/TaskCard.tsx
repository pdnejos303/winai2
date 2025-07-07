/* Card แสดง Task พร้อม icon Category  +  ปุ่มเช็ก ✓ / Hover Edit-Delete */
"use client";
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
  CheckIcon,
  PencilIcon,
  Trash2Icon,
  Briefcase,
  Heart,
  BookOpen,
  Dumbbell,
  Coffee,
  Globe,
  Music,
  ShoppingCart,
  Star,
  LucideIcon,
} from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { useState } from "react";
import { Task, Category } from "@prisma/client";
import EditTaskModal from "./EditTaskModal";

/* map icon name → component (lucide) */
const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Heart,
  BookOpen,
  Dumbbell,
  Coffee,
  Globe,
  Music,
  ShoppingCart,
  Star,
  Tag: TagIcon,
};

interface Props {
  task: Task & { category: Category | null };
  selected: boolean;
  onSelect: (id: number) => void;
  onToggle: (id: number, s: "completed" | "incompleted") => void;
  onDeleted: (id: number) => void;
  onUpdated: (t: Task) => void;
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
  const daysLeft = differenceInCalendarDays(
    new Date(task.dueDate),
    new Date(),
  );
  const Icon = ICONS[task.category?.icon ?? "Tag"] ?? TagIcon;

  return (
    <>
      <div
        className={`relative w-full max-w-xs rounded-2xl bg-white p-4 shadow ${
          selected ? "border-2 border-blue-500" : "border"
        }`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* select square */}
        <div
          onClick={() => onSelect(task.id)}
          className={`absolute right-3 top-3 h-5 w-5 cursor-pointer rounded-sm border ${
            selected ? "bg-blue-500" : "bg-white"
          }`}
        />

        {/* title + desc */}
        <h3 className="mb-1 break-words text-lg font-semibold leading-snug">
          {task.title}
        </h3>
        {task.description && (
          <p className="line-clamp-2 text-sm text-gray-700">
            {task.description}
          </p>
        )}

        {/* date & time */}
        <div className="mt-3 flex items-center gap-2 text-sm font-medium">
          <CalendarIcon className="h-4 w-4" />
          {format(new Date(task.dueDate), "dd MMM yyyy")}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <ClockIcon className="h-4 w-4" />
          {format(new Date(task.dueDate), "HH:mm")}
        </div>

        {/* category */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4" />
          {task.category?.name ?? "Uncategorised"}
        </div>

        {/* due in */}
        <p
          className={`mt-2 text-center text-sm ${
            daysLeft <= 0 ? "text-red-500" : "text-gray-500"
          }`}
        >
          {daysLeft <= 0
            ? "Due today"
            : `Due in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`}
        </p>

        {/* progress bar demo */}
        <div className="mt-2 h-1 w-full rounded bg-rose-200">
          <div
            style={{ width: task.status === "completed" ? "100%" : "40%" }}
            className="h-full rounded bg-rose-400 transition-all"
          />
        </div>

        {/* action buttons */}
        <div className="mt-4 flex gap-2">
          {/* complete */}
          <button
            onClick={() =>
              onToggle(
                task.id,
                task.status === "completed" ? "incompleted" : "completed",
              )
            }
            className={`flex-1 rounded py-3 text-white ${
              task.status === "completed"
                ? "bg-gray-300"
                : "bg-emerald-500 hover:bg-emerald-600"
            }`}
          >
            <CheckIcon className="m-auto h-5 w-5" />
          </button>

          {/* edit / delete on hover */}
          {(hover || selected) && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex-1 rounded bg-sky-200 py-3 text-sky-800 hover:bg-sky-300"
              >
                <PencilIcon className="m-auto h-4 w-4" />
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Delete this task?")) return;
                  await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
                  onDeleted(task.id);
                }}
                className="flex-1 rounded bg-red-200 py-3 text-red-800 hover:bg-red-300"
              >
                <Trash2Icon className="m-auto h-4 w-4" />
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
