import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export function signAccessToken(user: { id: string; role: string }) {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id, // the standard "sub" claim: who this token is for
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  });
}
