import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export function signAccessToken(user: { id: string; role: string }) {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id, // the standard "sub" claim: who this token is for
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): { id: string; role: string } {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"],
    });
    if (typeof payload === "string" || !payload.sub)
      throw new Error("bad payload");
    return { id: payload.sub, role: String(payload.role) };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "TOKEN_EXPIRED", "Access token expired");
    }
    throw new AppError(401, "INVALID_TOKEN", "Invalid access token");
  }
}
