-- migrate:up
/*
  jsonb_expression_match(input, expression)

  Minimal expression evaluator for JSONB documents.

  Expression language:
    path:eq:"abc"         string equality; JSON value must be a string
    path:like:"abc%"       string LIKE match; JSON value must be a string
    path:neq:"abc"        string inequality; JSON value must be a string
    path:num:123          numeric equality; JSON value must be a number
    path:lte:123          numeric <= comparison; JSON value must be a number
    path:json:{"a":1}     JSONB equality for any JSON value

    a && b                both expressions pass
    a || b                either expression passes
    (a && b) || c         parentheses group expressions

  Path syntax:
    a                     reads input #> '{a}'
    a.b.c                 reads input #> '{a,b,c}'

  Evaluation steps:
    1. Trim the expression.
    2. Remove one or more outer parenthesis pairs when they wrap the whole expression.
    3. Split on top-level || first, then top-level &&, ignoring operators inside
       strings, JSON objects/arrays, or nested parentheses.
    4. Recursively evaluate both sides of boolean operators.
    5. Parse a leaf expression as path:operator:literal.
    6. Read the JSONB value at path and perform a type-strict comparison.
*/
CREATE OR REPLACE FUNCTION jsonb_expression_match(input JSONB, expression TEXT)
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
  op TEXT;
  paren_depth INT;
  brace_depth INT;
  in_string BOOLEAN;
  escaped BOOLEAN;
  match TEXT[];
  path TEXT[];
  json_value JSONB;
  raw TEXT;
BEGIN
  -- Remove outer parentheses that wrap the entire expression.
  LOOP
    len := length(expr);
    EXIT WHEN len < 2 OR left(expr, 1) <> '(' OR right(expr, 1) <> ')';

    paren_depth := 0;
    brace_depth := 0;
    in_string := false;
    escaped := false;

    FOR i IN 1..len LOOP
      ch := substr(expr, i, 1);

      IF in_string THEN
        IF escaped THEN
          escaped := false;
        ELSIF ch = '\\' THEN
          escaped := true;
        ELSIF ch = '"' THEN
          in_string := false;
        END IF;
      ELSE
        IF ch = '"' THEN
          in_string := true;
        ELSIF ch = '{' THEN
          brace_depth := brace_depth + 1;
        ELSIF ch = '}' THEN
          brace_depth := brace_depth - 1;
        ELSIF brace_depth = 0 AND ch = '(' THEN
          paren_depth := paren_depth + 1;
        ELSIF brace_depth = 0 AND ch = ')' THEN
          paren_depth := paren_depth - 1;

          IF paren_depth = 0 AND i < len THEN
            EXIT;
          END IF;
        END IF;
      END IF;
    END LOOP;

    EXIT WHEN paren_depth <> 0 OR i < len;
    expr := btrim(substr(expr, 2, len - 2));
  END LOOP;

  -- Split boolean operators at top level. OR is lower precedence than AND.
  FOREACH op IN ARRAY ARRAY['||', '&&'] LOOP
    len := length(expr);
    paren_depth := 0;
    brace_depth := 0;
    in_string := false;
    escaped := false;

    FOR i IN 1..greatest(len - 1, 0) LOOP
      ch := substr(expr, i, 1);

      IF in_string THEN
        IF escaped THEN
          escaped := false;
        ELSIF ch = '\\' THEN
          escaped := true;
        ELSIF ch = '"' THEN
          in_string := false;
        END IF;
      ELSE
        IF paren_depth = 0 AND brace_depth = 0 AND substr(expr, i, 2) = op THEN
          IF op = '||' THEN
            RETURN jsonb_expression_match(input, substr(expr, 1, i - 1))
                OR jsonb_expression_match(input, substr(expr, i + 2));
          ELSE
            RETURN jsonb_expression_match(input, substr(expr, 1, i - 1))
               AND jsonb_expression_match(input, substr(expr, i + 2));
          END IF;
        END IF;

        IF ch = '"' THEN
          in_string := true;
        ELSIF ch = '{' THEN
          brace_depth := brace_depth + 1;
        ELSIF ch = '}' THEN
          brace_depth := brace_depth - 1;
        ELSIF brace_depth = 0 AND ch = '(' THEN
          paren_depth := paren_depth + 1;
        ELSIF brace_depth = 0 AND ch = ')' THEN
          paren_depth := paren_depth - 1;
        END IF;
      END IF;
    END LOOP;
  END LOOP;

  -- Parse and evaluate leaf expression: path:op:literal.
  match := regexp_match(expr, '^([^:\[\]\s()]+):(eq|like|neq|num|lte|json):(.+)$');

  IF match IS NULL THEN
    RAISE EXCEPTION 'Invalid jsonb expression: %', expression;
  END IF;

  path := string_to_array(match[1], '.');
  json_value := input #> path;
  op := match[2];
  raw := match[3];

  IF op = 'eq' THEN
    RETURN coalesce(jsonb_typeof(json_value) = 'string' AND json_value = raw::jsonb, false);
  ELSIF op = 'like' THEN
    RETURN coalesce(jsonb_typeof(json_value) = 'string' AND (json_value #>> '{}') LIKE (raw::jsonb #>> '{}'), false);
  ELSIF op = 'neq' THEN
    RETURN coalesce(jsonb_typeof(json_value) = 'string' AND json_value <> raw::jsonb, false);
  ELSIF op = 'num' THEN
    RETURN coalesce(jsonb_typeof(json_value) = 'number' AND (json_value #>> '{}')::numeric = raw::numeric, false);
  ELSIF op = 'lte' THEN
    RETURN coalesce(jsonb_typeof(json_value) = 'number' AND (json_value #>> '{}')::numeric <= raw::numeric, false);
  ELSIF op = 'json' THEN
    RETURN coalesce(json_value = raw::jsonb, false);
  END IF;

  RAISE EXCEPTION 'Unsupported jsonb expression operator: %', op;
END;
$$;

COMMENT ON FUNCTION jsonb_expression_match(JSONB, TEXT) IS
'Evaluates a small boolean expression language against a JSONB document. Supports &&, ||, parentheses, dot paths, and type-strict leaf operators eq, like, neq, num, lte, and json. String operators require JSON string values; number operators require JSON number values; json compares raw JSONB equality.';

-- migrate:down
DROP FUNCTION jsonb_expression_match(JSONB, TEXT);
