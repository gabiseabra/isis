-- migrate:up
CREATE TABLE sheet_rows (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sheet_id BIGINT NOT NULL REFERENCES sheets (id) ON DELETE CASCADE,
  column_id BIGINT NOT NULL REFERENCES sheet_columns (id) ON DELETE CASCADE,
  "value" TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE sheet_rows;
