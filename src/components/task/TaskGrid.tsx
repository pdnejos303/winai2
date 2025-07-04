/* Path: src/components/task/TaskGrid.tsx
   ---------------------------------------------------------------------------
   • requestId กัน fetch เก่าทับใหม่
   • ไม่ setTasks([]) ใน catch → กริดไม่ว่าง
   ------------------------------------------------------------------------- */
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import TaskCard from "./TaskCard";
import TaskFilters, { TaskFiltersState } from "./TaskFilters";
import AddTaskModal from "./AddTaskModal";
import { Task } from "@prisma/client";

const defaultFilters: TaskFiltersState = { status:"all", urgency:"all", category:"all" };

export default function TaskGrid() {
  const pathname = usePathname();
  const locale   = pathname.split("/")[1] || "en";
  const router   = useRouter();

  const [filters, setFilters] = useState(defaultFilters);
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [show,    setShow]    = useState(false);

  const reqId = useRef(0);

  useEffect(() => setFilters(defaultFilters), [locale]);

  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);

    (async () => {
      try {
        const qs = new URLSearchParams();
        if (filters.status  !== "all") qs.append("status",  filters.status);
        if (filters.urgency !== "all") qs.append("urgency", filters.urgency);
        if (filters.category!== "all") qs.append("category", filters.category);

        const res = await fetch("/api/tasks?" + qs.toString());
        if (res.status === 401) { router.replace(`/${locale}/login`); return; }

        const data = await res.json();
        if (id === reqId.current && Array.isArray(data)) setTasks(data);
      } catch (err) {
        console.error("fetch /api/tasks:", err);
        /* ❌ ไม่ setTasks([]) – คงรายการเดิมขณะ error */
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    })();
  }, [filters, locale, router]);

  async function toggleStatus(id: number, status: "completed" | "incompleted") {
    await fetch(`/api/tasks/${id}`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ status }),
    });
    setTasks(prev => prev.map(t => t.id===id ? { ...t, status } : t));
  }

  function handleCreated(task: Task) {
    setTasks(prev => [...prev, task].sort((a,b)=>+a.dueDate-+b.dueDate));
  }

  const categories = ["all", ...new Set(
    (Array.isArray(tasks) ? tasks : []).map(t => t.category ?? "none"),
  )];

  return (
    <div className="space-y-6">
      {/* filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TaskFilters value={filters} onChange={setFilters} categories={categories}/>
        <button onClick={() => setShow(true)}
                className="rounded-md bg-brand-green px-4 py-2 font-medium text-white hover:opacity-90">
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
          {tasks.map(t => (
            <TaskCard key={`${t.id}-${t.status}`} task={t} onToggle={toggleStatus}/>
          ))}
        </div>
      )}

      {show && (
        <AddTaskModal onCreated={t => { handleCreated(t); setShow(false); }}/>
      )}
    </div>
  );
}
