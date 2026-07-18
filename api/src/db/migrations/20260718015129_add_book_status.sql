-- migrate:up
CREATE TYPE book_status AS ENUM ('published', 'unpublished');

ALTER TABLE books
  ADD COLUMN status book_status NOT NULL DEFAULT 'unpublished';

-- migrate:down
ALTER TABLE books
  DROP COLUMN status;

DROP TYPE book_status;
