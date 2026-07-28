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

-- migrate:down
DROP FUNCTION IF EXISTS ltree_to_string(LTREE);
