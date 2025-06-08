// Path: src/components/task/TaskBoard.tsx
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
  const [modalOpen, setModalOpen] = useState(false);

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

      {/* Grid (stand-alone – ไม่ต้องส่ง props) */}
      <TaskGrid />

      {/* Modal */}
      {modalOpen && (
        <AddTaskModal
          onCreated={(t) => {
            setTasks((prev) => [...prev, t]);
            setModalOpen(false);
          }}
        />
      )}
    </>
  );
}
