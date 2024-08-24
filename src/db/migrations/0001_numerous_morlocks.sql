DROP INDEX IF EXISTS "online_email_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "acitivity_online_idx" ON "activities" USING btree ("online");