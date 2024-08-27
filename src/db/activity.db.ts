import { and, eq, or, sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import { db } from ".";
import { activities, activityCategories } from "./schemas/activities.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { Activity, BaseActivity, GetActivitiesQuery } from "@/types/activity";
import { users } from "./schemas/users.schema";
import { getFieldQuery, getFreeInputQuery, getOrder } from "./utils";

const PAGE_SIZE = 25;

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

export const getActivities = async ({
  page,
  sortField,
  sortOrder,
  query,
  name,
  description,
  restrictions,
  extraDetails,
  activityType,
  maxParticipants,
  numParticipants,
  difficulty,
  userId,
}: GetActivitiesQuery & { userId?: string }) => {
  let conditions: any = [];

  // get activities for a specific user
  if (userId) {
    conditions.push(eq(users.id, userId));
  }

  if (query) {
    // doing fuzzy search
    conditions = [
      ...conditions,
      or(
        ...getFreeInputQuery(query, [
          activities.name,
          activities.description,
          activities.restrictions,
          activities.extraDetails,
          activityCategories.activityTypeId,
          activities.maxParticipants,
          activities.numParticipants,
          activities.difficulty,
        ]),
      ),
    ];
  } else {
    // searching specifically for a field
    const fieldQueries = getFieldQuery([
      { field: activities.name, value: name },
      { field: activities.description, value: description },
      { field: activities.restrictions, value: restrictions },
      { field: activities.extraDetails, value: extraDetails },
      { field: activityCategories.activityTypeId, value: activityType },
      { field: activities.maxParticipants, value: maxParticipants },
      { field: activities.numParticipants, value: numParticipants },
      { field: activities.difficulty, value: difficulty },
    ]);

    if (fieldQueries) {
      conditions = [...conditions, ...fieldQueries];
    }
  }

  const results = await db
    .select({
      id: activities.id,
      name: activities.name,
      createdAt: activities.createdAt,
      description: activities.description,
      date: activities.date,
      online: activities.online,
      address: activities.address,
      numParticipants: activities.numParticipants,
      maxParticipants: activities.maxParticipants,
      difficulty: activities.difficulty,
      restrictions: activities.restrictions,
      extraDetails: activities.extraDetails,
      updatedAt: activities.updatedAt,
      pics: activities.pics,
      host: sql`(
        SELECT jsonb_build_object('id', ${users.id}, 'name', ${users.name}, 'photo', ${users.picUrl}) 
        FROM users
        WHERE ${users.id} = ${activities.createdBy}      
      )`,
      activityTypes: sql`ARRAY_AGG(DISTINCT(${activityCategories.activityTypeId}))`,
      // groups users into the participants array
      // CASE with FILTER to only return values of users that exist
      // so we don't get a [{id: null, name: null}]
      participants: sql`
        ARRAY_AGG(
          CASE 
            WHEN ${users.id} IS NOT NULL AND ${userActivities.host} = false
            THEN jsonb_build_object('id', ${users.id}, 'name', ${users.name}, 'photo', ${users.picUrl}) 
            ELSE NULL 
          END
        ) 
        FILTER (WHERE ${users.id} IS NOT NULL)
      `,
    })
    .from(activities)
    .groupBy(users.id, activities.id)
    .leftJoin(
      userActivities,
      and(eq(activities.id, userActivities.activityId), eq(userActivities.host, false)),
    )
    .leftJoin(users, eq(userActivities.userId, users.id))
    .leftJoin(activityCategories, eq(activityCategories.activityId, activities.id))
    .where(and(...conditions))
    // @ts-expect-error TS complains about sortField being "any"
    .orderBy(getOrder(sortOrder), activities[sortField])
    .limit(PAGE_SIZE)
    .offset(page * PAGE_SIZE);

  return results;
};
