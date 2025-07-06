// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskGrid.tsx
// DESC: Grid แสดง Task + ปุ่ม “+ Add Task”  ด้านขวา
// CHANGE:
//   • ใช้ state show, setShow  ↔  ส่งเข้า <AddTaskModal open …> 
//   • ไม่ใช้ && AddTaskModal  แบบเดิม  -> แก้ TS2739
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import TaskCard from "./TaskCard";
import TaskFilters, { TaskFiltersState } from "./TaskFilters";
import AddTaskModal from "./AddTaskModal";
import { Task } from "@prisma/client";

const defaultFilters: TaskFiltersState = {
  status: "all",
  urgency: "all",
  category: "all",
};

export default function TaskGrid() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const router = useRouter();

  const [filters, setFilters] = useState(defaultFilters);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);     // CHANGE: คุมโมดาล

  const reqId = useRef(0);

  useEffect(() => setFilters(defaultFilters), [locale]);

  /* -------- fetch tasks (โค้ดเดิม) -------- */
  /*   … (ย่อเฉพาะส่วน fetch เพื่อประหยัดบรรทัด – แต่ *ไม่มี* การตัด logic) */
  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    (async () => {
      try {
        const qs = new URLSearchParams();
        if (filters.status !== "all") qs.append("status", filters.status);
        if (filters.urgency !== "all") qs.append("urgency", filters.urgency);
        if (filters.category !== "all") qs.append("category", filters.category);

        const res = await fetch("/api/tasks?" + qs.toString(), {
          cache: "no-store",
        });
        if (res.status === 401) {
          router.replace(`/${locale}/login`);
          return;
        }
        if (!res.ok) {
          console.error("fetch /api/tasks:", res.status);
          return;
        }
        const data = await res.json();
        if (id === reqId.current && Array.isArray(data)) setTasks(data);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    })();
  }, [filters, locale, router]);

  /* -------- helpers -------- */
  function handleCreated(task: Task) {
    setTasks((prev) => [...prev, task].sort((a, b) => +a.dueDate - +b.dueDate));
  }

  const categories = [
    "all",
    ...new Set(
      (Array.isArray(tasks) ? tasks : []).map((t) => t.category ?? "none"),
    ),
  ];

  /* -------- JSX -------- */
  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TaskFilters
          value={filters}
          onChange={setFilters}
          categories={categories}
        />
        <button
          onClick={() => setShow(true)}
          className="rounded-md bg-brand-green px-4 py-2 font-medium text-white hover:opacity-90"
        >
          + Add Task
        </button>
      </div>

      {/* grid / loading / empty */}
      {loading && tasks.length === 0 ? (
        <p className="py-10 text-center">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="py-10 text-center text-gray-500">No tasks found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((t) => (
            <TaskCard
              key={`${t.id}-${t.status}`}
              task={t}
              onToggle={(id, status) => {
                setTasks((prev) =>
                  prev.map((x) => (x.id === id ? { ...x, status } : x)),
                );
              }}
            />
          ))}
        </div>
      )}

      {/* Modal (controlled) */}
      <AddTaskModal
        open={show}             // CHANGE
        setOpen={setShow}       // CHANGE
        onCreated={handleCreated}
      />
    </div>
  );
}
