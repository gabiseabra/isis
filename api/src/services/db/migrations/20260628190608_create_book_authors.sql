-- migrate:up
CREATE TABLE authors (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" TEXT NOT NULL,
  image_url TEXT,
  country_code CHAR(2) REFERENCES countries (code) ON DELETE SET NULL,
  birth_year SMALLINT,
  death_year SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE book_authors (
  book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES authors (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, author_id)
);

-- migrate:down

DROP TABLE book_authors;
DROP TABLE authors;