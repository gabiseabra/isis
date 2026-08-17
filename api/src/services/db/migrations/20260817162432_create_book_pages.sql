-- migrate:up
CREATE TABLE pages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  media_id BIGINT NOT NULL REFERENCES media (id),
  book_id BIGINT NOT NULL REFERENCES books (id),
  page_number INT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, page_number)
);

-- migrate:down
DROP TABLE pages;
