CREATE TABLE IF NOT EXISTS "activityTypes" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "activityTypes_id_unique" UNIQUE("id")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "activity_categories_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "user_interests_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "gender" DROP DEFAULT;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "activity_types_idx" ON "activityTypes" USING btree ("id");--> statement-breakpoint
ALTER TABLE "activities" DROP COLUMN IF EXISTS "categories";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "locations";