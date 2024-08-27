import { and, eq, sql } from "drizzle-orm";

import { db } from ".";
import { activities } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";

export const deleteUserActivity = async (activityId: string, userId: string, accepted: boolean) => {
  let result = null;

  await db.transaction(async (tx) => {
    const promises: any[] = [
      tx
        .delete(userActivities)
        .where(and(eq(userActivities.activityId, activityId), eq(userActivities.userId, userId))),
    ];

    // if user was already approved for activity, delete it there as well
    if (accepted) {
      promises.push(
        tx
          .update(activities)
          .set({ numParticipants: sql`${activities.numParticipants} - 1` })
          .where(eq(activities.id, activityId)),
      );
    }

    const resolved = await Promise.all(promises);

    result = resolved[0];
  });

  return result;
};
