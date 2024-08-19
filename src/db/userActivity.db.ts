import { eq } from "drizzle-orm";

import { db } from "./";
import { activities } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";

export const createUserActivity = async (userId: string, activityId: string) => {
  await db.insert(userActivities).values({ userId, activityId });
};

export const getUserActivities = async (userId: string) => {
  const result = await db
    .select({
      id: activities.id,
      name: activities.name,
      description: activities.description,
      createdAt: activities.createdAt,
      online: activities.online,
      address: activities.address,
      categories: activities.categories,
      participants: activities.participants,
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
