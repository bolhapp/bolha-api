DROP INDEX IF EXISTS "request_user_id_idx";--> statement-breakpoint
ALTER TABLE "activity_requests" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "request_user_id_idx" ON "activity_requests" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "activity_requests" DROP COLUMN IF EXISTS "requested_user_id";