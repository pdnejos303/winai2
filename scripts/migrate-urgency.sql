UPDATE "Task" SET urgency = 3 WHERE urgency ILIKE 'urgent';
UPDATE "Task" SET urgency = 2 WHERE urgency ILIKE 'normal';
UPDATE "Task" SET urgency = 1 WHERE urgency ILIKE 'low';
UPDATE "Task" SET urgency = 0 WHERE urgency IS NULL OR urgency = '';


-- วิธี Run นะจ๊ะ
-- npx prisma db execute --file "./scripts/migrate-urgency.sql" --schema "./prisma/schema.prisma"
