import { Router } from "express";
import { z } from "zod";
import { catalogService } from "./catalog.service";

export const catalogRouter = Router();

const movieIdParam = z.object({
  id: z.string().uuid(),
});

const showsQuery = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
    .refine((v) => {
      try {
        return new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v; // rejects 2026-02-31
      } catch {
        return false;
      }
    }, "not a real calendar date"),
});

catalogRouter.get("/movies", async (_req, res) => {
  const movies = await catalogService.listMovies();
  res.json(movies);
});

catalogRouter.get("/movies/:id/shows", async (req, res) => {
  const { id } = movieIdParam.parse(req.params);
  const { date } = showsQuery.parse(req.query);
  const shows = await catalogService.listShows(id, date);
  res.json(shows);
});
