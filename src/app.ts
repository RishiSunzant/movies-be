import express from "express";
import pinoHttp from "pino-http";
import { logger } from "./shared/logger";
import { pool } from "./shared/db";
import { redis } from "./shared/redis";
import { catalogRouter } from "./modules/catalog/catalog.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "./shared/errors";

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
app.use("/api/v1", authRouter);
app.use("/api/v1", adminRouter);

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      issues: err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ error: err.code, message: err.message });
  }

  req.log.error(err); // full details go to our logs only
  res.status(500).json({ error: "INTERNAL_ERROR" }); // the client gets nothing sensitive
});
