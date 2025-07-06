/* ────────────────────────────────────────────────────────────────────────────
 * FILE:  src/middleware.ts
 * DESC:  Global Edge Middleware
 *        A) Locale guard + redirect  ( เฉพาะ “หน้าเว็บ” )
 *        B) DEV-only in-memory rate-limit (50 req / 60 s / IP) สำหรับ /api
 * CHANGELOG:
 *   • เปลี่ยน cast (req as NextRequest & { ip?: string }) แทน any
 * ──────────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";

/* ---------- A) Locale prefix ---------- */
const LOCALES = ["en", "th", "ja"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";

/* ---------- B) Rate-limit (DEV-only) ---------- */
type Hit = { count: number; ts: number };
const hits = new Map<string, Hit>();
const LIMIT = 50;
const WINDOW = 60_000; // ms

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* -----------------------------------------------------------
   * 0) ระบุว่า path /api* ให้ข้าม locale-redirect
   * ----------------------------------------------------------- */
  const isApi = pathname.startsWith("/api");
  const segments = pathname.split("/").filter(Boolean);
  const firstSeg = segments[0];

  /* ---------- 0.1  Locale guard  (เฉพาะหน้าเว็บ) ---------- */
  if (!isApi) {
    // / → /en
    if (!firstSeg) {
      const url = req.nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}`;
      return NextResponse.redirect(url);
    }

    // prefix ไม่ใช่ locale → redirect ไป /en/…
    if (!LOCALES.includes(firstSeg as Locale)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
      return NextResponse.redirect(url);
    }
  }

  /* -----------------------------------------------------------
   * 1) DEV rate-limit  (เฉพาะ /api  ยกเว้น /api/auth/*)
   * ----------------------------------------------------------- */
  if (isApi && !pathname.startsWith("/api/auth/")) {
    /* ดึง IP แบบ type-safe
       – Edge runtime บาง env มี field `ip`
       – ถ้าไม่มีให้ดึงจาก x-forwarded-for → เอาค่าแรก */
    const reqWithIP = req as NextRequest & { ip?: string };
    const ip =
      reqWithIP.ip ??
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const now = Date.now();
    const rec = hits.get(ip) ?? { count: 0, ts: now };

    if (now - rec.ts > WINDOW) {
      rec.count = 0;
      rec.ts = now;
    }
    rec.count += 1;
    hits.set(ip, rec);

    if (rec.count > LIMIT) {
      const headers = {
        "X-RateLimit-Limit": String(LIMIT),
        "X-RateLimit-Remaining": "0",
        "Retry-After": String(Math.ceil((WINDOW - (now - rec.ts)) / 1000)),
      } as const;

      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers },
      );
    }

    const res = NextResponse.next();
    res.headers.set("X-RateLimit-Limit", String(LIMIT));
    res.headers.set(
      "X-RateLimit-Remaining",
      String(Math.max(0, LIMIT - rec.count)),
    );
    return res;
  }

  /* -----------------------------------------------------------
   * 2) เส้นทางอื่น → ปล่อยผ่าน
   * ----------------------------------------------------------- */
  return NextResponse.next();
}

/* --------------------------------------------------------------------------
 *  จับทุก path ยกเว้น asset ระบบ (_next, static, ฯลฯ)
 * -------------------------------------------------------------------------- */
export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|images|static).*)"],
};
