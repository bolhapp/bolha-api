ALTER TABLE "activity_categories" DROP CONSTRAINT "activity_categories_activity_type_id_activity_types_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_categories" DROP CONSTRAINT "activity_categories_activity_id_activities_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_requests" DROP CONSTRAINT "activity_requests_activity_id_activities_id_fk";
--> statement-breakpoint
ALTER TABLE "activity_requests" DROP CONSTRAINT "activity_requests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_activities" DROP CONSTRAINT "user_activities_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_activities" DROP CONSTRAINT "user_activities_activity_id_activities_id_fk";
--> statement-breakpoint
ALTER TABLE "user_interests" DROP CONSTRAINT "user_interests_activity_type_id_activity_types_id_fk";
--> statement-breakpoint
ALTER TABLE "user_interests" DROP CONSTRAINT "user_interests_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "createdBy" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activities" ADD CONSTRAINT "activities_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_categories" ADD CONSTRAINT "activity_categories_activity_type_id_activity_types_id_fk" FOREIGN KEY ("activity_type_id") REFERENCES "public"."activity_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_categories" ADD CONSTRAINT "activity_categories_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_requests" ADD CONSTRAINT "activity_requests_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "activity_requests" ADD CONSTRAINT "activity_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_activity_type_id_activity_types_id_fk" FOREIGN KEY ("activity_type_id") REFERENCES "public"."activity_types"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
