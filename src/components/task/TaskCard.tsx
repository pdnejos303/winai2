// Path: src/components/task/TaskCard.tsx
"use client";

import { Task } from "@prisma/client";
import { format, formatDistanceStrict } from "date-fns";
import { th } from "date-fns/locale";
import clsx from "clsx";

type Props = {
  task: Task;
  onToggle: (id: number, newStatus: "completed" | "incompleted") => void;
};

export default function TaskCard({ task, onToggle }: Props) {
  const done = task.status === "completed";
  const diff = formatDistanceStrict(task.dueDate, new Date(), {
    locale: th,
    roundingMethod: "floor",
  });

  return (
    <div className="rounded-tile border bg-brand-whiteTile p-6 shadow-sm">
      {/* Header */}
      <div className="flex justify-between">
        <h3 className="font-bold text-cardTitle">{task.title}</h3>
        <input
          type="checkbox"
          checked={done}
          onChange={() =>
            onToggle(task.id, done ? "incompleted" : "completed")
          }
          className="h-5 w-5 accent-brand-green"
        />
      </div>

      {/* Description */}
      <p className="line-clamp-3 py-2 text-sm text-gray-700">{task.description}</p>
      <hr className="my-3 border-gray-200" />

      <div className="space-y-1 text-xs">
        <div>
          {format(task.dueDate, "d MMMM yyyy", { locale: th })}(
          {format(task.dueDate, "(dd/MM/yyyy)", { locale: th })})
        </div>
        <div>{format(task.dueDate, "HH:mm")} – {format(task.dueDate, "HH:mm")}</div>
        <div>{task.category}</div>
      </div>

      <hr className="my-3 border-gray-200" />

      <p className="text-center text-sm font-medium">
        {done ? "Completed" : `Due in ${diff}`}
      </p>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-brand-progress/60 my-3" />

      <button
        onClick={() => onToggle(task.id, done ? "incompleted" : "completed")}
        className={clsx(
          "flex w-full items-center justify-center rounded-md py-3 text-lg",
          done
            ? "bg-brand-tick text-brand-green"
            : "bg-brand-tick hover:bg-brand-tick/80"
        )}
      >
        ✓
      </button>
    </div>
  );
}
