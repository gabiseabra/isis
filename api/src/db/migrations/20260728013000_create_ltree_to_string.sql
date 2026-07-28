-- migrate:up
CREATE OR REPLACE FUNCTION ltree_to_string(path LTREE)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
  SELECT replace(path::TEXT, '.', '/');
$$;

CREATE OR REPLACE FUNCTION ltree_from_string(path TEXT)
RETURNS LTREE
LANGUAGE sql
IMMUTABLE
STRICT
PARALLEL SAFE
AS $$
  SELECT nullif(replace(path, '/', '.'), '')::LTREE;
$$;

-- migrate:down
DROP FUNCTION IF EXISTS ltree_to_string(LTREE);
DROP FUNCTION IF EXISTS ltree_from_string(TEXT);
