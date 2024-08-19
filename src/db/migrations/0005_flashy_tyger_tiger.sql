DROP INDEX IF EXISTS "activity_owner_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "request_user_id_idx" ON "activityRequests" USING btree ("requested_user_id");--> statement-breakpoint
ALTER TABLE "activityRequests" DROP COLUMN IF EXISTS "activity_owner_id";