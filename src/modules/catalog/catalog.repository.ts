import { pool } from "../../shared/db";

export const catalogRepository = {
  async listActiveMovies() {
    const { rows } = await pool.query(
      `SELECT id, title, description, duration_minutes, language, genre, poster_url, banner_url, release_date
       FROM movies
       WHERE is_active = true
       ORDER BY release_date DESC NULLS LAST, title`,
    );
    return rows;
  },
};
