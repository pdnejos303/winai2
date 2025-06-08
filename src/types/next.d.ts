// src/types/next.d.ts
import 'next/server';

declare module 'next/server' {
  interface NextRequest {
    /** IP จาก Edge runtime (บางเวอร์ชันมี, บางเวอร์ชันไม่มี) */
    ip?: string | null;
  }
}
