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

  async listShows(movieId: string, date: string) {
    const { rows } = await pool.query(
      `SELECT s.id, s.starts_at, s.ends_at, s.price_paise,
              sc.id   AS screen_id,   sc.name AS screen_name,
              t.id    AS theatre_id,  t.name  AS theatre_name, t.address
       FROM shows s
       JOIN screens  sc ON sc.id = s.screen_id
       JOIN theatres t  ON t.id  = sc.theatre_id
       WHERE s.movie_id = $1
         AND t.is_active = true
         AND s.starts_at >= ($2::date)::timestamp       AT TIME ZONE 'Asia/Kolkata'
         AND s.starts_at <  ($2::date + 1)::timestamp   AT TIME ZONE 'Asia/Kolkata'
       ORDER BY t.name, sc.name, s.starts_at`,
      [movieId, date],
    );
    return rows;
  },
};
