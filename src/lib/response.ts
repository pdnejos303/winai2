// src/lib/response.ts
import { NextResponse } from "next/server";

/**
 * ช่วยสร้าง JSON error response ให้สั้นลง
 * @param message  ข้อความ error
 * @param status   HTTP status code (default 500)
 */
export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
