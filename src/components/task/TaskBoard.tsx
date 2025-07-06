// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/components/task/TaskBoard.tsx
// DESC: Board ที่มี Tile “Add Task”  -> เปิดโมดาลครั้งเดียว
// CHANGE:
//   • เพิ่ม modalOpen, setModalOpen  ส่งให้ <AddTaskModal>
//   • เดิมใส่ modal แบบ &&   → TS2739  (ขาด prop)  แก้เรียบร้อย
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import TaskTile from "./TaskTile";
import TaskFilters, { TaskFiltersState } from "./TaskFilters";
import TaskGrid from "./TaskGrid";
import AddTaskModal from "./AddTaskModal";
import { Task } from "@prisma/client";

export default function TaskBoard() {
  /* ---------- local state ---------- */
  const [filters, setFilters] = useState<TaskFiltersState>({
    status: "incompleted",
    urgency: "all",
    category: "all",
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false); // CHANGE: state คุมโมดาล

  /* ---------- derived ---------- */
  const categories = Array.from(new Set(tasks.map((t) => t.category)));

  return (
    <>
      {/* Tiles row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TaskTile
          color="green"
          label="Add Task"
          onClick={() => setModalOpen(true)}
        />
        <TaskTile
          color="yellow"
          label="Text To Task"
          onClick={() => alert("TODO")}
        />
      </div>

      {/* Filter bar */}
      <div className="pt-10">
        <TaskFilters
          value={filters}
          onChange={setFilters}
          categories={categories}
        />
      </div>

      {/* Grid */}
      <TaskGrid />

      {/* Modal (controlled) */}
      <AddTaskModal
        open={modalOpen}               // CHANGE
        setOpen={setModalOpen}         // CHANGE
        onCreated={(t) => {
          setTasks((prev) => [...prev, t]);
        }}
      />
    </>
  );
}
