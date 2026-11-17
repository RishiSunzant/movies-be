import { AppError } from "../../shared/errors";
import { authRepository } from "./auth.repository";
import { hash, verify } from "@node-rs/argon2";
import { signAccessToken, ACCESS_TOKEN_TTL_SECONDS } from "./tokens";

const ARGON_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

// A real hash of a throwaway password, used to keep timing equal when the email doesn't exist
const dummyHash = hash("not-a-real-password", ARGON_OPTIONS);

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

  async login(input: { email: string; password: string }) {
    const user = await authRepository.findByEmail(input.email);

    // Always do a hash verification, even for unknown emails, so response time doesn't reveal which emails exist
    const hashToCheck = user ? user.password_hash : await dummyHash;
    const passwordOk = await verify(hashToCheck, input.password);

    if (!user || !passwordOk) {
      throw new AppError(
        401,
        "INVALID_CREDENTIALS",
        "Incorrect email or password",
      );
    }

    return {
      accessToken: signAccessToken(user),
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
};
