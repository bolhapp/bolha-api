CREATE TABLE IF NOT EXISTS "activityRequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"activity_owner_id" uuid NOT NULL,
	"requested_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"state" varchar(8) DEFAULT 'pending',
	"rejected_reason" text,
	CONSTRAINT "activityRequests_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "activity_id_idx" ON "activityRequests" USING btree ("activity_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "activity_owner_id_idx" ON "activityRequests" USING btree ("activity_owner_id");