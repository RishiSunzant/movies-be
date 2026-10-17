-- Up Migration

-- needed so booking_seats can reference the pair (id, show_id)
ALTER TABLE bookings
  ADD CONSTRAINT bookings_id_show_unique UNIQUE (id, show_id);

CREATE TABLE booking_seats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL,
  show_id     UUID NOT NULL,
  seat_id     UUID NOT NULL REFERENCES seats(id) ON DELETE RESTRICT,
  price_paise INT  NOT NULL CHECK (price_paise > 0),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (booking_id, show_id) REFERENCES bookings (id, show_id) ON DELETE RESTRICT,
  UNIQUE (booking_id, seat_id)
);

-- THE GUARD: one active hold per seat per show
CREATE UNIQUE INDEX uq_booking_seats_active_seat
  ON booking_seats (show_id, seat_id)
  WHERE is_active;

-- Down Migration
DROP TABLE IF EXISTS booking_seats;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_id_show_unique;