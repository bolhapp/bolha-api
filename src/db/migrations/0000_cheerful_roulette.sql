CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"verified" boolean DEFAULT false,
	"type" text DEFAULT 'user',
	"name" text,
	"gender" text DEFAULT 'prefer_not_say',
	"birthday" date,
	"token" varchar(128),
	"bio" text,
	"locations" text[],
	"hobbies" text[],
	"city" varchar(256),
	"pic_url" text,
	"pic_thumbnail_url" text,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_id_idx" ON "users" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_interests_idx" ON "users" USING btree ("locations");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_hobbies_idx" ON "users" USING btree ("hobbies");