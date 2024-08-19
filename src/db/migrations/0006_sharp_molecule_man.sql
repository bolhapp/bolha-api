ALTER TABLE "activityRequests" RENAME TO "activity_requests";--> statement-breakpoint
ALTER TABLE "activity_requests" DROP CONSTRAINT "activityRequests_id_unique";--> statement-breakpoint
ALTER TABLE "activity_requests" ADD CONSTRAINT "activity_requests_id_unique" UNIQUE("id");