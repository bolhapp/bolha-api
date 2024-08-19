ALTER TABLE "activities" ALTER COLUMN "pics" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "extraDetails" text;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_id_idx" ON "users" USING btree ("id");