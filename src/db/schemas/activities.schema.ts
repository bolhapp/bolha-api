import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  boolean,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

import type { ActivityRequestState } from "@/types/activity";
import { relations } from "drizzle-orm";
import { userActivities } from "./userActivities.schema";
import { users } from "./users.schema";
import { activityTypes } from "./activityTypes.schema";

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().unique().notNull().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    online: boolean("online").notNull(),
    address: varchar("address", { length: 256 }).notNull(),
    participants: varchar("participants", { length: 256 }).array(),
    maxParticipants: integer("max_participants").notNull(),
    difficulty: integer("difficulty").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    restrictions: text("restrictions"),
    extraDetails: text("extraDetails"),
    pics: varchar("pics", { length: 256 }).array(),
  },
  (activities) => ({
    onlineIdx: index("acitivity_online_idx").on(activities.online),
    difficultyIdx: index("activity_difficulty_idx").on(activities.difficulty),
  }),
);

export const activityRequests = pgTable("activity_requests", {
  id: uuid("id").unique().primaryKey().notNull().defaultRandom(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "no action" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "no action" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  state: varchar("state", { length: 8 }).$type<ActivityRequestState>().default("pending"),
  rejectedReason: text("rejected_reason"),
});

export const activityCategories = pgTable(
  "activity_categories",
  {
    activityTypeId: varchar("activity_type_id")
      .notNull()
      .references(() => activityTypes.id),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id),
  },
  (activityCategories) => ({
    idIdx: primaryKey({
      columns: [activityCategories.activityId, activityCategories.activityTypeId],
    }),
  }),
);

export const activityRequestsRelations = relations(activityRequests, ({ one }) => ({
  users: one(users, {
    fields: [activityRequests.userId],
    references: [users.id],
  }),
  activities: one(activities, {
    fields: [activityRequests.activityId],
    references: [activities.id],
  }),
}));

export const activityCategoriesRelations = relations(activityCategories, ({ one }) => ({
  activityTypes: one(activityTypes, {
    fields: [activityCategories.activityTypeId],
    references: [activityTypes.id],
  }),
  activities: one(activities, {
    fields: [activityCategories.activityId],
    references: [activities.id],
  }),
}));

export const activityRelations = relations(activities, ({ many }) => ({
  userActivities: many(userActivities),
  activityRequests: many(activityRequests),
  activityCategories: many(activityCategories),
}));

export type InsertActivity = typeof activities.$inferInsert;
export type SelectActivity = typeof activities.$inferSelect;
export type InsertActivityRequest = typeof activityRequests.$inferInsert;
export type SelectActivityRequest = typeof activityRequests.$inferSelect;
