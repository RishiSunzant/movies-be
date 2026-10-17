-- Up Migration
CREATE TABLE screens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theatre_id UUID NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  UNIQUE (theatre_id, name)
);

CREATE INDEX idx_screens_theatre ON screens (theatre_id);

-- Down Migration
DROP TABLE IF EXISTS screens;