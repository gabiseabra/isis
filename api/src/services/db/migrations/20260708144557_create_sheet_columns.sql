-- migrate:up
CREATE TABLE sheet_columns (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sheet_id BIGINT NOT NULL REFERENCES sheets (id) ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT array[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE sheet_columns;
