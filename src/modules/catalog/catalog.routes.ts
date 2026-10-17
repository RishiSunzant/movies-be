import { Router } from "express";
import { catalogService } from "./catalog.service";

export const catalogRouter = Router();

catalogRouter.get("/movies", async (_req, res) => {
  const movies = await catalogService.listMovies();
  res.json(movies);
});
