import { and, desc, eq, sql } from "drizzle-orm";

import { db } from ".";
import { activities, activityRequests } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { ActivityRequestState } from "@/types/activity";
import { userInterests, users } from "./schemas/users.schema";

const PAGE_SIZE = 25;

export const createActivityRequest = async (userId: string, activityId: string) => {
  const result = await db.insert(activityRequests).values({ userId, activityId }).returning({
    id: activityRequests.id,
    state: activityRequests.state,
    createdAt: activityRequests.createdAt,
  });

  return result[0];
};

export const updateActivityRequest = async (
  id: string,
  status: Partial<ActivityRequestState>,
  reason?: string,
) => {
  let request = null;

  await db.transaction(async (tx) => {
    const result = await tx
      .update(activityRequests)
      .set({ state: status, rejectedReason: reason })
      .where(eq(activityRequests.id, id))
      .returning({
        userId: activityRequests.userId,
        activityId: activityRequests.activityId,
        state: activityRequests.state,
        rejectedReason: activityRequests.rejectedReason,
      });

    if (!result[0]) {
      return null;
    }

    request = result[0];

    if (status === "accepted") {
      await Promise.all([
        tx
          .update(userActivities)
          .set({ userId: result[0].userId, activityId: result[0].activityId, host: false }),
        tx.update(activities).set({ numParticipants: sql`${activities.numParticipants} + 1` }),
      ]);
    }
  });

  return request;
};

export const deleteActivityRequest = async (activityId: string, userId: string) => {
  const result = await db
    .delete(activityRequests)
    .where(and(eq(activityRequests.activityId, activityId), eq(activityRequests.userId, userId)))
    .returning({
      userId: activityRequests.userId,
      activityId: activityRequests.activityId,
      state: activityRequests.state,
      rejectedReason: activityRequests.rejectedReason,
    });

  return result || null;
};

export const getActivityRequests = async (activityId: string, page: number) => {
  const result = await db
    .select({
      requestId: activityRequests.id,
      userId: users.id,
      name: users.name,
      bio: users.bio,
      photo: users.picUrl,
      gender: users.gender,
      birthday: users.birthday,
      skills: sql`
        COALESCE(
          ARRAY_AGG(
            jsonb_build_object('id', ${userInterests.activityTypeId}, 'skillLevel', ${userInterests.skillLevel}
          )
        ) 
        FILTER (WHERE ${userInterests.activityTypeId} IS NOT NULL), '{}')
      `.as("skills"),
    })
    .from(users)
    .leftJoin(userInterests, eq(userInterests.userId, users.id))
    .innerJoin(
      activityRequests,
      and(eq(activityRequests.activityId, activityId), eq(activityRequests.state, "pending")),
    )
    .groupBy(users.id, activityRequests.id, users.name)
    .orderBy(desc(activityRequests.createdAt))
    .limit(PAGE_SIZE)
    .offset(PAGE_SIZE * page);

  return result;
};
