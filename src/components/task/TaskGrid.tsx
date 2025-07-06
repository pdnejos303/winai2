// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskGrid.tsx
// DESC: Grid แสดง Task + Filter + Add
//       • PATCH status แล้วอัปเดต state ด้าน client
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import TaskCard from "./TaskCard";
import TaskFilters, { TaskFiltersState } from "./TaskFilters";
import AddTaskModal from "./AddTaskModal";
import { Task } from "@prisma/client";

/* ---------- default filter ---------- */
const defaultFilters: TaskFiltersState = {
  status: "all",
  urgency: "all",
  category: "all",
};

export default function TaskGrid() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const router = useRouter();

  const [filters, setFilters] = useState<TaskFiltersState>(defaultFilters);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const reqId = useRef(0);

  useEffect(() => setFilters(defaultFilters), [locale]);

  /* ---------- fetch list ---------- */
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
        const data = await res.json();
        if (id === reqId.current && Array.isArray(data)) setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    })();
  }, [filters, locale, router]);

  /* ---------- helpers ---------- */
  const categories = ["all", ...new Set(tasks.map((t) => t.category ?? "none"))];

  const toggleSelect = (id: number) =>
    setSelectedIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  /* ---------- PATCH status ---------- */
  async function handleToggle(
    id: number,
    status: "completed" | "incompleted",
  ) {
    // optimistic update
    setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("PATCH status failed:", err);
      /* ---- revert if fail ---- */               // FIX: ลบ , หลัง ) map
      setTasks((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                status: status === "completed" ? "incompleted" : "completed",
              }
            : x,
        ),
      );
      alert("Save failed");
    }
  }

  /* ---------- JSX ---------- */
  return (
    <div className="space-y-6">
      {/* BAR */}
      <div className="flex items-center justify-between gap-4">
        <TaskFilters
          value={filters}
          onChange={setFilters}
          categories={categories}
        />
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="text-sm text-blue-600">
              {selectedIds.length} selected
            </span>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-md bg-brand-green px-4 py-2 font-medium text-white hover:opacity-90"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* GRID */}
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
              selected={selectedIds.includes(t.id)}
              onSelect={toggleSelect}
              onToggle={handleToggle}
              onDeleted={(id) => {
                setTasks((p) => p.filter((x) => x.id !== id));
                setSelectedIds((p) => p.filter((x) => x !== id));
              }}
              onUpdated={(u) =>
                setTasks((p) => p.map((x) => (x.id === u.id ? u : x)))
              }
            />
          ))}
        </div>
      )}

      {/* MODAL ADD */}
      <AddTaskModal
        open={showAdd}
        setOpen={setShowAdd}
        onCreated={(t) =>
          setTasks((p) => [...p, t].sort((a, b) => +a.dueDate - +b.dueDate))
        }
      />
    </div>
  );
}
