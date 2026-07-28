-- migrate:up
ALTER TABLE books
  DROP CONSTRAINT books_created_by_fkey,
  DROP COLUMN created_by,
  ALTER COLUMN slug DROP NOT NULL;

-- migrate:down
ALTER TABLE books
  ADD COLUMN created_by BIGINT REFERENCES users (id) ON DELETE SET NULL;

UPDATE books
SET slug = 'book-' || id
WHERE slug IS NULL;

ALTER TABLE books
  ALTER COLUMN slug SET NOT NULL;
