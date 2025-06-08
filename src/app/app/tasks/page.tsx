// Path: src/app/app/tasks/page.tsx
import TaskGrid from "@/components/task/TaskGrid";

export const metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <TaskGrid />
    </main>
  );
}
