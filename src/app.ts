import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./shared/logger";
import { pool } from "./shared/db";
import { redis } from "./shared/redis";
import { catalogRouter } from "./modules/catalog/catalog.routes";
export const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await Promise.all([pool.query("SELECT 1"), redis.ping()]);
    res.json({ status: "ok" });
  } catch (err) {
    res.status(503).json({ status: "unhealthy" });
  }
});
app.use("/api/v1", catalogRouter);
