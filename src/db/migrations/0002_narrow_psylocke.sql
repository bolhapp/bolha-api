ALTER TABLE "activity_requests" DROP CONSTRAINT "activity_requests_activity_id_activities_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_requests" ADD CONSTRAINT "activity_requests_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
