import { randomBytes, scrypt } from "node:crypto";
import { AppError } from "../../shared/errors";
import { authRepository } from "./auth.repository";

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });

  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export const authService = {
  async register(input: { email: string; password: string; name: string }) {
    const passwordHash = await hashPassword(input.password);

    try {
      return await authRepository.createUser({
        email: input.email,
        passwordHash,
        name: input.name,
      });
    } catch (err: any) {
      if (err.code === "23505") {
        // Postgres: unique_violation
        throw new AppError(
          409,
          "EMAIL_TAKEN",
          "An account with this email already exists",
        );
      }
      throw err;
    }
  },
};
