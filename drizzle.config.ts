import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

const postgresUrl = process.env.POSTGRES_URL;

if (!postgresUrl) {
  throw Error("POSTGRES_URL not defined!");
}

export default {
  schema: "./src/db/schemas/*.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: postgresUrl,
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DB_CA,
    },
  },
} satisfies Config;
