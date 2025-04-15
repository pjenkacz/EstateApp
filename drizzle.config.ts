import type { Config } from "drizzle-kit";

export default {
  schema: "./server/db/schema/*",
  out: "./server/db/migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;