-- Up Migration
CREATE TABLE movies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  language         TEXT NOT NULL,
  genre            TEXT,
  poster_url       TEXT,
  banner_url       TEXT,
  release_date     DATE,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Down Migration
DROP TABLE IF EXISTS movies;