-- Up Migration
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE shows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id    UUID NOT NULL REFERENCES movies(id) ON DELETE RESTRICT,
  screen_id   UUID NOT NULL REFERENCES screens(id) ON DELETE RESTRICT,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  price_paise INT NOT NULL CHECK (price_paise > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  EXCLUDE USING gist (
    screen_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  )
);

CREATE INDEX idx_shows_movie_start ON shows (movie_id, starts_at);

-- Down Migration
DROP TABLE IF EXISTS shows;