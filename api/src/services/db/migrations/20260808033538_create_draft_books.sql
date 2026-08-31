-- migrate:up
CREATE TABLE draft_books (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id BIGINT REFERENCES books (id),
  title TEXT NOT NULL,
  slug VARCHAR(255),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  isbn VARCHAR,
  image_url TEXT,
  publish_year SMALLINT,
  publisher JSONB NOT NULL,
  authors JSONB NOT NULL,
  languages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)

-- migrate:down
DROP TABLE draft_books;
