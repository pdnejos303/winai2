// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/en/app/tasks/page.tsx
// DESC: หน้า Tasks – มีปุ่มเดียว กดครั้งเดียวเปิดฟอร์ม (ไม่มีปุ่มซ้อนอีก)
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { Task } from "@prisma/client";
import AddTaskModal from "@/components/task/AddTaskModal";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function TasksPage() {
  /* ---------- state ---------- */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  /* ---------- fetch tasks ---------- */
  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data: Task[] = await res.json();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchTasks();
  }, []);

  /* ---------- callback เมื่อสร้าง Task ---------- */
  const handleCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  /* ---------------------------------------------------------------------- */
  /* JSX                                                                    */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="px-4 py-6">
      {/* Top bar – ปุ่มเดียวเรียกโมดาล */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          + Add Task
        </button>
      </div>

      {/* รายการงานแบบง่าย */}
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

      {/* Modal controlled */}
      <AddTaskModal
        open={modalOpen}
        setOpen={setModalOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
