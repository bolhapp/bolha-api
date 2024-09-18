import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as activitySchemas from "@/db/schemas/activities.schema";
import * as userSchemas from "@/db/schemas/users.schema";
import * as userActivitySchemas from "@/db/schemas/userActivities.schema";
import * as activityTypeSchemas from "@/db/schemas/activityTypes.schema";

const url = process.env.POSTGRES_URL;

if (!url) {
  throw Error("POSTGRES_URL not defined!");
}

export const db = drizzle(
  postgres(url, {
    ssl:
      process.env.NODE_ENV !== "development"
        ? { rejectUnauthorized: true, ca: process.env.DB_CA }
        : false,
  }),
  {
    logger: true,
    schema: {
      ...activitySchemas,
      ...userSchemas,
      ...userActivitySchemas,
      ...activityTypeSchemas,
    },
  },
);
