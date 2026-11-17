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
  async findByEmail(email: string) {
    const { rows } = await pool.query(
      `SELECT id, email, name, role, password_hash FROM users WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  },
};
