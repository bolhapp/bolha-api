import { pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { userInterests } from "./users.schema";
import { activityCategories } from "./activities.schema";

export const activityTypes = pgTable("activity_types", {
  id: uuid("id").unique().notNull().defaultRandom(),
});

export const activityTypesRelations = relations(activityTypes, ({ many }) => ({
  userInterests: many(userInterests),
  activityCategories: many(activityCategories),
}));

export type InsertActivityType = typeof activityTypes.$inferInsert;
export type SelectActivityType = typeof activityTypes.$inferSelect;
