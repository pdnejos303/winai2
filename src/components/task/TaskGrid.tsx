// Path: src/components/task/TaskGrid.tsx
"use client";

import { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import TaskFilters, { TaskFiltersState } from "./TaskFilters";
import AddTaskModal from "./AddTaskModal";
import { Task } from "@prisma/client";

/* ---------- ค่า filter เริ่มต้น ---------- */
const defaultFilters: TaskFiltersState = {
  status: "incompleted",
  urgency: "all",
  category: "all",
};

export default function TaskGrid() {
  /* ---------- local state ---------- */
  const [filters, setFilters] = useState<TaskFiltersState>(defaultFilters);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  /* ---------- ดึงรายการเมื่อ filters เปลี่ยน ---------- */
  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      const qs = new URLSearchParams();
      if (filters.status !== "all") qs.append("status", filters.status);
      if (filters.urgency !== "all") qs.append("urgency", filters.urgency);
      if (filters.category !== "all") qs.append("category", filters.category);
      const res = await fetch(`/api/tasks?${qs.toString()}`);
      const data: Task[] = await res.json();
      setTasks(data);
      setLoading(false);
    }
    fetchTasks();
  }, [filters]);

  /* ---------- toggle completed ---------- */
  async function toggleStatus(
    id: number,
    status: "completed" | "incompleted"
  ) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }

  /* ---------- หลังสร้าง task ---------- */
  function handleCreated(task: Task) {
    setTasks((prev) => [...prev, task].sort((a, b) => +a.dueDate - +b.dueDate));
  }

  /* ---------- หมวดหมู่ทั้งหมด ---------- */
  const categories = Array.from(new Set(tasks.map((t) => t.category)));

  /* ---------- render ---------- */
  return (
    <div className="space-y-6">
      {/* Filters + Add */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TaskFilters
          value={filters}
          onChange={setFilters}
          categories={categories}
        />
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-brand-green px-4 py-2 text-white font-medium hover:opacity-90 transition"
        >
          + Add Task
        </button>
      </div>

   {/* ── Grid of cards ─────────────────────── */}
      {loading ? (
        <p className="py-10 text-center">Loading…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleStatus} />
          ))}
        </div>
      )}

      {/* --------- Modal ---------- */}
      {modalOpen && (
        <AddTaskModal
          onCreated={(t) => {
            handleCreated(t);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
