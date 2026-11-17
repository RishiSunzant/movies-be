import { Router } from "express";
import { authenticate, requireRole } from "../auth/auth.middleware";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN"));

adminRouter.get("/admin/ping", (req, res) => {
  res.json({ message: "admin access ok", userId: req.user!.id });
});
