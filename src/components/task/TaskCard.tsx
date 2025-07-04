/* Path: src/components/task/TaskCard.tsx
   ---------------------------------------------------------------------------
   ✔ parseISO เพราะ API คืน string
   ✔ เลือก locale date-fns ให้ตรง /en /th /ja
   ------------------------------------------------------------------------- */
"use client";

import { Task } from "@prisma/client";
import { format, formatDistanceStrict, parseISO } from "date-fns";
import { th, ja, enUS } from "date-fns/locale";
import clsx from "clsx";
import { useParams } from "next/navigation";

type Props = {
  task: Task;
  onToggle: (id: number, newStatus: "completed" | "incompleted") => void;
};

export default function TaskCard({ task, onToggle }: Props) {
  const { locale } = useParams<{ locale: string }>();
  const dfLocale   = locale === "th" ? th : locale === "ja" ? ja : enUS;

  /* 🟢 ensure Date object */
  const due = typeof task.dueDate === "string" ? parseISO(task.dueDate) : task.dueDate;

  const done = task.status === "completed";
  const diff = formatDistanceStrict(due, new Date(), {
    locale: dfLocale,
    roundingMethod: "floor",
  });

  return (
    <div className="rounded-tile border bg-brand-whiteTile p-6 shadow-sm">
      {/* header */}
      <div className="flex justify-between">
        <h3 className="font-bold text-cardTitle">{task.title}</h3>
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(task.id, done ? "incompleted" : "completed")}
          className="h-5 w-5 accent-brand-green"
        />
      </div>

      <p className="line-clamp-3 py-2 text-sm text-gray-700">{task.description}</p>
      <hr className="my-3 border-gray-200" />

      <div className="space-y-1 text-xs">
        <div>{format(due, "d MMMM yyyy", { locale: dfLocale })}</div>
        <div>{format(due, "HH:mm")}</div>
        <div>{task.category}</div>
      </div>

      <hr className="my-3 border-gray-200" />

      <p className="text-center text-sm font-medium">
        {done ? "Completed" : `Due in ${diff}`}
      </p>

      <button
        onClick={() => onToggle(task.id, done ? "incompleted" : "completed")}
        className={clsx(
          "mt-3 flex w-full items-center justify-center rounded-md py-3 text-lg",
          done
            ? "bg-brand-tick text-brand-green"
            : "bg-brand-tick hover:bg-brand-tick/80",
        )}
      >
        ✓
      </button>
    </div>
  );
}
