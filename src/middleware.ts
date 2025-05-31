/* --------------------------------------------------------------------------
 *  Edge Middleware – In-Memory Rate-Limit 5 req / 60 s ต่อ IP
 *  ใช้ได้กับ Next.js 13-15 (App Router)
 * -------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from 'next/server';

type Hit = { count: number; ts: number };
const hits = new Map<string, Hit>();      // เก็บในเมมโมรี (dev เท่านั้น)

const LIMIT = 5;          // ครั้ง
const WINDOW = 60_000;    // มิลลิวินาที (60 s)

export default function middleware(req: NextRequest) {
  /** ---------- 1) คำนวณคีย์ IP ---------- */
  const ip =
    req.ip ||                            // Next.js >= 13
    req.headers.get('x-forwarded-for') || 
    'unknown';

  const now = Date.now();
  const record = hits.get(ip) ?? { count: 0, ts: now };
  /* รีเซ็ตหน้าต่างถ้าครบ 60 s */
  if (now - record.ts > WINDOW) {
    record.count = 0;
    record.ts = now;
  }
  record.count += 1;
  hits.set(ip, record);

  /** ---------- 2) เกินลิมิต → 429 JSON ---------- */
  if (record.count > LIMIT) {
    const headers = {
      'X-RateLimit-Limit': String(LIMIT),
      'X-RateLimit-Remaining': '0',
      'Retry-After': String(Math.ceil((WINDOW - (now - record.ts)) / 1000)),
    };
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers });
  }

  /** ---------- 3) ผ่าน → next() และเพิ่ม header ---------- */
  const res = NextResponse.next();
  res.headers.set('X-RateLimit-Limit', String(LIMIT));
  res.headers.set(
    'X-RateLimit-Remaining',
    String(Math.max(0, LIMIT - record.count))
  );
  return res;
}

/* บอก Next ว่าให้ทำงานเฉพาะ route API เหล่านี้ */
export const config = {
  matcher: ['/api/register', '/api/auth/:path*'],
};
