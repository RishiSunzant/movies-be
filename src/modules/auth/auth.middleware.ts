import { Request, Response, NextFunction } from "express";
import { AppError } from "../../shared/errors";
import { verifyAccessToken } from "./tokens";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "UNAUTHENTICATED", "Missing access token");
  }
  req.user = verifyAccessToken(header.slice("Bearer ".length));
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(
        403,
        "FORBIDDEN",
        "You do not have access to this resource",
      );
    }
    next();
  };
}
