import { POST as register } from "@/app/api/register/route";
import { NextResponse } from "next/server";

/** สร้าง Web Fetch Request พร้อม JSON body */
function buildReq(payload: unknown): Request {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("POST /api/register", () => {
  it("ส่ง 200 เมื่อลงทะเบียนสำเร็จ", async () => {
    const uniqueEmail = `jest${Date.now()}@example.com`; // กันซ้ำ
    const req = buildReq({ email: uniqueEmail, password: "Abcd1234" });

    const res = (await register(req)) as NextResponse;
    expect(res.status).toBe(200);
  });

  it("ส่ง 400 เมื่อข้อมูลไม่ผ่านวาลิด", async () => {
    const req = buildReq({ email: "bad", password: "123" });

    const res = (await register(req)) as NextResponse;
    expect(res.status).toBe(400);
  });
});
