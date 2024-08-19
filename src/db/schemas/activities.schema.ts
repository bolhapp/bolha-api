import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
  boolean,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

import type { ActivityDifficulty, ActivityRequestState } from "@/types/activity";
import { relations } from "drizzle-orm";
import { userActivities } from "./userActivities.schema";
import { users } from "./users.schema";

export const ACTIVITY_DIFICULTY: Readonly<[ActivityDifficulty, ...ActivityDifficulty[]]> = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
  "professional",
];

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").unique().notNull().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    online: boolean("online").notNull(),
    address: varchar("address", { length: 256 }).notNull(),
    categories: varchar("categories", { length: 256 }).array().notNull(),
    participants: varchar("participants", { length: 256 }).array(),
    maxParticipants: integer("max_participants").notNull(),
    difficulty: varchar("difficulty", { length: 15 }).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    restrictions: text("restrictions"),
    extraDetails: text("extraDetails"),
    pics: varchar("pics", { length: 256 }).array(),
  },
  (activities) => ({
    idIdx: primaryKey({ columns: [activities.id] }),
    onlineIdx: uniqueIndex("online_email_idx").on(activities.online),
    categoriesIdx: index("activity_categories_idx").on(activities.categories),
    difficultyIdx: index("activity_difficulty_idx").on(activities.difficulty),
  }),
);

export const activityRelations = relations(activities, ({ many }) => ({
  createdUserId: many(userActivities),
  requestId: many(activityRequests),
}));

export const activityRequests = pgTable(
  "activity_requests",
  {
    id: uuid("id").primaryKey().unique().notNull().defaultRandom(),
    activityId: uuid("activity_id").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    state: varchar("state", { length: 8 }).$type<ActivityRequestState>().default("pending"),
    rejectedReason: text("rejected_reason"),
  },
  (acitivityRequest) => ({
    idIdx: primaryKey({ columns: [acitivityRequest.userId, acitivityRequest.activityId] }),
  }),
);

export const activityRequestsRelations = relations(activityRequests, ({ many }) => ({
  activityId: many(activities),
  requestedUserId: many(users),
}));

export type InsertActivity = typeof activities.$inferInsert;
export type SelectActivity = typeof activities.$inferSelect;
export type InsertActivityRequest = typeof activityRequests.$inferInsert;
export type SelectActivityRequest = typeof activityRequests.$inferSelect;
