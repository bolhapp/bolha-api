import { hash } from "argon2";
import { and, eq, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

import { db } from ".";
import { activities, activityCategories } from "./schemas/activities.schema";
import { userInterests, users } from "./schemas/users.schema";
import { userActivities } from "./schemas/userActivities.schema";
import type { SelectUser } from "./schemas/users.schema";
import type {
  User,
  UnregisteredUser,
  AccountConfirmationPayload,
  GetOwnActivitiesPayload,
} from "@/types/user";
import { getOrder } from "./utils";

const PAGE_SIZE = 25;

export const getUserForAuth = async (email: string) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      gender: users.gender,
      birthday: users.birthday,
      bio: users.bio,
      city: users.city,
      picUrl: users.picUrl,
      password: users.password,
      verified: users.verified,
    })
    .from(users)
    .where(and(eq(users.email, email)))
    .limit(1);

  return result.length ? result[0] : null;
};

export const getUser = async <T = SelectUser>(
  id: string,
  filter: Array<Array<string | any>> = [],
  fields: string[] = [],
): Promise<T | undefined> => {
  const result = await db
    .select({
      id: users.id,
      ...fields.reduce<Record<string, PgColumn>>((result, field) => {
        // @ts-expect-error not really sure how to type this
        result[field] = users[field];

        return result;
      }, {}),
    })
    .from(users)
    // @ts-expect-error same issue as above
    .where(and(eq(users.id, id), ...filter.map(([key, value]) => eq(users[key], value))))
    .limit(1);

  return result.length ? (result[0] as T) : undefined;
};

export const createUser = async (
  payload: UnregisteredUser,
  token: string,
): Promise<User | null> => {
  const interests = payload.interests ? payload.interests : [];

  delete payload.interests;

  const result = await db
    .insert(users)
    .values({
      ...payload,
      password: await hash(payload.password as string),
      token,
      // todo: remove when we add account confirmation
      verified: true,
    })
    .returning({ id: users.id, email: users.email });

  const newUser = result[0] as User;

  if (interests.length) {
    await db.transaction(async (tx) => {
      await tx
        .insert(userInterests)
        .values(interests.map((i) => ({ userId: newUser.id, activityTypeId: i })));
    });
  }

  return newUser;
};

export const verifyUser = async ({
  email,
  token,
}: AccountConfirmationPayload): Promise<boolean> => {
  const result = await db
    .update(users)
    .set({ verified: true, token: null })
    .where(and(eq(users.token, token), eq(users.email, email)));

    return (result.rowCount || 0) > 0;
  };

export const userExists = async (email: string): Promise<boolean> => {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(users)
    .where(eq(users.email, email));

    return (result[0].count as number) > 0;
};

export const updateUser = async (email: string, payload: Partial<User>) => {
  const result = await db.update(users).set(payload).where(eq(users.email, email)).returning({
    id: users.id,
    email: users.email,
    type: users.type,
    name: users.name,
    bio: users.bio,
    gender: users.gender,
    birthday: users.birthday,
    city: users.city,
    picUrl: users.picUrl,
  });

  return result[0];
};

export const getOwnActivities = async ({
  page,
  sortField,
  sortOrder,
  userId,
}: GetOwnActivitiesPayload) => {
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
    .where(eq(users.id, userId))
    // @ts-expect-error TS complains about sortField being "any"
    .orderBy(getOrder(sortOrder), activities[sortField])
    .limit(PAGE_SIZE)
    .offset(page * PAGE_SIZE);

  return results;
};
