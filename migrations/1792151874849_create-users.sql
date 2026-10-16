-- Up Migration
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Down Migration
DROP TABLE IF EXISTS users;