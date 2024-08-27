import { pgTable, uuid, boolean, varchar, jsonb, timestamp, index } from "drizzle-orm/pg-core";

import { users } from "./users.schema";
import type { NotificationType } from "@/types/notifications";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("user_id").unique().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type").notNull().$type<NotificationType>(),
    payload: jsonb("payload").notNull(),
    read: boolean("read").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("created_at", { withTimezone: true }),
  },
  (notifications) => ({
    userIdIdx: index("user_id_index").on(notifications.userId),
  }),
);

export type InsertUserActivity = typeof notifications.$inferInsert;

export type SelectUserActivity = typeof notifications.$inferSelect;
