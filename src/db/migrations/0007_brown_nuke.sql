CREATE TABLE IF NOT EXISTS "notifications" (
	"user_id" uuid NOT NULL,
	"type" varchar NOT NULL,
	"payload" jsonb NOT NULL,
	"read" boolean NOT NULL,
	"created_at" timestamp with time zone,
	CONSTRAINT "notifications_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_index" ON "notifications" USING btree ("user_id");