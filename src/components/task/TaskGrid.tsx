/* -------------------------------------------------------------------------
   TaskGrid.tsx  – โหลด / แสดง / กรอง / CRUD Task
   -------------------------------------------------------------------------
   ฟีเจอร์เดิมทั้งหมด:
     ✓ Header + ปุ่ม +Category / Bulk-Delete
     ✓ TaskFilter  (keyword + categoryId + urgency)
     ✓ ปุ่ม +Task  → AddTaskModal
     ✓ กริด <TaskCard>  responsive (1-3 col)
     ✓ Callback onToggle / onUpdate / onDelete
   เปลี่ยนเฉพาะ:
     • TaskWithCat = Task & { category: Category|null }
     • ดึง API ที่ include category
     • ใช้ categoryId ตลอด (ตรง schema)
     • แก้ eslint no-unused-expressions (bulk-delete)
   ----------------------------------------------------------------------- */
"use client";

import { useEffect, useState } from "react";
import { Task, Category } from "@prisma/client";

import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import AddCategoryDialog from "./AddCategoryDialog";
import TaskFilter, { FilterState } from "./TaskFilter";

type TaskWithCat = Task & { category: Category | null };

export default function TaskGrid() {
  /* ---------------- state ---------------- */
  const [tasks, setTasks] = useState<TaskWithCat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openAdd, setOpenAdd] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    search: "",
    categoryId: "all",
    urgency: "all",
  });

  /* ------------- initial fetch ----------- */
  useEffect(() => {
    (async () => {
      const [t, c] = await Promise.all([
        fetch("/api/tasks").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ]);
      setTasks(t);           // ← API include category
      setCategories(c);
    })();
  }, []);

  /* ------------- helpers ----------------- */
  const addCategory = (c: Category) => setCategories((p) => [...p, c]);
  const addTask = (t: TaskWithCat) => setTasks((p) => [...p, t]);

  /* select toggle */
  const toggleSel = (id: number) =>
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  /* status toggle */
  const toggleStatus = (id: number, s: "completed" | "incompleted") =>
    setTasks((p) => p.map((x) => (x.id === id ? { ...x, status: s } : x)));

  /* remove */
  const removeTask = (id: number) => {
    setTasks((p) => p.filter((x) => x.id !== id));
    setSelected((p) => {
      const n = new Set(p);
      n.delete(id);
      return n;
    });
  };

  /* update */
  const updateTask = (u: TaskWithCat) =>
    setTasks((p) => p.map((x) => (x.id === u.id ? u : x)));

  /* ------------- filter logic ----------- */
  const kw = filter.search.toLowerCase();
  const visible = tasks.filter((t) => {
    const matchKw =
      kw === "" ||
      t.title.toLowerCase().includes(kw) ||
      (t.description ?? "").toLowerCase().includes(kw);
    const matchCat =
      filter.categoryId === "all" || t.categoryId === filter.categoryId;
    const matchUrg =
      filter.urgency === "all" || t.urgency === filter.urgency;
    return matchKw && matchCat && matchUrg;
  });

  /* ------------- UI ---------------------- */
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <div className="flex items-center gap-3">
          <AddCategoryDialog existing={categories} onCreated={addCategory}>
            <button className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700">
              + Category
            </button>
          </AddCategoryDialog>

          {selected.size > 0 && (
            <button
              onClick={async () => {
                if (!confirm(`Delete ${selected.size} selected tasks?`)) {
                  return;
                }
                await Promise.all(
                  Array.from(selected).map((id) =>
                    fetch(`/api/tasks/${id}`, { method: "DELETE" }),
                  ),
                );
                setTasks((p) => p.filter((t) => !selected.has(t.id)));
                setSelected(new Set());
              }}
              className="rounded bg-red-600 px-4 py-1 text-white hover:bg-red-700"
            >
              Delete&nbsp;({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <TaskFilter categories={categories} onChange={setFilter} />

      {/* +Task */}
      <button
        onClick={() => setOpenAdd(true)}
        className="mb-6 rounded bg-green-600 px-5 py-2 text-white hover:bg-green-700"
      >
        + Task
      </button>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {visible.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            selected={selected.has(t.id)}
            onSelect={toggleSel}
            onToggle={toggleStatus}
            onDeleted={removeTask}
            onUpdated={updateTask}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-8 text-center text-gray-500">
          ไม่พบงานตามตัวกรอง
        </p>
      )}

      {/* Modal */}
      <AddTaskModal
        open={openAdd}
        setOpen={setOpenAdd}
        categories={categories}
        onCreated={addTask}
      />
    </div>
  );
}
