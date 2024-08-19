import { eq } from "drizzle-orm";
import { db } from ".";
import { activities, activityRequests } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { Activity, BaseActivity } from "@/types/activity";

export const createActivity = async (userId: string, payload: BaseActivity): Promise<Activity> => {
  const result = await db.insert(activities).values(payload).returning({
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
  });

  const activity = result[0] as Activity;

  await db.insert(userActivities).values({ userId, activityId: activity.id });

  return activity;
};

export const updateActivity = async (
  activityId: string,
  payload: Partial<Activity>,
): Promise<Activity> => {
  const result = await db
    .update(activities)
    .set({ ...payload, updatedAt: new Date() })
    .returning({
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
      updatedAt: activities.updatedAt,
      pics: activities.pics,
    })
    .where(eq(activities.id, activityId));

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

export const createActivityRequest = async (userId: string, activityId: string) => {
  const result = await db.insert(activityRequests).values({ userId, activityId }).returning({
    id: activityRequests.id,
    state: activityRequests.state,
    createdAt: activityRequests.createdAt,
  });

  return result[0];
};
