-- migrate:up
CREATE TABLE genres (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug)
);

CREATE TABLE book_genres (
  book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  genre_id BIGINT NOT NULL REFERENCES genres (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, genre_id)
);

-- migrate:down
DROP TABLE book_genres;
DROP TABLE genres;
