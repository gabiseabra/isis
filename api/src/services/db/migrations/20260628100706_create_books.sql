-- migrate:up
CREATE TABLE publishers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" TEXT NOT NULL,
  country_code CHAR(2) REFERENCES countries (code) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE books (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  isbn13 CHAR(13),
  isbn10 CHAR(10),
  image_url TEXT,
  publish_year SMALLINT,
  publisher_id BIGINT REFERENCES publishers (id) ON DELETE SET NULL,
  created_by BIGINT REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug)
);

-- migrate:down
DROP TABLE pulishers;
DROP TABLE books;
