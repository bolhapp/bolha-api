import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";
import { date } from "drizzle-orm/pg-core";

import type { UserType, UserGender, UserAvailbility } from "@/types/user";
import { relations } from "drizzle-orm";
import { userActivities } from "./userActivities.schema";
import { activityRequests } from "./activities.schema";
import { activityTypes } from "./activityTypes.schema";

export const USER_TYPES: Readonly<[UserType, ...UserType[]]> = ["user", "admin"];

export const USER_GENDER: Readonly<[UserGender, ...UserGender[]]> = [
  "male",
  "female",
  "other",
  "prefer_not_say",
];

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().unique().notNull().defaultRandom(),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    verified: boolean("verified").default(false),
    type: text("type").$type<UserType>().default("user"),

    name: text("name"),
    gender: varchar("gender", { length: 15 }).$type<UserGender>(),
    birthday: date("birthday"),
    token: varchar("token", { length: 128 }),
    bio: text("bio"),
    city: varchar("city", { length: 256 }),
    picUrl: text("pic_url"),
    picThumbnailUrl: text("pic_thumbnail_url"),
    // availabilities: json("availabilities").$type<UserAvailbility>().default({}),
  },
  (users) => ({
    idIdx: uniqueIndex("user_id_idx").on(users.id),
    emailIdx: uniqueIndex("user_email_idx").on(users.email),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  activities: many(userActivities),
  activityRequestId: many(activityRequests),
  interests: many(activityTypes),
}));

export type InsertUser = typeof users.$inferInsert;

export type SelectUser = typeof users.$inferSelect;
