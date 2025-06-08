/* --------------------------------------------------------------------------
 *  Edge Middleware – In-Memory Rate-Limit 5 req / 60 s ต่อ IP
 *  ✅ Dev-only (ใช้ Map ในเมมโมรี) — ถ้าจะ prod เปลี่ยนเป็น Redis / KV
 * -------------------------------------------------------------------------- */
import { NextRequest, NextResponse } from 'next/server';

/* ---------- ประเภท & สโตร์จำนวน Hit ---------- */
type Hit = { count: number; ts: number };
const hits = new Map<string, Hit>();   // key = ip

const LIMIT = 5;          // สูงสุด 5 ครั้ง
const WINDOW = 60_000;    // ต่อ 60 วินาที

export default function middleware(req: NextRequest) {
  /* ---------- 0) ข้าม rate-limit สำหรับ /api/auth/* ---------- */
  if (req.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  /* ---------- 1) ระบุตัวตน IP ---------- */
  const ip =
    req.ip ??                                        // Next.js 14+ (หลังเสริม type)
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown';

  const now = Date.now();
  const record = hits.get(ip) ?? { count: 0, ts: now };

  // ถ้าเกินหน้าต่าง 60 s ให้รีเซ็ต
  if (now - record.ts > WINDOW) {
    record.count = 0;
    record.ts = now;
  }

  // เพิ่มเคาน์เตอร์
  record.count += 1;
  hits.set(ip, record);

  /* ---------- 2) เกินลิมิต → 429 ---------- */
  if (record.count > LIMIT) {
    const headers = {
      'X-RateLimit-Limit': String(LIMIT),
      'X-RateLimit-Remaining': '0',
      'Retry-After': String(
        Math.ceil((WINDOW - (now - record.ts)) / 1000)
      ),
    } as const;

    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers }
    );
  }

  /* ---------- 3) ไม่เกินลิมิต → ผ่าน & ใส่ Header ---------- */
  const res = NextResponse.next();
  res.headers.set('X-RateLimit-Limit', String(LIMIT));
  res.headers.set(
    'X-RateLimit-Remaining',
    String(Math.max(0, LIMIT - record.count))
  );
  return res;
}

/* --------------------------------------------------------------------------
 *  ให้ middleware ทำงานเฉพาะเส้นทาง API ด้านล่าง
 * -------------------------------------------------------------------------- */
export const config = {
  matcher: ['/api/register', '/api/auth/:path*'],
};
