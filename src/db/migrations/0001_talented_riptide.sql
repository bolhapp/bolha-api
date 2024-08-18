CREATE TABLE IF NOT EXISTS "activities" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone,
	"online" boolean NOT NULL,
	"address" varchar(256) NOT NULL,
	"categories" varchar(256)[] NOT NULL,
	"participants" varchar(256)[] NOT NULL,
	"max_participants" integer NOT NULL,
	"difficulty" varchar(15) NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"restrictions" text,
	"pics" varchar(256)[] NOT NULL,
	CONSTRAINT "activities_id_pk" PRIMARY KEY("id"),
	CONSTRAINT "activities_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_activities" (
	"user_id" uuid NOT NULL,
	"activity_id" uuid NOT NULL,
	CONSTRAINT "user_activities_user_id_activity_id_pk" PRIMARY KEY("user_id","activity_id")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "user_id_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "gender" SET DATA TYPE varchar(15);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "online_email_idx" ON "activities" USING btree ("online");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_categories_idx" ON "activities" USING btree ("categories");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "activity_difficulty_idx" ON "activities" USING btree ("difficulty");