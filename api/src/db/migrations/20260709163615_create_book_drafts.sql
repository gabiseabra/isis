-- migrate:up
CREATE TABLE book_drafts (
  sheet_id BIGINT NOT NULL REFERENCES sheets (id) ON DELETE CASCADE,
  book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  row_id BIGINT NOT NULL REFERENCES sheet_rows (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id)
);

-- migrate:down
DROP TABLE book_drafts;
