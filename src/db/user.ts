import { hashSync } from "bcrypt";
import { and, asc, count, eq } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

import { db } from "./";
import { users } from "./schemas/users.schema";
import type { SelectUser } from "./schemas/users.schema";
import type { User, BaseUser, AccountConfirmationPayload } from "@/types/user";

const SALT = 10;

export const getUser = async <T = SelectUser>(
  email: string,
  filter: Array<Array<string | any>> = [],
  fields: string[] = [],
): Promise<T | undefined> => {
  const result = await db
    .select({
      email: users.email,
      ...fields.reduce<Record<string, PgColumn>>((result, field) => {
        // @ts-expect-error not really sure how to type this
        result[field] = users[field];

        return result;
      }, {}),
    })
    .from(users)
    // @ts-expect-error same issue as above
    .where(and(eq(users.email, email), ...filter.map(([key, value]) => eq(users[key], value))))
    .limit(1);

  return result.length ? (result[0] as T) : undefined;
};

export const createUser = async (payload: BaseUser, token: string): Promise<User | null> => {
  const result = await db
    .insert(users)
    .values({
      ...payload,
      password: hashSync(payload.password as string, SALT),
      token,
    })
    .returning({ id: users.id, verified: users.verified });

  return result[0] as User;
};

export const verifyUser = async ({
  email,
  token,
}: AccountConfirmationPayload): Promise<boolean> => {
  const result = await db
    .update(users)
    .set({ verified: true, token: null })
    .where(and(eq(users.token, token), eq(users.email, email)));

  return (result.count || 0) > 0;
};
