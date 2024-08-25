import { and, eq, sql } from "drizzle-orm";

import { db } from ".";
import { activities, activityRequests } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { ActivityRequestState } from "@/types/activity";

export const createActivityRequest = async (userId: string, activityId: string) => {
  const result = await db.insert(activityRequests).values({ userId, activityId }).returning({
    id: activityRequests.id,
    state: activityRequests.state,
    createdAt: activityRequests.createdAt,
  });

  return result[0];
};

export const updateActivityRequest = async (
  activityId: string,
  status: Partial<ActivityRequestState>,
  reason?: string,
) => {
  let success = false;
  await db.transaction(async (tx) => {
    const result = await tx
      .update(activityRequests)
      .set({ state: status, rejectedReason: reason })
      .where(eq(activityRequests.activityId, activityId))
      .returning({ userId: activityRequests.userId });

    if (result[0]) {
      success = true;
    }

    if (status === "accepted") {
      await Promise.all([
        tx.update(userActivities).set({ userId: result[0].userId, activityId, host: false }),
        tx.update(activities).set({ numParticipants: sql`${activities.numParticipants} + 1` }),
      ]);
    }
  });

  return success;
};

