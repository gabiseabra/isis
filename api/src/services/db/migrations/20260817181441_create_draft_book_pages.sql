-- migrate:up
CREATE TABLE draft_book_pages (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_book_uuid UUID NOT NULL REFERENCES draft_books (uuid),
  media_id BIGINT REFERENCES media_entries (id),
  page_id BIGINT REFERENCES book_pages (id),
  page_number INT,
  page_type VARCHAR(255),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_draft_book_pages_page_number ON draft_book_pages (page_number);

-- migrate:down
DROP TABLE draft_book_pages;
