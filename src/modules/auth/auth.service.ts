import { hash } from "@node-rs/argon2";
import { AppError } from "../../shared/errors";
import { authRepository } from "./auth.repository";

export const authService = {
  async register(input: { email: string; password: string; name: string }) {
    const passwordHash = await hash(input.password, {
      memoryCost: 19456, // 19 MiB of memory per hash
      timeCost: 2, // 2 passes
      parallelism: 1,
    });

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
