import { and, eq } from "drizzle-orm";

import { db } from ".";
import { activities, activityCategories } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { Activity, BaseActivity } from "@/types/activity";
import { PgColumn } from "drizzle-orm/pg-core";

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
      pics: activities.pics,
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
  userId?: string,
): Promise<Activity> => {
  const where = userId
    ? // when we're fully updating the activity, we need to make sure user owns it
      and(eq(activities.id, activityId), eq(activities.createdBy, userId))
    : // when we're just updating numParticipants or adding new pics after creating we don't need to
      eq(activities.id, activityId);

  const result = await db
    .update(activities)
    .set({ ...payload, updatedAt: new Date() })
    .where(where)
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
  const result = await db
    .delete(activities)
    .where(and(eq(activities.id, activityId), eq(activities.createdBy, userId)))
    .returning({ pics: activities.pics });

  if (!result[0]) {
    return null;
  }

  return result[0].pics;
};

export const getActivity = async (
  id: string,
  filter: Array<Array<string | any>> = [],
  fields: string[] = [],
) => {
  const result = await db
    .select({
      id: activities.id,
      ...fields.reduce<Record<string, PgColumn>>((result, field) => {
        // @ts-expect-error not really sure how to type this
        result[field] = activities[field];

        return result;
      }, {}),
    })
    .from(activities)
    // @ts-expect-error same issue as above
    .where(and(eq(activities.id, id), ...filter.map(([key, value]) => eq(activities[key], value))))
    .limit(1);

  return result.length ? result[0] : null;
};
