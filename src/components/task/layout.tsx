// Path: src/app/app/tasks/layout.tsx
import "../globals.css";                  // <– ถ้า globals อยู่สูงกว่าให้ปรับ path
export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-cream text-gray-900">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-10">{children}</div>
    </div>
  );
}
