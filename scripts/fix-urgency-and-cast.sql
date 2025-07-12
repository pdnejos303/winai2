/* ---------- 1. เคลียร์ค่าข้อความ → ตัวเลข (เป็น TEXT ชั่วคราว) ---------- */
UPDATE "Task" SET urgency = '3' WHERE urgency ILIKE 'urgent';
UPDATE "Task" SET urgency = '2' WHERE urgency ILIKE 'normal';
UPDATE "Task" SET urgency = '2' WHERE urgency ILIKE 'medium';   -- <— NEW LINE
UPDATE "Task" SET urgency = '1' WHERE urgency ILIKE 'low';
UPDATE "Task" SET urgency = '0' WHERE urgency IS NULL OR urgency = '' or urgency !~ '^[0-3]$';

/* ---------- 2. แปลงคอลัมน์ TEXT → INTEGER ------------------------------- */
ALTER TABLE "Task"
  ALTER COLUMN urgency TYPE INTEGER
  USING urgency::integer;
