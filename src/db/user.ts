import { hashSync } from "bcrypt";
import { and, asc, count, eq } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

import { db } from "./";
import { users } from "./schemas/users.schema";
import type { SelectUser } from "./schemas/users.schema";
// import type { BaseUser, User, UpdateUserPayload, UserContact } from "@/types/user";
// import { genToken } from "@/server/utils";

const SALT = 10;

export const getUser = async <T = SelectUser>(
  email: string,
  filter: Array<Array<string | any>> = [],
  fields: Record<string, PgColumn> = {},
): Promise<T | undefined> => {
  const result = await db
    .select({ email: users.email, ...fields })
    .from(users)
    .where(and(eq(users.email, email), ...filter.map(([key, value]) => eq(key, value))))
    .limit(1);

  return result.length ? (result[0] as T) : undefined;
};
