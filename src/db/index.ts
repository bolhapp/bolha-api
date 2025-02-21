import { drizzle } from "drizzle-orm/node-postgres";

import * as activitySchemas from "@/db/schemas/activities.schema";
import * as userSchemas from "@/db/schemas/users.schema";
import * as userActivitySchemas from "@/db/schemas/userActivities.schema";
import * as activityTypeSchemas from "@/db/schemas/activityTypes.schema";
import * as notificationsSchemas from "@/db/schemas/notifications.schema";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  throw Error("POSTGRES_URL not defined!");
}

export const db = drizzle({
  connection: {
    connectionString,
    ssl:
      process.env.NODE_ENV !== "development"
        ? { rejectUnauthorized: true, ca: process.env.DB_CA }
        : false,
  },
  logger: true,
  schema: {
    ...activitySchemas,
    ...userSchemas,
    ...userActivitySchemas,
    ...activityTypeSchemas,
    ...notificationsSchemas,
  },
});
