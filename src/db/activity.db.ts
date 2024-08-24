import { eq, sql } from "drizzle-orm";

import { db } from ".";
import { activities, activityRequests, activityCategories } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { Activity, ActivityRequestState, BaseActivity } from "@/types/activity";

export const createActivity = async (userId: string, payload: BaseActivity): Promise<Activity> => {
  const result = await db.insert(activities).values(payload).returning({
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
