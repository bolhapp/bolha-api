import { and, eq, sql } from "drizzle-orm";

import { db } from ".";
import { activities } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";

export const getUserActivities = async (userId: string) => {
  const result = await db
    .select({
      id: activities.id,
      name: activities.name,
      description: activities.description,
      createdAt: activities.createdAt,
      online: activities.online,
      address: activities.address,
      numParticipants: activities.numParticipants,
      maxParticipants: activities.maxParticipants,
      difficulty: activities.difficulty,
      date: activities.date,
      restrictions: activities.restrictions,
      extraDetails: activities.extraDetails,
    })
    .from(activities)
    .innerJoin(userActivities, eq(activities.id, userActivities.activityId))
    .where(eq(userActivities.userId, userId));

  return result;
};

export const deleteUserActivity = async (activityId: string, userId: string, accepted: boolean) => {
  const success = true;

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

    await Promise.all(promises);
  });

  return success;
};
