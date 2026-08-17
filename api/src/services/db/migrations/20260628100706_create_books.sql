-- migrate:up
CREATE TYPE book_status AS ENUM ('published', 'unpublished');

CREATE TABLE books (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  status book_status NOT NULL DEFAULT 'unpublished',
  slug VARCHAR(255),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  isbn13 CHAR(13),
  isbn10 CHAR(10),
  image_url TEXT,
  publish_year SMALLINT,
  publisher_id BIGINT REFERENCES publishers (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug)
);

-- migrate:down
DROP TABLE books;
DROP TYPE book_status;
