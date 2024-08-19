DROP INDEX IF EXISTS "activity_id_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "request_user_id_idx";--> statement-breakpoint
ALTER TABLE "activity_requests" ADD CONSTRAINT "activity_requests_user_id_activity_id_pk" PRIMARY KEY("user_id","activity_id");