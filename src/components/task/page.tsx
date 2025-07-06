/**
 * Tasks Page (simplified)
 * -----------------------
 * • แสดงปุ่ม + Add Task (มาจาก AddTaskModal เอง)
 * • สร้าง Task แล้วดึงรายการมาโชว์ใน list
 */

"use client";

import { useEffect, useState } from "react";
import AddTaskModal from "@/components/task/AddTaskModal";
import { Task } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- โหลด Task ---------- */
  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data: Task[] = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("fetchTasks error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ---------- callback หลังสร้าง Task ---------- */
  const handleCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  /* ---------------------------------------------------------------------- */
  /*  JSX                                                                    */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="px-4 py-6">
      {/* ปุ่ม + Add Task รวมอยู่ใน AddTaskModal แล้ว ⇒ วางมุมขวาบนได้เลย */}
      <div className="mb-6 flex justify-end">
        <AddTaskModal onCreated={handleCreated} />
      </div>

      {/* รายการงาน */}
      {loading ? (
        <p>Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500">No tasks yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="rounded-lg border p-4 shadow transition hover:bg-gray-50"
            >
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-sm text-gray-600">
                {new Date(t.dueDate).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
