-- Up Migration
CREATE TABLE seats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id   UUID NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  row_label   TEXT NOT NULL,
  seat_number INT  NOT NULL CHECK (seat_number > 0),
  seat_type   TEXT NOT NULL DEFAULT 'REGULAR'
              CHECK (seat_type IN ('REGULAR', 'PREMIUM', 'RECLINER')),
  grid_row    INT  NOT NULL CHECK (grid_row >= 0),
  grid_col    INT  NOT NULL CHECK (grid_col >= 0),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (screen_id, row_label, seat_number),
  UNIQUE (screen_id, grid_row, grid_col)
);

-- Down Migration
DROP TABLE IF EXISTS seats;