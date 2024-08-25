import { and, eq } from "drizzle-orm";

import { db } from ".";
import { activities, activityCategories } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { Activity, BaseActivity } from "@/types/activity";

export const createActivity = async (userId: string, payload: BaseActivity): Promise<Activity> => {
  const result = await db
    .insert(activities)
    .values({ ...payload, createdBy: userId })
    .returning({
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
    });

  const activity = result[0] as Activity;

  await db.transaction(async (tx) => {
    await tx.insert(userActivities).values({ userId, activityId: activity.id, host: true });

    if (payload.activityTypes.length) {
      await tx
        .insert(activityCategories)
        .values(payload.activityTypes.map((i) => ({ activityId: activity.id, activityTypeId: i })));
    }
  });

  return activity;
};

export const updateActivity = async (
  activityId: string,
  payload: Partial<Activity>,
): Promise<Activity> => {
  const result = await db
    .update(activities)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(activities.id, activityId))
    .returning({
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
      updatedAt: activities.updatedAt,
      pics: activities.pics,
    });

  return result[0] as Activity;
};

export const deleteActivity = async (activityId: string, userId: string) => {
  await db
    .delete(activities)
    .where(and(eq(activities.id, activityId), eq(activities.createdBy, userId)));
};
