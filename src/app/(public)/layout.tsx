// src/app/(public)/layout.tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ใช้ div ครอบแทน <body> เพื่อกำหนดพื้นหลังและสีตัวอักษร
  return <div className="bg-neutral-900 text-white min-h-screen antialiased">{children}</div>;
}
