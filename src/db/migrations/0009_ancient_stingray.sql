DROP INDEX IF EXISTS "user_hobbies_idx";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "hobbies";