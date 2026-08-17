-- migrate:up
CREATE FUNCTION jsonb_query_match(input JSONB, expression TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $$
DECLARE
  expr TEXT := btrim(expression);
  len INT;
  i INT;
  ch TEXT;
  depth INT;
  brace INT;
  bracket INT;
  str BOOLEAN;
  esc BOOLEAN;
  op TEXT;
  m TEXT[];
  v JSONB;
  r JSONB;
  a TEXT;
  b TEXT;
BEGIN
  LOOP
    len := length(expr);
    EXIT WHEN len < 2 OR left(expr, 1) <> '(' OR right(expr, 1) <> ')';
    depth := 0; brace := 0; bracket := 0; str := false; esc := false;
    FOR i IN 1..len LOOP
      ch := substr(expr, i, 1);
      IF str THEN
        IF esc THEN esc := false; ELSIF ch = '\' THEN esc := true; ELSIF ch = '"' THEN str := false; END IF;
      ELSE
        IF ch = '"' THEN str := true;
        ELSIF ch = '{' THEN brace := brace + 1; ELSIF ch = '}' THEN brace := brace - 1;
        ELSIF ch = '[' THEN bracket := bracket + 1; ELSIF ch = ']' THEN bracket := bracket - 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = '(' THEN depth := depth + 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = ')' THEN depth := depth - 1; IF depth = 0 AND i < len THEN EXIT; END IF;
        END IF;
      END IF;
    END LOOP;
    EXIT WHEN depth <> 0 OR i < len;
    expr := btrim(substr(expr, 2, len - 2));
  END LOOP;

  FOREACH op IN ARRAY ARRAY[' or ', ' and '] LOOP
    depth := 0; brace := 0; bracket := 0; str := false; esc := false;
    FOR i IN 1..greatest(length(expr) - length(op) + 1, 0) LOOP
      ch := substr(expr, i, 1);
      IF str THEN
        IF esc THEN esc := false; ELSIF ch = '\' THEN esc := true; ELSIF ch = '"' THEN str := false; END IF;
      ELSE
        IF depth = 0 AND brace = 0 AND bracket = 0 AND substr(expr, i, length(op)) = op THEN
          IF op = ' or ' THEN
            RETURN jsonb_query_match(input, substr(expr, 1, i - 1)) OR jsonb_query_match(input, substr(expr, i + length(op)));
          END IF;
          RETURN jsonb_query_match(input, substr(expr, 1, i - 1)) AND jsonb_query_match(input, substr(expr, i + length(op)));
        END IF;
        IF ch = '"' THEN str := true;
        ELSIF ch = '{' THEN brace := brace + 1; ELSIF ch = '}' THEN brace := brace - 1;
        ELSIF ch = '[' THEN bracket := bracket + 1; ELSIF ch = ']' THEN bracket := bracket - 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = '(' THEN depth := depth + 1;
        ELSIF brace = 0 AND bracket = 0 AND ch = ')' THEN depth := depth - 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  m := regexp_match(expr, '^([A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)[[:space:]]*(!=|\^=|\$=|%=|>=|<=|#=|=|>|<)[[:space:]]*(.+)$');
  IF m IS NULL THEN RAISE EXCEPTION 'Invalid jsonb query expression: %', expression; END IF;
  v := input #> string_to_array(m[1], '.');
  op := m[2];
  r := m[3]::jsonb;

  IF op = '=' THEN RETURN coalesce(v = r, false); END IF;
  IF op = '!=' THEN RETURN coalesce(v <> r, false); END IF;
  IF op = '^=' THEN RETURN coalesce(jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND (v #>> '{}') LIKE replace(replace(replace(r #>> '{}', '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\', false); END IF;
  IF op = '$=' THEN RETURN coalesce(jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND (v #>> '{}') LIKE '%' || replace(replace(replace(r #>> '{}', '\', '\\'), '%', '\%'), '_', '\_') ESCAPE '\', false); END IF;
  IF op = '%=' THEN RETURN coalesce(jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND (v #>> '{}') LIKE '%' || replace(replace(replace(r #>> '{}', '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\', false); END IF;

  IF jsonb_typeof(v) = 'number' AND jsonb_typeof(r) = 'number' THEN
    IF op = '>' THEN RETURN (v #>> '{}')::numeric > (r #>> '{}')::numeric; END IF;
    IF op = '<' THEN RETURN (v #>> '{}')::numeric < (r #>> '{}')::numeric; END IF;
    IF op = '>=' THEN RETURN (v #>> '{}')::numeric >= (r #>> '{}')::numeric; END IF;
    IF op = '<=' THEN RETURN (v #>> '{}')::numeric <= (r #>> '{}')::numeric; END IF;
    IF op = '#=' THEN RETURN (v #>> '{}')::numeric = (r #>> '{}')::numeric; END IF;
  END IF;

  a := v #>> '{}'; b := r #>> '{}';
  IF jsonb_typeof(v) = 'string' AND jsonb_typeof(r) = 'string' AND a ~ '^\d{4}-\d{2}-\d{2}T' AND b ~ '^\d{4}-\d{2}-\d{2}T' THEN
    IF op = '>' THEN RETURN a::timestamptz > b::timestamptz; END IF;
    IF op = '<' THEN RETURN a::timestamptz < b::timestamptz; END IF;
    IF op = '>=' THEN RETURN a::timestamptz >= b::timestamptz; END IF;
    IF op = '<=' THEN RETURN a::timestamptz <= b::timestamptz; END IF;
    IF op = '#=' THEN RETURN a::timestamptz = b::timestamptz; END IF;
  END IF;

  RETURN false;
END;
$$;

-- migrate:down
DROP FUNCTION jsonb_query_match(JSONB, TEXT);
