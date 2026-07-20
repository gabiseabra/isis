-- migrate:up
CREATE EXTENSION ltree;

CREATE TABLE media_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id BIGINT REFERENCES media_entries (id),
  "name" TEXT NOT NULL,
  "slug" VARCHAR(255) NOT NULL,
  "path" LTREE NOT NULL,
  tags TEXT[] NOT NULL DEFAULT array[]::TEXT[],
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE FUNCTION set_media_entry_path()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  parent_path LTREE;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = NEW.slug::LTREE;
  ELSE
    SELECT "path" INTO parent_path
    FROM media_entries
    WHERE id = NEW.parent_id;

    NEW.path = parent_path || NEW.slug::LTREE;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.path <> OLD.path THEN
    UPDATE media_entries
    SET "path" = NEW.path || subpath("path", nlevel(OLD.path))
    WHERE "path" <@ OLD.path
      AND id <> OLD.id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER set_media_entry_path
BEFORE INSERT OR UPDATE OF parent_id, "slug"
ON media_entries
FOR EACH ROW
EXECUTE FUNCTION set_media_entry_path();

CREATE TABLE media_metadata (
  entry_id BIGINT NOT NULL REFERENCES media_entries (id),
  "name" varchar(255) NOT NULL,
  "value" JSONB,
  PRIMARY KEY (entry_id, "name")
);

-- migrate:down
DROP TRIGGER set_media_entry_path ON media_entries;
DROP FUNCTION set_media_entry_path();
DROP TABLE media_metadata;
DROP TABLE media_entries;
DROP EXTENSION ltree;
