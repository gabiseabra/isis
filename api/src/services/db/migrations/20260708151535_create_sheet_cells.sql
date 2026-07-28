-- migrate:up
CREATE TABLE sheet_cells (
  sheet_id BIGINT NOT NULL REFERENCES sheets (id) ON DELETE CASCADE,
  column_id BIGINT NOT NULL REFERENCES sheet_columns (id) ON DELETE CASCADE,
  row_id BIGINT NOT NULL REFERENCES sheet_rows (id) ON DELETE CASCADE,
  "value" JSON NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (column_id, row_id)
);

-- migrate:down
DROP TABLE sheet_cells;
