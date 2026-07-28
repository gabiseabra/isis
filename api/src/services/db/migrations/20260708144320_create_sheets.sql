-- migrate:up
CREATE TABLE sheets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "file_name" TEXT NOT NULL,
  "file_hash" CHAR(32) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE sheets;
