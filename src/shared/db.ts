import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10, // connection pool size, we'll revisit this when we load test
  idleTimeoutMillis: 30_000,
});
