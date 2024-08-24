#!/usr/bin/env node

import * as dotenv from "dotenv";

dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { activityTypes } from "@/db/schemas/activityTypes.schema";
import type { ActivityType } from "@/types/activtyType";

const data: ActivityType[] = [
  { id: "other" },
  { id: "padel" },
  { id: "tenis" },
  { id: "pingpong" },
  { id: "surf" },
  { id: "study" },
  { id: "videogames" },
  { id: "boardgames" },
  { id: "mtb" },
  { id: "driving" },
  { id: "cycling" },
  { id: "gym" },
  { id: "movie" },
  { id: "eating" },
];

(async function () {
  try {
    console.log("[>] Running activity types seeding");

    const db = drizzle(postgres(process.env.POSTGRES_URL as string, { max: 1 }));
    console.log("[>] Deleting previous values");

    await db.delete(activityTypes);

    console.log("[>] Adding new values");

    await db.insert(activityTypes).values(data);

    console.log("[>] Seeding successful");
    process.exit(0);
  } catch (error) {
    console.error("[!] Something went wrong: " + error);
    console.error(error);
    process.exit(1);
  }
})();
