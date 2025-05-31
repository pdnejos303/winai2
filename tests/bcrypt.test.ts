import bcrypt from "bcryptjs";

describe("bcrypt.compare", () => {
  const pwd = "Abcd1234";
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash(pwd, 10);
  });

  it("คืน true เมื่อรหัสตรงกัน", async () => {
    expect(await bcrypt.compare(pwd, hash)).toBe(true);
  });

  it("คืน false เมื่อรหัสไม่ตรง", async () => {
    expect(await bcrypt.compare("wrong", hash)).toBe(false);
  });
});
