-- migrate:up
CREATE TABLE book_pages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  media_id BIGINT NOT NULL REFERENCES media_entries (id),
  book_id BIGINT NOT NULL REFERENCES books (id),
  page_number INT NOT NULL,
  page_type VARCHAR(255) NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, page_number)
);

CREATE INDEX idx_book_pages_page_number ON book_pages (page_number);

-- migrate:down
DROP TABLE book_pages;
