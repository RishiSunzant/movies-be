import { Router } from "express";
import { z } from "zod";
import { authService } from "./auth.service";

export const authRouter = Router();

const registerBody = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(1).max(100),
});

authRouter.post("/auth/register", async (req, res) => {
  const body = registerBody.parse(req.body);
  const user = await authService.register(body);
  res.status(201).json(user);
});
