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

import type { ActivityDifficulty } from "@/types/activity";
import { relations } from "drizzle-orm";
import { userActivities } from "./userActivities.schema";

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
    participants: varchar("participants", { length: 256 }).array().notNull(),
    maxParticipants: integer("max_participants").notNull(),
    difficulty: varchar("difficulty", { length: 15 }).notNull(),
    date: timestamp("date", { withTimezone: true }).notNull(),
    restrictions: text("restrictions"),
    extraDetails: text("restrictions"),
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
}));

export type InsertActivity = typeof activities.$inferInsert;

export type SelectActivity = typeof activities.$inferSelect;
