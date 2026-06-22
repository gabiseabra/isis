-- migrate:up
CREATE TABLE sessions (
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  jwt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE sessions;
