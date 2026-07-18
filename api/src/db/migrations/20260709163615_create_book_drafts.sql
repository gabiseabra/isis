-- migrate:up
CREATE TABLE book_drafts (
  book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  sheet_id BIGINT NOT NULL REFERENCES sheets (id) ON DELETE CASCADE,
  row_id BIGINT NOT NULL REFERENCES sheet_rows (id) ON DELETE CASCADE,
  deleted_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (book_id, row_id)
);

-- For rows where applied_at IS NULL AND deleted_at IS NULL, each book_id can appear only once.
CREATE UNIQUE INDEX book_drafts_one_active_per_book_idx
  ON book_drafts (book_id)
  WHERE applied_at IS NULL AND deleted_at IS NULL;

-- A single row cannot have both applied_at and deleted_at.
ALTER TABLE book_drafts
  ADD CONSTRAINT book_drafts_not_applied_and_deleted_check
  CHECK (NOT (applied_at IS NOT NULL AND deleted_at IS NOT NULL));

-- migrate:down
DROP TABLE book_drafts;
