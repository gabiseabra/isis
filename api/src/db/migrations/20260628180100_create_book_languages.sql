-- migrate:up
CREATE TABLE languages (
  code CHAR(2) NOT NULL,
  "name" TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (code)
);

CREATE TABLE book_languages (
  book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  language_code CHAR(2) NOT NULL REFERENCES languages (code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, language_code)
);

-- migrate:down
DROP TABLE book_languages;
DROP TABLE languages;
