// Path: src/components/ui/ToastProvider.tsx
"use client";

import { Toaster } from "react-hot-toast";

/** ตัวเดียวพอสำหรับ toast */
export default function ToastProvider() {
  return <Toaster position="top-right" />;
}
