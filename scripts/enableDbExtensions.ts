#!/usr/bin/env node

import * as dotenv from "dotenv";

dotenv.config();

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

(async function () {
  try {
    console.log("[>] Enabling db extensions ");

    const db = drizzle(postgres(process.env.POSTGRES_URL as string, { max: 1 }));
    console.log("[>] Enabling unaccent...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS unaccent;`);
    console.log("[>] DB extensions enabled");
    process.exit(0);
  } catch (error) {
    console.error("[!] Something went wrong: " + error);
    console.error(error);
    process.exit(1);
  }
})();
