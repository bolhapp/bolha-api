import { pgTable, uuid, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./users.schema";
import { activities } from "./activities.schema";

export const activityTypes = pgTable(
  "activityTypes",
  {
    id: uuid("id").unique().notNull().defaultRandom(),
  },
  (activityTypes) => ({
    idIdx: uniqueIndex("activity_types_idx").on(activityTypes.id),
  }),
);

export const activityTypesRelations = relations(activityTypes, ({ many }) => ({
  userIntersts: many(users),
  activityTypes: many(activities),
}));

export type InsertActivityType = typeof activityTypes.$inferInsert;
export type SelectActivityType = typeof activityTypes.$inferSelect;
