import { pgTable, uuid, primaryKey, boolean } from "drizzle-orm/pg-core";

import { users } from "./users.schema";
import { activities } from "./activities.schema";
import { relations } from "drizzle-orm";

export const userActivities = pgTable(
  "user_activities",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    host: boolean("host").notNull(),
  },
  (userActivities) => ({
    idIdx: primaryKey({ columns: [userActivities.userId, userActivities.activityId] }),
  }),
);

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  activities: one(activities, {
    fields: [userActivities.activityId],
    references: [activities.id],
  }),

  users: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

export type InsertUserActivity = typeof userActivities.$inferInsert;

export type SelectUserActivity = typeof userActivities.$inferSelect;
