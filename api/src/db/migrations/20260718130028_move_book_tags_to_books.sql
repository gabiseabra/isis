-- migrate:up
ALTER TABLE books
  ADD COLUMN tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE books
SET tags = book_tags.tags
FROM (
  SELECT book_id, array_agg(tag ORDER BY tag)::TEXT[] AS tags
  FROM book_tags
  GROUP BY book_id
) book_tags
WHERE books.id = book_tags.book_id;

DROP TABLE book_tags;

-- migrate:down
CREATE TABLE book_tags (
  book_id BIGINT NOT NULL REFERENCES books (id) ON DELETE CASCADE,
  tag VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id, tag)
);

INSERT INTO book_tags (book_id, tag)
SELECT books.id, tags.tag
FROM books, unnest(books.tags) AS tags(tag);

ALTER TABLE books
  DROP COLUMN tags;
