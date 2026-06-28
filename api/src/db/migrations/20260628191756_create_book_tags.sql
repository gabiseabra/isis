-- migrate:up
CREATE TABLE books_tags (
  book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, tag)
);

-- migrate:down
DROP TABLE book_tags;
