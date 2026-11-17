import { pool } from "../../shared/db";

export const authRepository = {
  async createUser(input: {
    email: string;
    passwordHash: string;
    name: string;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, role, created_at`,
      [input.email, input.passwordHash, input.name],
    );
    return rows[0];
  },
};
