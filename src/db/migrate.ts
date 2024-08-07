import * as dotenv from "dotenv";

dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

(async function () {
  try {
    const db = drizzle(postgres(process.env.POSTGRES_URL as string, { max: 1 }));

    await migrate(db, { migrationsFolder: "./migrations" });

    console.log("Migration successful");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
