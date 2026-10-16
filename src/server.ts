import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger";
import { pool } from "./shared/db";
import { redis } from "./shared/redis";

const server = app.listen(env.PORT, () =>
  logger.info(`API listening on :${env.PORT}`),
);

async function shutdown(signal: string) {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await pool.end();
    await redis.quit();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref(); // force-exit if stuck
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
