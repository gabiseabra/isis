-- migrate:up
CREATE TABLE countries (
  code CHAR(2) NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (code)
);

-- migrate:down
DROP TABLE countries;
