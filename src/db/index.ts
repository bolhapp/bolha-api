import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const url = process.env.POSTGRES_URL;

if (!url) {
  throw Error("POSTGRES_URL not defined!");
}

export const db = drizzle(postgres(url), {
  logger: true,
  schema: {},
});
